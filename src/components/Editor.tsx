"use client";

import { Note } from "@/services/noteService";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Trash2, Eye, Edit3, X, Hash, Plus, FileText, ChevronRight, Sparkles, Layout } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useLanguage } from "@/context/LanguageContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import ConfirmModal from "@/components/ConfirmModal";

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

export default function Editor({ note, notes, onUpdate, onDelete, onCreate, onSelect }: EditorProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [newTag, setNewTag] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (!note) {
    return (
      <div className="flex-1 flex flex-col p-6 sm:p-12 md:p-16 lg:p-24 bg-background transition-colors duration-300 min-h-full relative overflow-hidden">
        {/* Background Decoration */}
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
           <button 
             onClick={onCreate}
             className="md:col-span-7 flex flex-col justify-between p-10 bg-accent text-background rounded-[32px] shadow-2xl hover:scale-[1.01] active:scale-95 transition-all text-left group min-h-[240px]"
           >
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
              <button className="text-[10px] font-bold text-foreground/30 hover:text-accent transition-colors">Xem thư viện</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {notes.slice(0, 6).map((n, i) => (
                 <motion.button 
                   key={n.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: i * 0.05 }}
                   onClick={() => onSelect(n.id!)}
                   className="flex items-center gap-4 p-5 bg-card/50 backdrop-blur-sm border border-border-notion rounded-2xl hover:border-accent/10 hover:shadow-xl hover:shadow-accent/5 transition-all group text-left"
                 >
                    <div className="w-10 h-10 bg-active-notion rounded-xl flex items-center justify-center text-accent/20 group-hover:text-accent group-hover:bg-accent/5 transition-all">
                       <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                       <h4 className="font-bold text-accent truncate">{n.title || t('untitled')}</h4>
                       <p className="text-[10px] font-semibold text-foreground/20 uppercase tracking-wider mt-0.5 truncate">
                          {n.subject || "No Subject"}
                       </p>
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
      
      {/* Editor Toolbar */}
      <div className="h-20 px-8 flex items-center justify-between border-b border-border-notion bg-card/60 backdrop-blur-2xl sticky top-0 z-20">
        <div className="flex items-center gap-2 p-1 bg-active-notion/50 rounded-2xl border border-border-notion">
          <TabButton 
            active={activeTab === "edit"} 
            onClick={() => setActiveTab("edit")} 
            icon={<Edit3 size={15} />} 
            label={t('edit_mode')} 
          />
          <TabButton 
            active={activeTab === "preview"} 
            onClick={() => setActiveTab("preview")} 
            icon={<Eye size={15} />} 
            label={t('preview_mode')} 
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setConfirmOpen(true)}
            className="p-3 text-foreground/10 hover:text-error hover:bg-error/10 rounded-2xl transition-all active:scale-90"
            title="Xóa ghi chú"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 md:p-16 lg:px-24 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center gap-3 mb-12">
            {note.subject && (
              <span className="px-3 py-1.5 bg-active-notion text-accent/60 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-border-notion">
                📚 {note.subject}
              </span>
            )}
            <div className="flex flex-wrap gap-2">
              {note.tags?.map((tag) => (
                <span key={tag} className="flex items-center gap-2 bg-accent/5 text-accent/70 px-3 py-1.5 rounded-xl text-[10px] font-bold border border-accent/10">
                  <Hash size={10} className="opacity-30" />
                  {tag}
                  <button 
                    onClick={() => onUpdate(note.id!, { tags: note.tags.filter(t => t !== tag) })}
                    className="hover:text-error transition-colors ml-1 p-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              <div className="relative">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newTag) {
                      onUpdate(note.id!, { tags: [...(note.tags || []), newTag] });
                      setNewTag("");
                    }
                  }}
                  className="bg-active-notion/40 border-none rounded-xl px-3 py-1.5 text-[10px] font-bold outline-none focus:ring-1 focus:ring-accent/20 w-28 transition-all placeholder:text-foreground/20 text-accent"
                  placeholder={`+ ${t('add_tag')}`}
                />
              </div>
            </div>
          </div>

          <input
            type="text"
            value={note.title}
            onChange={(e) => onUpdate(note.id!, { title: e.target.value })}
            className="w-full text-4xl md:text-6xl font-extrabold text-accent outline-none placeholder:text-foreground/5 bg-transparent mb-12 tracking-tighter leading-tight"
            placeholder={t('untitled')}
          />
          
          <div className="min-h-[600px] mb-20 whitespace-pre-wrap">
             <AnimatePresence mode="wait">
                {activeTab === "edit" ? (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full"
                  >
                    <textarea
                      value={note.content}
                      onChange={(e) => onUpdate(note.id!, { content: e.target.value })}
                      className="w-full h-full min-h-[600px] text-lg md:text-xl text-accent/70 dark:text-foreground/60 leading-[1.8] outline-none resize-none placeholder:text-foreground/5 font-medium bg-transparent selection:bg-accent/10 selection:text-accent"
                      placeholder={t('content_placeholder')}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-slate dark:prose-invert lg:prose-xl max-w-none 
                     prose-headings:font-extrabold prose-headings:text-accent prose-headings:tracking-tighter prose-headings:mb-6
                     prose-p:text-accent/70 dark:prose-p:text-foreground/60 prose-p:leading-[1.8] prose-p:mb-6
                     prose-strong:text-accent dark:prose-strong:text-white prose-strong:font-bold
                     prose-code:bg-active-notion prose-code:text-accent prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none prose-code:font-medium prose-code:text-[0.9em]
                     prose-blockquote:border-l-4 prose-blockquote:border-accent/10 dark:prose-blockquote:border-white/10 prose-blockquote:bg-active-notion/50 prose-blockquote:px-8 prose-blockquote:py-2 prose-blockquote:rounded-r-2xl prose-blockquote:italic prose-blockquote:text-accent/60
                     prose-li:text-accent/70 prose-li:my-1
                     prose-img:rounded-3xl prose-img:shadow-2xl
                    "
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {note.content || `*${t('content_placeholder')}...*`}
                    </ReactMarkdown>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-bold transition-all active:scale-95 uppercase tracking-widest", 
        active 
          ? "bg-card text-accent shadow-lg shadow-accent/5 scale-105" 
          : "text-foreground/30 hover:text-accent/60"
      )}
    >
      <span className={cn("transition-colors", active ? "text-accent" : "text-foreground/20")}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
