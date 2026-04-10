"use client";

import { Note } from "@/services/noteService";
import { UserMediaItem, userMediaService } from "@/services/userMediaService";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Trash2, X, Hash, Plus, FileText, ChevronRight, Sparkles, Layout, Upload, Loader, Video, Images } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ConfirmModal from "@/components/ConfirmModal";
import { Timestamp } from "firebase/firestore";
import { githubUploadService } from "@/services/githubUploadService";
import { useAuth } from "@/context/AuthContext";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EditorProps {
  note: Note | null;
  notes: Note[];
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
}

// Convert stored content to HTML for contenteditable
function contentToHtml(content: string, media: Note['media']): string {
  if (!content) return '';
  const mediaMap = new Map((media || []).map(m => [m.id, m]));

  let html = content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');

  html = html.replace(/:::MEDIA:([^:]+):::/g, (_, id) => {
    const m = mediaMap.get(id);
    if (!m) return '';
    const inner = m.type === 'image'
      ? `<img src="${m.url}" alt="${m.name}" class="rounded-2xl shadow-lg max-w-full block" />`
      : `<video src="${m.url}" controls class="rounded-2xl shadow-lg block" style="width:320px;height:180px"></video>`;
    return `<div class="media-wrapper relative inline-block my-4 group" data-media-id="${m.id}" contenteditable="false">
      ${inner}
      <button class="media-delete-btn absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" data-delete-id="${m.id}" title="Xóa">✕</button>
    </div>`;
  });

  return html;
}

// Convert HTML from contenteditable back to stored content
function htmlToContent(html: string): string {
  return html
    .replace(/<div[^>]*data-media-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g, ':::MEDIA:$1:::')
    .replace(/<img[^>]*data-media-id="([^"]+)"[^>]*\/?>/g, ':::MEDIA:$1:::')
    .replace(/<video[^>]*data-media-id="([^"]+)"[^>]*>[\s\S]*?<\/video>/g, ':::MEDIA:$1:::')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

