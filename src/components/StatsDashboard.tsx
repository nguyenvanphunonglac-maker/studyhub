"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { noteService, Note } from "@/services/noteService";
import { flashcardService, FlashcardSet, Flashcard } from "@/services/flashcardService";
import { quizService, QuizResult, QuizSet } from "@/services/quizService";
import { useLanguage } from "@/context/LanguageContext";
import { BookText, Brain, GraduationCap, Zap, ChevronRight, ArrowUpRight, Clock, Star, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import PageShell from "./PageShell";

export default function StatsDashboard() {
  const { user, streak } = useAuth();
  const { t } = useLanguage();
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubNotes = noteService.subscribeToNotes(user.uid, setNotes);
    const unsubFlash = flashcardService.subscribeToSets(user.uid, setFlashcardSets);
    const unsubQuiz = quizService.subscribeToResults(user.uid, setResults);
    const unsubQuizSets = quizService.subscribeToQuizSets(user.uid, setQuizSets);
    
    return () => {
      unsubNotes();
      unsubFlash();
      unsubQuiz();
      unsubQuizSets();
    };
  }, [user]);

  const allCards = flashcardSets.reduce((acc, set) => [...acc, ...(set.cards || [])], [] as Flashcard[]);
  const dueCardsCount = allCards.filter(c => c.nextReview.toDate() <= new Date()).length;
  
  return (
    <PageShell>
      {/* Decorative Mesh Background */}
      <div className="mesh-bg">
        <div className="mesh-circle -top-20 -left-20" />
        <div className="mesh-circle top-1/2 -right-40 opacity-5" />
      </div>

        <header className="mb-12 md:mb-20 flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
             <div className="flex items-center gap-2.5 text-accent/50 font-bold uppercase text-[10px] tracking-[0.2em]">
                <Sparkles size={14} className="text-warning" />
                <span>{t('morning_prompt')}</span>
             </div>
             <motion.h1 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-accent tracking-tighter leading-[1.1] max-w-xl"
             >
                Chào mừng trở lại, <br />
                <span className="text-foreground/70 font-medium">{user?.displayName?.split(' ')[0] || "Học viên"} 👋</span>
             </motion.h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
             <p className="text-foreground/40 text-sm font-semibold">
               {new Date().toLocaleDateString('vi', { weekday: 'long', day: 'numeric', month: 'long' })}
             </p>
             <div className="px-4 py-1.5 glass rounded-full text-[10px] font-bold text-accent/60 uppercase tracking-widest border border-border-notion">
                Trạng thái: Đang hoạt động
             </div>
          </div>
        </header>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <StatCard icon={<BookText size={20} />} label={t('total_notes')} value={notes.length} color="text-blue-500" />
          <StatCard icon={<Brain size={20} />} label={t('due_cards')} value={dueCardsCount} color="text-warning" />
          <StatCard icon={<GraduationCap size={20} />} label="Bộ đề" value={quizSets.length} color="text-success" />
          <StatCard icon={<Zap size={20} />} label={streak + " ngày"} color="text-error" unit={t('streak')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Recent Notes Section (Wide) */}
          <section className="lg:col-span-8 bg-card/40 backdrop-blur-sm rounded-[32px] border border-border-notion p-8 md:p-10 shadow-soft">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/5 flex items-center justify-center text-accent/40">
                  <Clock size={20} />
                </div>
                <h2 className="text-xl font-bold text-accent tracking-tight">{t('recent_notes')}</h2>
              </div>
              <button className="text-[11px] font-bold text-foreground/30 hover:text-accent transition-colors flex items-center gap-1 group">
                {t('view_all')}
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {notes.slice(0, 4).map((note, i) => (
                <motion.div 
                  key={note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="p-6 glass rounded-2xl border border-border-notion/50 hover:border-accent/10 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-3">
                     <span className="px-2.5 py-1 bg-active-notion text-accent/60 rounded-lg text-[9px] font-bold uppercase tracking-widest">
                       {note.tags?.[0] || "General"}
                     </span>
                     <ArrowUpRight size={16} className="text-foreground/10 group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-lg font-bold text-accent line-clamp-1 group-hover:text-accent/80 transition-colors">
                    {note.title || t('untitled')}
                  </h3>
                  <p className="text-[10px] text-foreground/30 font-medium mt-1">Cập nhật 2 giờ trước</p>
                </motion.div>
              ))}
              {notes.length === 0 && (
                <div className="col-span-full py-16 text-center bg-active-notion/10 rounded-[24px] border border-dashed border-border-notion">
                   <p className="text-foreground/20 italic font-bold text-sm">{t('no_notes_yet')}</p>
                </div>
              )}
            </div>
          </section>

          {/* Action Card (Tall/Focus) */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-accent text-background rounded-[32px] p-8 shadow-2xl shadow-accent/10 relative overflow-hidden group min-h-[320px] flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center mb-6">
                   <Zap size={24} fill="currentColor" className="text-background" />
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{t('ready_prompt')}</h3>
                <p className="opacity-50 text-sm mb-8 leading-relaxed font-medium">Bạn đã sẵn sàng để chinh phục kiến thức mới chưa?</p>
              </div>
              
              <button className="relative z-10 w-full bg-background text-accent py-4 rounded-2xl font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2">
                {t('study_now')}
                <ChevronRight size={14} />
              </button>

              <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-all transform rotate-12">
                 <Brain size={180} />
              </div>
            </motion.div>

            <section className="bg-card border border-border-notion rounded-[32px] p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <Star size={18} />
                </div>
                <h3 className="text-lg font-bold text-accent tracking-tight">Kỹ năng</h3>
              </div>
              
              {results.length > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                     <svg className="w-full h-full -rotate-90">
                       <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-active-notion" />
                       <motion.circle 
                         cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" 
                         strokeDasharray="226"
                         initial={{ strokeDashoffset: 226 }}
                         animate={{ strokeDashoffset: 226 - (226 * (results[0].score / results[0].total)) }}
                         className="text-success"
                       />
                     </svg>
                     <span className="absolute text-lg font-bold text-accent">{Math.round((results[0].score / results[0].total) * 100)}%</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-accent line-clamp-1">{results[0].tags?.[0] || "Quiz gần nhất"}</p>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">{results[0].score}/{results[0].total} chính xác</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-active-notion/5 rounded-2xl border border-dashed border-border-notion">
                  <p className="text-foreground/20 italic text-xs font-bold">{t('no_quiz_results')}</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </PageShell>
  );
}

function StatCard({ icon, label, value, color, unit }: { icon: React.ReactNode, label: string, value?: string | number, color: string, unit?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-card/50 backdrop-blur-sm border border-border-notion rounded-3xl p-6 shadow-soft group transition-all relative overflow-hidden"
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-all", color.replace('text-', 'bg-') + '/10', color)}>
        {icon}
      </div>
      <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/30 mb-1">{label}</p>
      <div className="flex items-baseline gap-1.5">
         <p className="text-2xl font-extrabold text-accent">{value ?? unit}</p>
         {value !== undefined && unit && <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">{unit}</span>}
      </div>
      
      {/* Subtle background glow on hover */}
      <div className={cn("absolute -bottom-4 -right-4 w-12 h-12 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity", color.replace('text-', 'bg-'))} />
    </motion.div>
  );
}
