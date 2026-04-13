"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { flashcardService, Flashcard, FlashcardSet } from "@/services/flashcardService";
import { Plus, Trash2, BookOpen, Layers, History, Play, CheckCircle2, XCircle, ChevronRight, Search, FileUp, Edit3, Sparkles, Brain, Puzzle, PenLine, LayoutGrid, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { subjects } from "@/context/LanguageContext";
import { Timestamp } from "firebase/firestore";
import { auth } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";
import PageShell from "./PageShell";
import dynamic from "next/dynamic";

const MatchGame   = dynamic(() => import("@/components/MatchGame"),   { ssr: false });
const WriteMode   = dynamic(() => import("@/components/WriteMode"),   { ssr: false });
const SortingGame = dynamic(() => import("@/components/SortingGame"), { ssr: false });
const BlastGame   = dynamic(() => import("@/components/BlastGame"),   { ssr: false });

export default function FlashcardManager() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [editingSet, setEditingSet] = useState<FlashcardSet | null>(null);
  const [activeView, setActiveView] = useState<"list" | "review" | "match" | "write" | "sort" | "blast">("list");
  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; onConfirm: () => void }>({ open: false, onConfirm: () => {} });
  
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [newSetSubject, setNewSetSubject] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [editingCardIdx, setEditingCardIdx] = useState<number | null>(null);

  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const unsub = flashcardService.subscribeToSets(user.uid, setSets);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (editingSet) {
      const updated = sets.find(s => s.id === editingSet.id);
      if (updated) setEditingSet(updated);
    }
  }, [sets, editingSet?.id]);

  const handleCreateSet = async () => {
    if (!user || !newSetTitle || !newSetSubject) return;
    await flashcardService.createSet(user.uid, newSetTitle, newSetDescription, newSetSubject, user.displayName || "Gia sư AI");
    setNewSetTitle("");
    setNewSetDescription("");
    setNewSetSubject("");
    setIsCreatingSet(false);
  };

  const handleTogglePublic = async (setId: string, currentStatus: boolean) => {
    if (!user) return;
    await flashcardService.togglePublicSet(user.uid, setId, !currentStatus);
  };

  const handleSaveCard = async () => {
    if (!user || !editingSet || !front || !back) return;
    
    let updatedCards = [...editingSet.cards];
    const newCard: Flashcard = {
      front,
      back,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Timestamp.now(),
      userId: user.uid,
      tags: [],
      subject: editingSet.subject || "Khác"
    };

    if (editingCardIdx !== null) {
      updatedCards[editingCardIdx] = { 
        ...updatedCards[editingCardIdx], 
        front, 
        back,
        userId: updatedCards[editingCardIdx].userId || user.uid,
        tags: updatedCards[editingCardIdx].tags || [],
        subject: updatedCards[editingCardIdx].subject || editingSet.subject || "Khác"
      };
    } else {
      updatedCards.push(newCard);
    }

    await flashcardService.updateCardsInSet(user.uid, editingSet.id!, updatedCards);
    resetCardForm();
  };

  const handleDeleteCard = async (idx: number) => {
    if (!user || !editingSet) return;
    setConfirmDelete({
      open: true,
      onConfirm: async () => {
        const updatedCards = editingSet.cards.filter((_, i) => i !== idx);
        await flashcardService.updateCardsInSet(user.uid, editingSet.id!, updatedCards);
        setConfirmDelete({ open: false, onConfirm: () => {} });
      }
    });
  };

  const resetCardForm = () => {
    setFront("");
    setBack("");
    setEditingCardIdx(null);
    setIsAddingCard(false);
  };

  if (activeView === "review" && editingSet) {
    return <FlashcardReview set={editingSet} onExit={() => setActiveView("list")} />;
  }

  if (activeView === "match" && editingSet) {
    return <PageShell><div className="max-w-3xl mx-auto"><MatchGame set={editingSet} onExit={() => setActiveView("list")} /></div></PageShell>;
  }
  if (activeView === "write" && editingSet) {
    return <PageShell><WriteMode set={editingSet} onExit={() => setActiveView("list")} /></PageShell>;
  }
  if (activeView === "sort" && editingSet) {
    return <PageShell><SortingGame set={editingSet} onExit={() => setActiveView("list")} /></PageShell>;
  }
  if (activeView === "blast" && editingSet) {
    return <PageShell><BlastGame set={editingSet} onExit={() => setActiveView("list")} /></PageShell>;
  }

  return (
    <PageShell>
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete({ open: false, onConfirm: () => {} })}
      />
      
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12 md:mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-accent/40 font-bold uppercase text-[10px] tracking-[0.3em]">
                <Brain size={14} className="text-warning" />
                <span>{t('flashcards_title')}</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-accent tracking-tighter leading-tight">
                {editingSet ? editingSet.title : "Không gian ghi nhớ"}
              </h1>
            </div>
            {editingSet && editingSet.cards.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setActiveView("write")}
                  className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-accent hover:text-background transition-all">
                  <PenLine size={14} /> Viết
                </button>
                <button onClick={() => setActiveView("match")}
                  className="flex items-center gap-2 bg-warning/10 text-warning border border-warning/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-warning hover:text-background transition-all">
                  <Puzzle size={14} /> Match
                </button>
                <button onClick={() => setActiveView("sort")}
                  className="flex items-center gap-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-purple-500 hover:text-background transition-all">
                  <LayoutGrid size={14} /> Khối hộp
                </button>
                <button onClick={() => setActiveView("blast")}
                  className="flex items-center gap-2 bg-error/10 text-error border border-error/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-error hover:text-background transition-all">
                  <Zap size={14} /> Blast
                </button>
                <button onClick={() => setActiveView("review")}
                  className="flex items-center gap-3 bg-accent text-background px-6 py-2.5 rounded-xl text-xs font-bold shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <Play size={14} fill="currentColor" /> Ôn luyện
                </button>
              </div>
            )}
          </div>
          
          {editingSet ? (
            <button 
              onClick={() => setEditingSet(null)}
              className="flex items-center gap-2 text-foreground/40 hover:text-accent font-bold uppercase text-[10px] tracking-widest transition-all group"
            >
              <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
              Quay lại danh sách bộ thẻ
            </button>
          ) : (
            <p className="text-foreground/40 font-semibold text-base max-w-md">{t('flashcards_desc')}</p>
          )}
        </header>

        {editingSet ? (
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                Thẻ đang có ({editingSet.cards.length})
              </h2>
              <button 
                onClick={() => setIsAddingCard(true)}
                className="flex items-center gap-2 bg-active-notion text-accent px-5 py-2.5 rounded-xl text-xs font-bold border border-border-notion hover:bg-accent/5 transition-all"
              >
                <Plus size={18} />
                Thêm thẻ mới
              </button>
            </div>

            {isAddingCard && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-10 glass rounded-[32px] shadow-2xl border-border-notion/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-4">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30">Mặt trước (Câu hỏi)</label>
                    <textarea 
                      value={front} 
                      onChange={(e) => setFront(e.target.value)}
                      className="w-full p-6 bg-active-notion/40 border-none rounded-2xl outline-none font-medium text-accent text-lg placeholder:text-foreground/10 focus:ring-1 focus:ring-accent/10 transition-all" 
                      placeholder="Nhập câu hỏi hoặc thuật ngữ..."
                      rows={4}
                    />
                  </div>
                  <div className="space-y-4">
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30">Mặt sau (Đáp án)</label>
                    <textarea 
                      value={back} 
                      onChange={(e) => setBack(e.target.value)}
                      className="w-full p-6 bg-active-notion/40 border-none rounded-2xl outline-none font-medium text-accent text-lg placeholder:text-foreground/10 focus:ring-1 focus:ring-accent/10 transition-all" 
                      placeholder="Nhập đáp án hoặc định nghĩa..."
                      rows={4}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4">
                  <button onClick={resetCardForm} className="px-6 py-2 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">{t('cancel')}</button>
                  <button onClick={handleSaveCard} className="bg-accent text-background px-10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl hover:opacity-90 transition-all">
                    {editingCardIdx !== null ? 'Cập nhật thẻ' : 'Lưu thẻ ghi nhớ'}
                  </button>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {editingSet.cards.map((card, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group p-8 bg-card/40 backdrop-blur-sm border border-border-notion rounded-3xl hover:border-accent/10 hover:shadow-2xl hover:shadow-accent/5 transition-all relative overflow-hidden"
                >
                  <div className="mb-6 h-28 overflow-hidden">
                    <p className="font-bold text-accent text-xl mb-3 line-clamp-2">{card.front}</p>
                    <p className="text-foreground/40 text-sm font-medium line-clamp-2">{card.back}</p>
                  </div>
                  <div className="flex items-center justify-between border-t border-border-notion/50 pt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/20">
                        {card.nextReview.toDate().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => {
                          setFront(card.front);
                          setBack(card.back);
                          setEditingCardIdx(idx);
                          setIsAddingCard(true);
                        }}
                        className="p-2.5 bg-active-notion text-accent/40 hover:text-accent rounded-xl border border-border-notion transition-all"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteCard(idx)}
                        className="p-2.5 bg-error/5 text-error/40 hover:text-error rounded-xl border border-error/10 transition-all"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
              {editingSet.cards.length === 0 && (
                <div className="col-span-full py-24 text-center bg-active-notion/10 border-2 border-dashed border-border-notion rounded-[40px]">
                  <p className="text-foreground/20 font-bold uppercase text-[11px] tracking-widest">Bộ thẻ này đang trống</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <section>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
              <h2 className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.3em]">Thư viện bộ thẻ ({sets.length})</h2>
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="px-5 py-2.5 bg-card/60 backdrop-blur-md text-foreground border border-border-notion rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-accent/10 transition-all"
                >
                  <option value="" className="bg-card text-foreground">Tất cả môn</option>
                  {subjects.map(s => (
                    <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                  ))}
                </select>
                <button
                  onClick={() => setIsCreatingSet(true)}
                  className="flex items-center gap-2 bg-accent text-background px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-all shadow-xl shadow-accent/5"
                >
                  <Plus size={18} />
                  Tạo bộ thẻ
                </button>
              </div>
            </div>

            {isCreatingSet && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mb-12 p-10 glass rounded-[40px] shadow-2xl border-border-notion/50">
                <div className="max-w-2xl">
                  <input 
                    value={newSetTitle} 
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    className="w-full p-4 bg-active-notion/40 border-none rounded-2xl mb-4 outline-none font-extrabold text-accent text-2xl placeholder:text-foreground/10" 
                    placeholder="Tên bộ thẻ học tập..."
                  />
                  <textarea 
                    value={newSetDescription} 
                    onChange={(e) => setNewSetDescription(e.target.value)}
                    className="w-full p-4 bg-active-notion/40 border-none rounded-2xl mb-4 outline-none font-medium text-accent text-lg placeholder:text-foreground/10" 
                    placeholder="Mô tả ngắn gọn về kiến thức..."
                    rows={2}
                  />
                  <select
                    value={newSetSubject}
                    onChange={(e) => setNewSetSubject(e.target.value)}
                    className="w-full p-4 bg-active-notion/40 text-foreground border-none rounded-2xl mb-8 outline-none font-bold"
                  >
                    <option value="" className="bg-card text-foreground">Chọn môn học</option>
                    {subjects.map(s => (
                      <option key={s} value={s} className="bg-card text-foreground">{s}</option>
                    ))}
                  </select>
                  <div className="flex justify-end gap-4 pt-4 border-t border-border-notion/50">
                    <button onClick={() => setIsCreatingSet(false)} className="px-6 py-2 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">{t('cancel')}</button>
                    <button onClick={handleCreateSet} className="bg-accent text-background px-12 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl">Tạo ngay</button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sets.filter(set => !selectedSubject || set.subject === selectedSubject).map((set) => (
                <motion.div 
                  key={set.id}
                  whileHover={{ y: -8 }}
                  className="group bg-card/40 backdrop-blur-sm border border-border-notion rounded-[32px] p-8 hover:shadow-2xl hover:shadow-accent/5 transition-all relative overflow-hidden"
                >
                  {/* Subtle color accent based on subject */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-[0.03] group-hover:opacity-[0.08] rounded-full -mr-16 -mt-16 transition-opacity" />
                  
                  <div className="flex-1 cursor-pointer" onClick={() => setEditingSet(set)}>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-accent/40 uppercase tracking-[0.2em] mb-3">
                      <span>📚 {set.subject}</span>
                    </div>
                    <h3 className="font-extrabold text-2xl text-accent mb-3 tracking-tight group-hover:text-accent/80 transition-colors">{set.title}</h3>
                    <p className="text-foreground/40 text-sm font-medium mb-10 line-clamp-2 h-10 leading-relaxed">{set.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="px-4 py-1.5 glass bg-accent/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/70 border border-accent/10">
                        {set.cards.length} cards
                      </div>
                      <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTogglePublic(set.id!, !!set.isPublic); }}
                          className={cn(
                            "p-3 rounded-xl transition-all border",
                            set.isPublic ? "bg-accent text-background border-accent" : "bg-active-notion text-accent/40 border-border-notion"
                          )}
                        >
                          <BookOpen size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setEditingSet(set); setActiveView("review"); }}
                          className="p-3 bg-success/10 text-success rounded-xl border border-success/10 hover:bg-success hover:text-background transition-all"
                          title="Ôn luyện"
                        >
                          <Play size={16} fill="currentColor" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSet(set); setActiveView("write"); }}
                          className="p-3 bg-accent/10 text-accent rounded-xl border border-accent/10 hover:bg-accent hover:text-background transition-all" title="Write">
                          <PenLine size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSet(set); setActiveView("match"); }}
                          className="p-3 bg-warning/10 text-warning rounded-xl border border-warning/10 hover:bg-warning hover:text-background transition-all" title="Match">
                          <Puzzle size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSet(set); setActiveView("sort"); }}
                          className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/10 hover:bg-purple-500 hover:text-background transition-all" title="Khối hộp">
                          <LayoutGrid size={16} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingSet(set); setActiveView("blast"); }}
                          className="p-3 bg-error/10 text-error rounded-xl border border-error/10 hover:bg-error hover:text-background transition-all" title="Blast">
                          <Zap size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setConfirmDelete({
                            open: true,
                            onConfirm: async () => {
                              await flashcardService.deleteSet(user!.uid, set.id!);
                              setConfirmDelete({ open: false, onConfirm: () => {} });
                            }
                          }); }}
                          className="p-3 bg-error/5 text-error rounded-xl border border-error/10 hover:bg-error hover:text-background transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function FlashcardReview({ set, onExit }: { set: FlashcardSet, onExit: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  
  const [reviewCards, setReviewCards] = useState<Flashcard[]>(() => {
    return [...set.cards].sort((a, b) => a.nextReview.toMillis() - b.nextReview.toMillis());
  });

  const card = reviewCards[currentIdx];

  const handleReview = async (quality: number) => {
    if (!user) return;
    
    const updates = flashcardService.calculateNextReview(card, quality);
    const updatedCard = { ...card, ...updates };

    const updatedAllCards = [...set.cards];
    const originalIdx = updatedAllCards.findIndex(c => c.front === card.front && c.back === card.back);
    if (originalIdx !== -1) {
      updatedAllCards[originalIdx] = updatedCard;
      await flashcardService.updateCardsInSet(user.uid, set.id!, updatedAllCards);
    }

    if (currentIdx < reviewCards.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setIsFlipped(false);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="w-20 h-20 bg-success/10 text-success rounded-[24px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-success/10 border border-success/20">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-4xl font-extrabold text-accent mb-4 tracking-tighter">Hoàn thành buổi học!</h2>
          <p className="text-foreground/40 font-medium mb-12 max-w-sm mx-auto">Bạn đã ôn tập xong bộ thẻ "{set.title}". Kiến thức đã được khắc sâu thêm một bước.</p>
          <button onClick={onExit} className="bg-accent text-background px-12 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Về thư viện</button>
        </motion.div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
          <div className="w-16 h-16 bg-active-notion rounded-2xl flex items-center justify-center mx-auto mb-6 text-accent/20">
            <Layers size={32} />
          </div>
          <p className="text-accent text-xl font-bold mb-6">Không có thẻ nào để ôn tập!</p>
          <button onClick={onExit} className="bg-accent text-background px-8 py-3 rounded-xl font-bold transition-all hover:scale-105">Quay lại</button>
        </motion.div>
      </div>
    );
  }

  return (
    <PageShell>
      <div className="flex flex-col flex-1 h-screen bg-background relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="h-24 px-10 flex items-center justify-between bg-card/40 backdrop-blur-2xl border-b border-border-notion relative z-10">
        <div className="flex items-center gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/40 mb-2">Tiến độ buổi học</span>
            <div className="flex items-center gap-4">
              <div className="w-64 h-2 bg-active-notion/50 rounded-full overflow-hidden border border-border-notion shadow-inner">
                <motion.div 
                  className="h-full bg-accent transition-all duration-700 ease-out" 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIdx + 1)/reviewCards.length)*100}%` }} 
                />
              </div>
              <span className="text-xs font-bold text-accent/60">{currentIdx + 1} <span className="text-foreground/20">/</span> {reviewCards.length}</span>
            </div>
          </div>
        </div>
        <button onClick={onExit} className="p-3 text-foreground/20 hover:text-error hover:bg-error/5 rounded-2xl transition-all"><XCircle size={28} /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className="w-full max-w-2xl aspect-[4/3] relative perspective-2000 cursor-pointer"
        >
          <motion.div 
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-full h-full preserve-3d relative"
          >
            {/* Front Side */}
            <div 
              className="absolute inset-0 backface-hidden bg-card border-2 border-border-notion rounded-[48px] shadow-2xl flex flex-col items-center justify-center p-16 text-center overflow-hidden"
              style={{ transform: "rotateY(0deg)" }}
            >
               <div className="absolute top-10 left-12 text-[11px] font-bold uppercase tracking-[0.3em] text-foreground/10">Câu hỏi</div>
               <h3 className="text-3xl md:text-5xl font-extrabold text-accent leading-tight tracking-tight">{card.front}</h3>
               <div className="absolute bottom-10 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-foreground/20 animate-pulse">
                 Chạm để lật thẻ
               </div>
            </div>
            
            {/* Back Side */}
            <div 
              className="absolute inset-0 backface-hidden bg-accent border-2 border-accent rounded-[48px] shadow-2xl flex flex-col items-center justify-center p-16 text-center overflow-hidden"
              style={{ transform: "rotateY(180deg)" }}
            >
               <div className="absolute top-10 left-12 text-[11px] font-bold uppercase tracking-[0.3em] text-background/20">Đáp án</div>
               <h3 className="text-3xl md:text-5xl font-extrabold text-background leading-tight tracking-tight">{card.back}</h3>
            </div>
          </motion.div>
        </div>

        <div className="mt-16 w-full max-w-2xl">
          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-4 gap-4"
              >
                {[
                  { q: 1, color: "bg-error/10 text-error border-error/20", label: "Quá khó", icon: "😫" },
                  { q: 3, color: "bg-warning/10 text-warning border-warning/20", label: "Tàm tạm", icon: "😐" },
                  { q: 4, color: "bg-success/10 text-success border-success/20", label: "Dễ", icon: "😊" },
                  { q: 5, color: "bg-accent/10 text-accent border-accent/20", label: "Rất dễ", icon: "🔥" }
                ].map((btn) => (
                  <button 
                    key={btn.q}
                    onClick={() => handleReview(btn.q)}
                    className={`${btn.color} p-5 rounded-2xl font-bold text-[10px] uppercase tracking-widest shadow-lg border hover:scale-105 active:scale-95 transition-all flex flex-col items-center gap-2 group`}
                  >
                    <span className="text-xl group-hover:scale-125 transition-transform">{btn.icon}</span>
                    {btn.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </PageShell>
  );
}