export default function Editor({ note, notes, onUpdate, onDelete, onCreate, onSelect }: EditorProps) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [newTag, setNewTag] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [userMedia, setUserMedia] = useState<UserMediaItem[]>([]);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);
  const lastNoteId = useRef<string | null>(null);

  // Subscribe to user's global media library
  useEffect(() => {
    if (!user) return;
    return userMediaService.subscribeToMedia(user.uid, setUserMedia);
  }, [user]);

  // Sync content into editor when switching notes
  useEffect(() => {
    if (!editorRef.current || !note) return;
    if (lastNoteId.current !== note.id) {
      lastNoteId.current = note.id!;
      editorRef.current.innerHTML = contentToHtml(note.content || '', note.media);
    }
  }, [note?.id]);

  // Re-render when media list changes (after upload)
  // Disabled: we insert directly into DOM on upload, no need to re-render
  // useEffect(() => { ... }, [note?.media]);

  const handleInput = useCallback(() => {
    if (!editorRef.current || !note || isComposing.current) return;
    const content = htmlToContent(editorRef.current.innerHTML);
    onUpdate(note.id!, { content });
  }, [note, onUpdate]);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    console.log('[Upload] triggered, files:', files?.length, files);
    if (!files || files.length === 0 || !note) {
      console.log('[Upload] aborted - files:', files, 'note:', note);
      return;
    }
    // Copy files to array BEFORE resetting input
    const fileList = Array.from(files);
    e.target.value = '';
    setIsUploadingMedia(true);
    console.log('[Upload] starting upload for', fileList.length, 'file(s)');
    try {
      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        console.log(`[Upload] file[${i}]:`, file.name, file.type, file.size, '| isImage:', isImage, 'isVideo:', isVideo);
        if (!isImage && !isVideo) { console.log('[Upload] skipped - not image/video'); continue; }
        try {
          console.log('[Upload] calling githubUploadService.uploadMedia...');
          const url = await githubUploadService.uploadMedia(file);
          console.log('[Upload] success, url:', url);
          const mediaId = `${Date.now()}-${i}`;

          // 1. Save to global user media library (usermedia collection)
          if (user) {
            const savedId = await userMediaService.addMedia(user.uid, {
              type: isImage ? 'image' : 'video',
              url,
              name: file.name,
              size: file.size,
            });
            console.log('[Upload] saved to usermedia, id:', savedId);
          }

          // 2. Save to note's media list
          const newItem = { type: isImage ? 'image' as const : 'video' as const, url, name: file.name, size: file.size, id: mediaId, uploadedAt: Timestamp.now() };
          const updatedMedia = [...(note.media || []), newItem];
          onUpdate(note.id!, { media: updatedMedia });

          // 2. Insert directly into editor at cursor
          if (editorRef.current) {
            editorRef.current.focus();
            const wrapper = buildMediaElement(mediaId, isImage ? 'image' : 'video', url, file.name);

            const sel = window.getSelection();
            if (sel && sel.rangeCount > 0) {
              const range = sel.getRangeAt(0);
              range.deleteContents();
              range.insertNode(wrapper);
              range.setStartAfter(wrapper);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            } else {
              editorRef.current.appendChild(wrapper);
            }

            const content = htmlToContent(editorRef.current.innerHTML);
            onUpdate(note.id!, { content });
            console.log('[Upload] inserted into editor, content saved');
          }
        } catch (err) {
          console.error('[Upload] error:', err);
          alert(`Lỗi upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } finally {
      setIsUploadingMedia(false);
      console.log('[Upload] done');
    }
  };

  // Insert media element at cursor position
  const insertMedia = (media: { id: string; type: string; url: string; name: string }) => {
    if (!editorRef.current || !note) return;
    editorRef.current.focus();

    const wrapper = buildMediaElement(media.id, media.type, media.url, media.name);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);
      range.setStartAfter(wrapper);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.appendChild(wrapper);
    }

    const content = htmlToContent(editorRef.current.innerHTML);
    onUpdate(note.id!, { content });
  };

  // Build a media wrapper DOM element with delete button
  const buildMediaElement = (id: string, type: string, url: string, name: string): HTMLElement => {
    const wrapper = document.createElement('div');
    wrapper.setAttribute('data-media-id', id);
    wrapper.setAttribute('contenteditable', 'false');
    wrapper.className = 'media-wrapper relative inline-block my-4 group';
    wrapper.style.display = 'block';

    if (type === 'image') {
      const img = document.createElement('img');
      img.src = url;
      img.alt = name;
      img.className = 'rounded-2xl shadow-lg max-w-full block';
      wrapper.appendChild(img);
    } else {
      const video = document.createElement('video');
      video.src = url;
      video.controls = true;
      video.className = 'rounded-2xl shadow-lg block';
      video.style.width = '320px';
      video.style.height = '180px';
      wrapper.appendChild(video);
    }

    const btn = document.createElement('button');
    btn.setAttribute('data-delete-id', id);
    btn.className = 'media-delete-btn absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-lg flex items-center justify-center shadow-lg';
    btn.style.opacity = '0';
    btn.style.transition = 'opacity 0.15s';
    btn.title = 'Xóa';
    btn.textContent = '✕';
    wrapper.appendChild(btn);

    // Show/hide delete button on hover
    wrapper.addEventListener('mouseenter', () => { btn.style.opacity = '1'; });
    wrapper.addEventListener('mouseleave', () => { btn.style.opacity = '0'; });

    return wrapper;
  };

  // Handle delete button clicks inside editor via event delegation
  const handleEditorClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const btn = (e.target as HTMLElement).closest('[data-delete-id]') as HTMLElement | null;
    if (!btn || !note) return;
    e.preventDefault();
    e.stopPropagation();
    const mediaId = btn.getAttribute('data-delete-id')!;
    // Remove wrapper from DOM
    const wrapper = editorRef.current?.querySelector(`[data-media-id="${mediaId}"]`);
    wrapper?.remove();
    // Save updated content
    const content = htmlToContent(editorRef.current!.innerHTML);
    const updatedMedia = (note.media || []).filter(m => m.id !== mediaId);
    onUpdate(note.id!, { content, media: updatedMedia });
  }, [note, onUpdate]);

  const removeMediaFromNote = useCallback((mediaId: string) => {
    if (!note || !editorRef.current) return;
    editorRef.current.querySelector(`[data-media-id="${mediaId}"]`)?.remove();
    const content = htmlToContent(editorRef.current.innerHTML);
    const updatedMedia = (note.media || []).filter(m => m.id !== mediaId);
    onUpdate(note.id!, { content, media: updatedMedia });
  }, [note, onUpdate]);

  // Insert media from global library into editor
  const insertMediaFromLibrary = (m: UserMediaItem) => {
    if (!editorRef.current || !note) return;
    editorRef.current.focus();

    const mediaId = `lib-${m.id}`;
    const wrapper = buildMediaElement(mediaId, m.type, m.url, m.name);

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(wrapper);
      range.setStartAfter(wrapper);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    } else {
      editorRef.current.appendChild(wrapper);
    }

    const alreadyInNote = (note.media || []).some(nm => nm.id === mediaId);
    if (!alreadyInNote) {
      const updatedMedia = [...(note.media || []), {
        id: mediaId, type: m.type, url: m.url, name: m.name, size: m.size, uploadedAt: Timestamp.now(),
      }];
      onUpdate(note.id!, { media: updatedMedia });
    }

    const content = htmlToContent(editorRef.current.innerHTML);
    onUpdate(note.id!, { content });
  };

  if (!note) {
    return (
      <div className="flex-1 flex flex-col p-6 sm:p-12 md:p-16 lg:p-24 bg-background transition-colors duration-300 min-h-full relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
          <Book size={400} />
        </div>
        <header className="mb-16 relative z-10">
          <div className="flex items-center gap-2 text-accent/40 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
            <Sparkles size={14} className="text-warning" />
            <span>{t('notes')}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-accent mb-4 tracking-tighter leading-tight">
            Tạo dựng <br />
            <span className="text-foreground/20 font-medium">Tri thức mới</span>
          </h2>
          <p className="text-foreground/40 font-semibold text-base max-w-md">Lưu giữ ý tưởng và bài học của bạn trong một không gian tối giản, tập trung.</p>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-16 relative z-10">
          <button onClick={onCreate} className="md:col-span-7 flex flex-col justify-between p-10 bg-accent text-background rounded-[32px] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all text-left group min-h-[240px]">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus size={28} />
            </div>
            <div>
              <p className="font-bold uppercase text-[11px] tracking-widest opacity-60 mb-2">Bắt đầu ngay</p>
              <h3 className="text-2xl font-bold tracking-tight">Viết ghi chú mới</h3>
            </div>
          </button>
          <div className="md:col-span-5 flex flex-col justify-between p-10 bg-card border border-border-notion rounded-[32px] shadow-soft min-h-[240px]">
            <div className="w-14 h-14 bg-active-notion rounded-2xl flex items-center justify-center text-accent/30">
              <Layout size={28} />
            </div>
            <div>
              <p className="font-bold uppercase text-[11px] tracking-widest text-foreground/20 mb-2">Thư viện của bạn</p>
              <h3 className="text-3xl font-extrabold text-accent">{notes.length} <span className="text-lg font-bold text-foreground/30 ml-1">Ghi chú</span></h3>
            </div>
          </div>
        </div>
        {notes.length > 0 && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 relative z-10">
            <div className="flex items-center justify-between mb-8 px-2">
              <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/20">Ghi chú gần đây</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.slice(0, 6).map((n, i) => (
                <motion.button key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} onClick={() => onSelect(n.id!)} className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-sm border border-border-notion rounded-2xl hover:border-accent/10 hover:shadow-xl hover:shadow-accent/5 transition-all group text-left">
                  <div className="w-10 h-10 bg-active-notion rounded-xl flex items-center justify-center text-accent/20 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                    <FileText size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-accent truncate">{n.title || t('untitled')}</h4>
                    <p className="text-[10px] font-semibold text-foreground/20 uppercase tracking-wider mt-0.5 truncate">{n.subject || "No Subject"}</p>
                  </div>
                  <ChevronRight size={16} className="text-foreground/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
                </motion.button>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card lg:rounded-l-[32px] shadow-2xl relative overflow-hidden transition-colors duration-300">
      <ConfirmModal
        open={confirmOpen}
        message="Ghi chú này sẽ bị xóa vĩnh viễn khỏi thư viện của bạn."
        onConfirm={() => { onDelete(note.id!); setConfirmOpen(false); }}
        onCancel={() => setConfirmOpen(false)}
      />

      {/* Toolbar */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-border-notion bg-card/60 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-3">
          {/* Upload new */}
          <label className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer select-none",
            isUploadingMedia ? "border-accent/20 text-accent/40 cursor-not-allowed" : "border-accent/30 text-accent hover:bg-accent/10 hover:border-accent/60 active:scale-95"
          )}>
            {isUploadingMedia ? <><Loader size={16} className="animate-spin" /><span>Đang upload...</span></> : <><Upload size={16} /><span>Upload mới</span></>}
            <input type="file" multiple accept="image/*,video/*" onChange={handleMediaUpload} disabled={isUploadingMedia} className="hidden" />
          </label>

          {/* Open media library */}
          <button
            onClick={() => setShowMediaLibrary(v => !v)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all select-none",
              showMediaLibrary ? "border-accent bg-accent/10 text-accent" : "border-border-notion text-foreground/40 hover:text-accent hover:border-accent/30"
            )}
          >
            <Images size={16} />
            <span>Kho media {userMedia.length > 0 && `(${userMedia.length})`}</span>
          </button>

          {isUploadingMedia && <span className="text-[11px] text-accent/50 font-medium animate-pulse">Đang nén và tải lên...</span>}
        </div>
        <button onClick={() => setConfirmOpen(true)} className="p-3 text-foreground/10 hover:text-error hover:bg-error/10 rounded-2xl transition-all active:scale-90">
          <Trash2 size={18} />
        </button>
      </div>

      {/* Media Library Panel */}
      <AnimatePresence>
        {showMediaLibrary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border-notion bg-active-notion/30"
          >
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3">Kho media — click để chèn vào ghi chú</p>
              {userMedia.length === 0 ? (
                <p className="text-sm text-foreground/30 py-4 text-center">Chưa có media nào. Upload để bắt đầu.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto">
                  {userMedia.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group rounded-xl overflow-hidden border border-border-notion hover:border-accent/50 cursor-pointer aspect-square"
                      onClick={() => { insertMediaFromLibrary(m); setShowMediaLibrary(false); }}
                    >
                      {m.type === 'image' ? (
                        <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-active-notion flex flex-col items-center justify-center gap-1">
                          <Video size={20} className="text-accent/40" />
                          <span className="text-[9px] text-foreground/30 px-1 truncate w-full text-center">{m.name}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Plus size={20} className="text-white drop-shadow" />
                      </div>
                      {/* Delete from library */}
                      <button
                        onClick={(e) => { e.stopPropagation(); userMediaService.deleteMedia(m.id!); }}
                        className="absolute top-1 right-1 p-0.5 bg-error text-white rounded-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 lg:px-24 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {note.subject && (
              <span className="px-3 py-1.5 bg-active-notion text-accent/60 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-border-notion">
                📚 {note.subject}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              {note.tags?.map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-accent/5 text-accent/70 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-accent/10">
                  <Hash size={10} className="opacity-30" />{tag}
                  <button onClick={() => onUpdate(note.id!, { tags: note.tags.filter(t => t !== tag) })} className="hover:text-error transition-colors ml-1 p-0.5">
                    <X size={10} />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && newTag) { onUpdate(note.id!, { tags: [...(note.tags || []), newTag] }); setNewTag(""); } }}
                className="bg-active-notion/40 border-none rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent/20 w-28 transition-all placeholder:text-foreground/20 text-accent"
                placeholder={`+ ${t('add_tag')}`}
              />
            </div>
          </div>

          {/* Title */}
          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdate(note.id!, { title: e.target.value })}
            className="w-full text-4xl md:text-6xl font-extrabold text-accent outline-none placeholder:text-foreground/5 bg-transparent mb-12 tracking-tighter leading-tight"
            placeholder={t('untitled')}
          />

          {/* Contenteditable - text + media inline, no markers shown */}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onCompositionStart={() => { isComposing.current = true; }}
            onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
            onClick={handleEditorClick}
            className="w-full min-h-[500px] mb-10 text-lg md:text-xl text-accent/70 leading-[1.8] outline-none font-medium bg-transparent selection:bg-accent/10 selection:text-accent empty:before:content-[attr(data-placeholder)] empty:before:text-foreground/10 empty:before:pointer-events-none"
            data-placeholder={t('content_placeholder')}
          />

          {/* Media library */}
          {note.media && note.media.length > 0 && (
            <div className="mb-20 p-6 bg-active-notion/20 rounded-2xl border border-border-notion">
              <h3 className="font-bold text-accent text-sm mb-4">Thư viện Media ({note.media.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {note.media.map((media) => (
                  <motion.div key={media.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative group rounded-xl overflow-hidden border border-border-notion hover:border-accent/30 transition-all">
                    {media.type === 'image' ? (
                      <img src={media.url} alt={media.name} className="w-full h-24 object-cover" />
                    ) : (
                      <div className="w-full h-24 bg-active-notion flex items-center justify-center">
                        <Video size={24} className="text-accent/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={() => insertMedia(media)} className="p-1.5 bg-success text-background rounded-lg hover:scale-110 transition-transform" title="Chèn vào ghi chú">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeMediaFromNote(media.id)} className="p-1.5 bg-error text-background rounded-lg hover:scale-110 transition-transform" title="Xóa khỏi ghi chú">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-white text-[10px] font-semibold truncate">{media.name}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
