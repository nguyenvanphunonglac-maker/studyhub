"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { quizService, Question, QuizResult, QuizSet, QuizAnswer } from "@/services/quizService";
import { Plus, Trash2, FileUp, Play, CheckCircle2, XCircle, History, ChevronRight, LayoutList, BookOpen, Sparkles, Trophy, Image as ImageIcon, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { subjects } from "@/context/LanguageContext";
import { cn, cleanObject } from "@/lib/utils";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PageShell from "../layout/PageShell";
import SharedSessionButton from "@/components/session/SharedSessionButton";
import { githubUploadService } from "@/services/githubUploadService";

export default function QuizManager() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [activeTab, setActiveTab] = useState<"sets" | "bank" | "history" | "quiz">("sets");
  const [isTakingQuiz, setIsTakingQuiz] = useState(false);
  const [editingSet, setEditingSet] = useState<QuizSet | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  
  const [newText, setNewText] = useState("");
  const [newOptions, setNewOptions] = useState(["", "", "", ""]);
  const [newCorrect, setNewCorrect] = useState(0);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [newSetSubject, setNewSetSubject] = useState("");

  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; onConfirm: () => void }>({ open: false, onConfirm: () => {} });
  const [shuffleEnabled, setShuffleEnabled] = useState(true);

  useEffect(() => {
    if (!user || !auth.currentUser) return;
    const unsubQ = quizService.subscribeToQuestions(user.uid, setQuestions);
    const unsubR = quizService.subscribeToResults(user.uid, setResults);
    const unsubS = quizService.subscribeToQuizSets(user.uid, setQuizSets);
    return () => { unsubQ(); unsubR(); unsubS(); };
  }, [user]);

  useEffect(() => {
    if (editingSet) {
      const updated = quizSets.find(s => s.id === editingSet.id);
      if (updated) setEditingSet(updated);
    }
  }, [quizSets, editingSet?.id]);

  const handleCreateSet = async () => {
    if (!user || !newSetTitle || !newSetSubject) return;
    await quizService.createQuizSet(user.uid, newSetTitle, newSetDescription, [], newSetSubject, user.displayName || "Gia sư AI");
    setNewSetTitle("");
    setNewSetDescription("");
    setNewSetSubject("");
    setIsCreatingSet(false);
  };

  const handleTogglePublic = async (setId: string, currentStatus: boolean) => {
    if (!user) return;
    await quizService.toggleQuizSetPublic(user.uid, setId, !currentStatus);
  };

  const handleSaveQuestionToSet = async () => {
    if (!user || !editingSet || !newText) return;
    
    let updatedQuestions = [...editingSet.questions];
    const newQ: Question = {
      text: newText,
      options: newOptions,
      correctAnswer: newCorrect,
      tags: [],
      subject: editingSet.subject || "Khác",
      ...(newImageUrl ? { imageUrl: newImageUrl } : {}),
    };

    if (editingQuestionIdx !== null) {
      updatedQuestions[editingQuestionIdx] = newQ;
    } else {
      updatedQuestions.push(newQ);
    }

    await quizService.updateQuestionsInSet(user.uid, editingSet.id!, updatedQuestions);
    resetQuestionForm();
  };

  const handleDeleteQuestionFromSet = async (idx: number) => {
    if (!user || !editingSet) return;
    setConfirmDelete({
      open: true,
      onConfirm: async () => {
        const updatedQuestions = editingSet.questions.filter((_, i) => i !== idx);
        await quizService.updateQuestionsInSet(user.uid, editingSet.id!, updatedQuestions);
        setConfirmDelete({ open: false, onConfirm: () => {} });
      }
    });
  };

  const resetQuestionForm = () => {
    setNewText("");
    setNewOptions(["", "", "", ""]);
    setNewCorrect(0);
    setNewImageUrl("");
    setEditingQuestionIdx(null);
    setIsAdding(false);
  };

  const handleQuestionImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const url = await githubUploadService.uploadMedia(file);
      setNewImageUrl(url);
    } catch (err) {
      console.error("Image upload failed:", err);
    } finally {
      setImageUploading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user && editingSet) {
      import("papaparse").then(({ default: Papa }) => {
        Papa.parse(file, {
          header: true,
          complete: async (results) => {
            const parsed = results.data.map((row: any) => ({
              text: row.question || row.text,
              options: [row.option1, row.option2, row.option3, row.option4],
              correctAnswer: parseInt(row.correct) - 1,
              tags: [],
              subject: editingSet.subject || "Khác"
            })).filter((q: any) => q.text && q.options.length === 4);
            
            const updatedQs = [...editingSet.questions, ...parsed];
            await quizService.updateQuestionsInSet(user.uid, editingSet.id!, updatedQs);
          }
        });
      });
    }
  };

  if (activeTab === "quiz") {
    return <QuizActive questions={editingSet ? editingSet.questions : questions} shuffle={shuffleEnabled} onExit={() => { setActiveTab("sets"); setEditingSet(null); }} />;
  }

  return (
    <PageShell>
      <ConfirmModal
        open={confirmDelete.open}
        onConfirm={confirmDelete.onConfirm}
        onCancel={() => setConfirmDelete({ open: false, onConfirm: () => {} })}
      />
      <div className="max-w-5xl mx-auto relative z-10">
        <header className="mb-12 md:mb-16">
          <div className="space-y-4">
             <div className="flex items-center gap-2.5 text-accent/40 font-bold uppercase text-[10px] tracking-[0.3em]">
                <Sparkles size={14} className="text-warning" />
                <span>{t('quizzes_title')}</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-extrabold text-accent tracking-tighter leading-tight">
               {editingSet ? editingSet.title : t('check_knowledge')}
             </h1>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {editingSet ? (
              <button 
                onClick={() => setEditingSet(null)}
                className="flex items-center gap-2 text-foreground/40 hover:text-accent font-bold uppercase text-[10px] tracking-widest transition-all group"
              >
                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> {t('back_to_sets')}
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 p-1.5 glass border border-border-notion rounded-2xl w-full sm:w-fit shadow-soft">
                <TabButton active={activeTab === "sets"} onClick={() => setActiveTab("sets")} icon={<BookOpen size={16} />} label={t('sets_tab')} />
                <TabButton active={activeTab === "bank"} onClick={() => setActiveTab("bank")} icon={<LayoutList size={16} />} label={t('bank_tab')} />
                <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")} icon={<History size={16} />} label={t('history')} />
              </div>
            )}
            
            {!editingSet && (
              <div className="flex gap-3">
                 <select 
                    value={selectedSubject} 
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 bg-card/60 backdrop-blur-md text-foreground border border-border-notion rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-accent/10 transition-all"
                  >
                    <option value="" className="bg-card text-foreground">{t('all_subjects')}</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject} className="bg-card text-foreground">{subject}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingSet(true)}
                    className="flex items-center gap-2 bg-accent text-background px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-accent/5"
                  >
                    <Plus size={18} />
                    {t('create_set')}
                  </button>
              </div>
            )}
          </div>
        </header>

        {editingSet ? (
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <h2 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                {t('question_list_count')} ({editingSet?.questions.length})
              </h2>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 bg-active-notion/40 border border-border-notion text-accent px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-accent/5 transition-all">
                  <FileUp size={16} />
                  Import CSV
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-2 bg-active-notion/40 border border-border-notion text-accent px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-accent/5 transition-all"
                >
                  <Plus size={16} />
                  Thêm câu hỏi
                </button>
                <button
                  onClick={() => setShuffleEnabled(s => !s)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all",
                    shuffleEnabled
                      ? "bg-accent/10 text-accent border-accent/20"
                      : "bg-active-notion/40 text-foreground/40 border-border-notion"
                  )}
                >
                  🔀 {shuffleEnabled ? t('shuffle_on') : t('shuffle_off')}
                </button>
                <button 
                  disabled={editingSet?.questions.length === 0}
                  onClick={() => setActiveTab("quiz")}
                  className="flex items-center gap-2 bg-success text-background px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:opacity-90 disabled:opacity-20 transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  {t('start_quiz_btn')}
                </button>
              </div>
            </div>

            {isAdding && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-8 glass rounded-[32px] border border-border-notion/50 shadow-2xl">
                <div className="space-y-4 mb-8">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30">Nội dung câu hỏi</label>
                  <textarea 
                    value={newText} 
                    onChange={(e) => setNewText(e.target.value)}
                    className="w-full p-6 bg-active-notion/40 border-none rounded-2xl outline-none font-medium text-accent text-lg placeholder:text-foreground/10 focus:ring-1 focus:ring-accent/10 transition-all" 
                    placeholder="Nhập câu hỏi của bạn..."
                    rows={3}
                  />
                  {/* Image upload */}
                  <div className="flex items-center gap-4">
                    {newImageUrl ? (
                      <div className="relative group">
                        <img src={newImageUrl} alt="question" className="h-32 rounded-2xl object-cover border border-border-notion" />
                        <button
                          onClick={() => setNewImageUrl("")}
                          className="absolute top-2 right-2 p-1.5 bg-error text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <label className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border cursor-pointer transition-all",
                        imageUploading
                          ? "bg-active-notion/40 text-foreground/30 border-border-notion"
                          : "bg-active-notion/40 border-border-notion text-accent hover:bg-accent/5"
                      )}>
                        {imageUploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                        {imageUploading ? "Đang tải..." : "Thêm ảnh"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleQuestionImageUpload} disabled={imageUploading} />
                      </label>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {newOptions.map((opt, i) => (
                    <div key={i} className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl border-2 transition-all",
                      newCorrect === i ? 'border-accent bg-accent/5' : 'border-border-notion bg-active-notion/20'
                    )}>
                      <input 
                        type="radio" 
                        checked={newCorrect === i} 
                        onChange={() => setNewCorrect(i)}
                        className="w-4 h-4 accent-accent"
                      />
                      <input 
                        value={opt} 
                        onChange={(e) => {
                          const next = [...newOptions];
                          next[i] = e.target.value;
                          setNewOptions(next);
                        }}
                        className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-accent"
                        placeholder={`Phương án ${i+1}`}
                      />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end gap-4 pt-6 border-t border-border-notion/50">
                  <button onClick={resetQuestionForm} className="px-6 py-2 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">{t('cancel')}</button>
                  <button onClick={handleSaveQuestionToSet} className="bg-accent text-background px-10 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl hover:opacity-90 transition-all">
                    {editingQuestionIdx !== null ? t('update_btn') : t('save_question')}
                  </button>
                </div>
              </motion.div>
            )}

            <div className="space-y-4">
              {editingSet.questions.map((q, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="group bg-card/40 backdrop-blur-sm border border-border-notion rounded-2xl hover:border-accent/10 transition-all overflow-hidden"
                >
                  {/* Image full-bleed */}
                  {q.imageUrl && (
                    <img src={q.imageUrl} alt="question" className="w-full object-cover" />
                  )}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <p className="font-bold text-accent text-base leading-relaxed flex-1">{q.text}</p>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                        <button 
                          onClick={() => {
                            setNewText(q.text);
                            setNewOptions(q.options);
                            setNewCorrect(q.correctAnswer);
                            setNewImageUrl(q.imageUrl || "");
                            setEditingQuestionIdx(idx);
                            setIsAdding(true);
                          }}
                          className="p-2.5 bg-active-notion text-accent/40 hover:text-accent rounded-xl border border-border-notion transition-all"
                        >
                           <History size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestionFromSet(idx)} 
                          className="p-2.5 bg-error/5 text-error/40 hover:text-error rounded-xl border border-error/10 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-2 w-full">
                      {q.options.map((opt, i) => (
                        <div key={i} className={cn(
                          "w-full text-xs px-4 py-2.5 rounded-xl border flex items-center justify-between gap-2",
                          i === q.correctAnswer ? 'bg-success/5 text-success font-bold border-success/20' : 'bg-active-notion/20 text-foreground/40 border-border-notion/50'
                        )}>
                          <span className="flex items-center gap-2">
                            <span className={cn("w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0",
                              i === q.correctAnswer ? "bg-success/20 text-success" : "bg-active-notion text-foreground/30"
                            )}>{String.fromCharCode(65+i)}</span>
                            {opt}
                          </span>
                          {i === q.correctAnswer && <CheckCircle2 size={14} className="flex-shrink-0" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
              {editingSet.questions.length === 0 && (
                <div className="text-center py-24 bg-active-notion/10 border-2 border-dashed border-border-notion rounded-[32px]">
                  <p className="text-foreground/20 font-bold uppercase text-[11px] tracking-widest">Bộ đề trống. Hãy bắt đầu thêm câu hỏi!</p>
                </div>
              )}
            </div>
          </section>
        ) : (
          <>
            {activeTab === "sets" && (
              <section className="animate-in fade-in duration-500">
                {isCreatingSet && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 p-10 glass rounded-[40px] shadow-2xl border-border-notion/50">
                    <div className="max-w-2xl">
                      <input 
                        value={newSetTitle} 
                        onChange={(e) => setNewSetTitle(e.target.value)}
                        className="w-full p-4 bg-active-notion/40 border-none rounded-2xl mb-4 outline-none font-extrabold text-accent text-2xl placeholder:text-foreground/10" 
                        placeholder="Tên bộ đề trắc nghiệm..."
                      />
                      <textarea 
                        value={newSetDescription} 
                        onChange={(e) => setNewSetDescription(e.target.value)}
                        className="w-full p-4 bg-active-notion/40 border-none rounded-2xl mb-4 outline-none font-medium text-accent text-lg placeholder:text-foreground/10" 
                        placeholder="Mô tả phạm vi kiến thức..."
                        rows={3}
                      />
                      <select 
                        value={newSetSubject} 
                        onChange={(e) => setNewSetSubject(e.target.value)}
                        className="w-full p-4 bg-active-notion/40 text-foreground border-none rounded-2xl mb-8 outline-none font-bold"
                      >
                        <option value="" className="bg-card text-foreground">Chọn môn học</option>
                        {subjects.map(subject => (
                          <option key={subject} value={subject} className="bg-card text-foreground">{subject}</option>
                        ))}
                      </select>
                      <div className="flex justify-end gap-4 pt-6 border-t border-border-notion/50">
                        <button onClick={() => setIsCreatingSet(false)} className="px-6 py-2 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">{t('cancel')}</button>
                        <button onClick={handleCreateSet} className="bg-accent text-background px-12 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-xl transition-all">Tạo ngay</button>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {quizSets.filter(set => !selectedSubject || set.subject === selectedSubject).map((set) => (
                    <motion.div 
                      key={set.id} 
                      whileHover={{ y: -8 }}
                      className="group bg-card/40 backdrop-blur-sm border border-border-notion rounded-[32px] p-8 hover:shadow-2xl hover:shadow-accent/5 transition-all relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-accent opacity-[0.03] group-hover:opacity-[0.08] rounded-full -mr-16 -mt-16 transition-opacity" />
                      
                      <div className="flex flex-col h-full">
                        <div className="flex-1 cursor-pointer" onClick={() => setEditingSet(set)}>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-accent/40 uppercase tracking-[0.2em] mb-3">
                            <span>📚 {set.subject}</span>
                          </div>
                          <h3 className="font-extrabold text-2xl text-accent mb-3 tracking-tight group-hover:text-accent/80 transition-colors">{set.title}</h3>
                          <p className="text-foreground/40 text-sm font-medium mb-10 line-clamp-2 h-10 leading-relaxed">{set.description || t('no_description')}</p>
                        </div>
                        
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="px-4 py-1.5 glass bg-accent/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/70 border border-accent/10">
                              {set.questions.length} questions
                            </div>
                            {/* Public toggle + delete — luôn hiển thị */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleTogglePublic(set.id!, !!set.isPublic)}
                                className={cn(
                                  "p-2.5 rounded-xl transition-all border",
                                  set.isPublic ? "bg-accent text-background border-accent" : "bg-active-notion text-accent/40 border-border-notion"
                                )}
                                title={set.isPublic ? t('sharing') : t('share_community')}
                              >
                                <BookOpen size={15} />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmDelete({
                                    open: true,
                                    onConfirm: async () => {
                                      await quizService.deleteQuizSet(user!.uid, set.id!);
                                      setConfirmDelete({ open: false, onConfirm: () => {} });
                                    }
                                  });
                                }}
                                className="p-2.5 bg-error/5 text-error rounded-xl border border-error/10 hover:bg-error hover:text-background transition-all"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>

                          {/* Action buttons — luôn hiển thị, wrap trên mobile */}
                          <div className="flex flex-wrap gap-2">
                            <SharedSessionButton quizSet={set} />
                            <button
                              onClick={() => { setEditingSet(set); setActiveTab("quiz"); }}
                              className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 bg-success/10 text-success rounded-xl border border-success/10 hover:bg-success hover:text-background transition-all text-xs font-bold"
                            >
                              <Play size={14} fill="currentColor" /> Làm bài
                            </button>
                            <button
                              onClick={() => setEditingSet(set)}
                              className="flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 bg-active-notion text-accent/60 hover:text-accent rounded-xl border border-border-notion transition-all text-xs font-bold"
                            >
                              <History size={14} /> Xem đề
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {quizSets.length === 0 && (
                    <div className="col-span-full py-32 bg-active-notion/5 border-2 border-dashed border-border-notion rounded-[40px] text-center">
                      <BookOpen size={48} className="mx-auto text-foreground/10 mb-6" />
                      <p className="text-foreground/30 font-bold uppercase text-[11px] tracking-widest">{t('no_sets')}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "bank" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em]">{t('database_count')} ({questions.length})</h2>
                </div>
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="p-6 glass rounded-2xl border border-border-notion hover:border-accent/10 transition-all">
                      <p className="font-bold text-accent text-lg leading-relaxed">{q.text}</p>
                      <div className="mt-6 flex flex-wrap gap-3">
                        {q.options.map((opt, i) => (
                          <span key={i} className={cn(
                            "text-[11px] font-bold px-4 py-1.5 rounded-xl border",
                            i === q.correctAnswer ? 'bg-success/5 text-success border-success/20' : 'bg-active-notion/20 text-foreground/40 border-transparent'
                          )}>
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {activeTab === "history" && (
              <section className="space-y-4 animate-in fade-in duration-500">
                {selectedResult ? (
                  <div className="space-y-6">
                    <button 
                      onClick={() => setSelectedResult(null)}
                      className="flex items-center gap-2 text-foreground/40 hover:text-accent font-bold uppercase text-[10px] tracking-widest transition-all group mb-6"
                    >
                      <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> {t('back_to_history')}
                    </button>

                    <div className="p-8 glass rounded-[32px] border border-border-notion/50 shadow-2xl">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/30 mb-2">{t('quiz_result_title')}</p>
                          <p className="text-2xl font-extrabold text-accent">{selectedResult.score} / {selectedResult.total} câu chính xác</p>
                          <p className="text-lg text-foreground/40 font-bold mt-2">{t('accuracy_rate')}: <span className={selectedResult.score / selectedResult.total >= 0.8 ? "text-success" : "text-warning"}>{Math.round((selectedResult.score / selectedResult.total) * 100)}%</span></p>
                        </div>
                        <div className={cn(
                          "w-24 h-24 rounded-[20px] flex items-center justify-center font-extrabold text-4xl shadow-inner border",
                          selectedResult.score / selectedResult.total >= 0.8 ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                        )}>
                          {Math.round((selectedResult.score / selectedResult.total) * 100)}<span className="text-sm opacity-40">%</span>
                        </div>
                      </div>
                      <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em]">{selectedResult.date.toDate().toLocaleDateString()} • {selectedResult.date.toDate().toLocaleTimeString()}</p>
                    </div>

                    {selectedResult.answers && selectedResult.answers.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">{t('detail_per_question')}</h3>
                        {selectedResult.answers.map((answer, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className={cn(
                              "p-6 rounded-2xl border-2 glass",
                              answer.isCorrect ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1",
                                answer.isCorrect ? "bg-success text-background" : "bg-error text-background"
                              )}>
                                {answer.isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-accent mb-3">Câu {idx + 1}: {answer.questionText}</p>
                                <div className="space-y-2 text-sm">
                                  <p className={answer.isCorrect ? "text-success" : "text-foreground/60"}>
                                    <span className="font-semibold">Câu trả lời của bạn:</span> {answer.userAnswer}
                                  </p>
                                  {!answer.isCorrect && (
                                    <p className="text-success font-semibold">
                                      <span>Câu trả lời đúng:</span> {answer.correctAnswer}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {results.map((res) => (
                      <motion.div 
                        key={res.id} 
                        whileHover={{ scale: 1.01 }}
                        onClick={() => setSelectedResult(res)}
                        className="flex items-center justify-between p-8 bg-card/40 backdrop-blur-sm border border-border-notion rounded-[24px] shadow-soft hover:shadow-xl hover:shadow-accent/5 transition-all cursor-pointer"
                      >
                        <div className="flex items-center gap-8">
                          <div className={cn(
                            "w-16 h-16 rounded-[20px] flex items-center justify-center font-extrabold text-2xl shadow-inner border",
                            res.score / res.total >= 0.8 ? 'bg-success/10 text-success border-success/20' : 'bg-warning/10 text-warning border-warning/20'
                          )}>
                            {Math.round((res.score / res.total) * 100)}<span className="text-[10px] opacity-40 ml-0.5">%</span>
                          </div>
                          <div>
                            <p className="font-extrabold text-accent text-xl tracking-tight">{res.score} / {res.total} {t('correct')}</p>
                            <p className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mt-1">{res.date.toDate().toLocaleDateString()} • {res.date.toDate().toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <button className="p-3 bg-active-notion/40 text-foreground/10 hover:text-accent rounded-xl transition-all border border-border-notion">
                          <ChevronRight size={20} />
                        </button>
                      </motion.div>
                    ))}
                    {results.length === 0 && (
                      <div className="text-center py-24 bg-active-notion/5 border-2 border-dashed border-border-notion rounded-[32px]">
                        <p className="text-foreground/30 font-bold uppercase text-[11px] tracking-widest">{t('no_history')}</p>
                      </div>
                    )}
                  </>
                )}
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

function QuizActive({ questions, shuffle = true, onExit }: { questions: Question[], shuffle?: boolean, onExit: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [quizQuestions] = useState(() => {
    const pool = shuffle ? [...questions].sort(() => Math.random() - 0.5) : [...questions];
    return pool.slice(0, 10);
  });
  // selectedAnswers: map from question index -> selected option index (can change before submit)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const currentQ = quizQuestions[currentIdx];
  const totalAnswered = Object.keys(selectedAnswers).length;
  const allAnswered = totalAnswered === quizQuestions.length;

  // Compute results after submit
  const results = quizQuestions.map((q, i) => {
    const userIdx = selectedAnswers[i] ?? -1;
    const isCorrect = userIdx === q.correctAnswer;
    return {
      questionText: q.text,
      userAnswer: userIdx >= 0 ? q.options[userIdx] : '(Bỏ qua)',
      correctAnswer: q.options[q.correctAnswer],
      isCorrect,
    };
  });
  const score = results.filter(r => r.isCorrect).length;

  const handleSubmit = async () => {
    await quizService.saveResult(user!.uid, score, quizQuestions.length, undefined, results);
    setIsSubmitted(true);
  };

  // --- Submitted: show score + detail ---
  if (isSubmitted) {
    if (showDetail) {
      return (
        <div className="flex-1 flex flex-col bg-background p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold text-accent">Chi tiết kết quả</h2>
              <button onClick={() => setShowDetail(false)} className="bg-accent text-background px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 active:scale-95 transition-all">
                Quay lại
              </button>
            </div>
            <div className="space-y-4">
              {results.map((r, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className={cn("p-6 rounded-2xl border-2 glass", r.isCorrect ? "border-success/30 bg-success/5" : "border-error/30 bg-error/5")}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1", r.isCorrect ? "bg-success text-background" : "bg-error text-background")}>
                      {r.isCorrect ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-accent mb-2">Câu {idx + 1}: {r.questionText}</p>
                      <p className={cn("text-sm", r.isCorrect ? "text-success" : "text-foreground/50")}>
                        <span className="font-semibold">Bạn chọn:</span> {r.userAnswer}
                      </p>
                      {!r.isCorrect && (
                        <p className="text-sm text-success font-semibold mt-1">
                          <span>Đáp án đúng:</span> {r.correctAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <button onClick={onExit} className="bg-accent text-background px-12 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">Thoát</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-[100px] pointer-events-none" />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center relative z-10">
          <div className="w-24 h-24 bg-success/10 text-success rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-success/20">
            <Trophy size={48} />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-accent mb-4 tracking-tighter">{t('quiz_finished')}</h2>
          <p className="text-xl text-foreground/40 mb-2 font-medium">
            Bạn đạt <span className="text-accent font-extrabold">{score} / {quizQuestions.length}</span> câu đúng
          </p>
          <p className="text-lg text-foreground/30 mb-12">
            Tỷ lệ: <span className={cn("font-bold", score / quizQuestions.length >= 0.8 ? "text-success" : "text-warning")}>
              {Math.round((score / quizQuestions.length) * 100)}%
            </span>
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={() => setShowDetail(true)} className="bg-accent text-background px-10 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">
              Xem chi tiết
            </button>
            <button onClick={onExit} className="bg-foreground/10 text-accent px-10 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all border border-accent/20">
              Thoát
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- No questions ---
  if (!currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <BookOpen size={48} className="mx-auto text-foreground/10 mb-6" />
        <h2 className="text-xl font-bold text-accent mb-6">Không có câu hỏi nào!</h2>
        <button onClick={onExit} className="bg-accent text-background px-8 py-3 rounded-xl font-bold shadow-xl">Quay lại</button>
      </div>
    );
  }

  // --- Quiz in progress ---
  return (
    <div className="flex flex-col flex-1 h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="h-20 px-10 flex items-center justify-between bg-card/40 backdrop-blur-2xl border-b border-border-notion relative z-20">
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/40">
            Câu {currentIdx + 1} / {quizQuestions.length}
            <span className="ml-3 text-foreground/30">• Đã trả lời: {totalAnswered}/{quizQuestions.length}</span>
          </span>
          <div className="w-64 h-1.5 bg-active-notion/50 rounded-full overflow-hidden border border-border-notion">
            <motion.div className="h-full bg-accent transition-all duration-300" animate={{ width: `${((currentIdx + 1) / quizQuestions.length) * 100}%` }} />
          </div>
        </div>
        <button onClick={onExit} className="p-3 text-foreground/20 hover:text-error hover:bg-error/5 rounded-2xl transition-all">
          <XCircle size={28} />
        </button>
      </div>

      {/* Question navigator dots */}
      <div className="flex items-center gap-1.5 px-10 py-3 bg-card/20 border-b border-border-notion flex-wrap">
        {quizQuestions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIdx(i)}
            className={cn(
              "w-7 h-7 rounded-lg text-[10px] font-bold transition-all border",
              i === currentIdx
                ? "bg-accent text-background border-accent scale-110"
                : selectedAnswers[i] !== undefined
                  ? "bg-success/20 text-success border-success/30"
                  : "bg-active-notion/40 text-foreground/30 border-border-notion hover:border-accent/30"
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10 overflow-y-auto">
        <div className="w-full max-w-3xl glass rounded-[32px] md:rounded-[48px] border border-border-notion/50 shadow-2xl overflow-hidden">
          {/* Image full-bleed at top */}
          {currentQ.imageUrl && (
            <img
              src={currentQ.imageUrl}
              alt="question"
              className="w-full object-cover"
            />
          )}

          <div className="p-6 md:p-10">
            <h3 className="text-xl md:text-2xl font-extrabold text-accent leading-tight tracking-tight mb-6">
              {currentQ.text}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedAnswers[currentIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border-2 transition-all font-bold flex items-center gap-3 group",
                      isSelected
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-border-notion bg-active-notion/10 hover:border-accent/50 hover:bg-accent/5"
                    )}
                  >
                    <span className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center text-xs border transition-colors flex-shrink-0",
                      isSelected
                        ? "bg-accent text-background border-accent"
                        : "bg-active-notion border-border-notion text-accent/40 group-hover:bg-accent/10"
                    )}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {isSelected && <CheckCircle2 size={18} className="flex-shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-8 flex items-center justify-between gap-3">
              <button
                onClick={() => setCurrentIdx(i => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm border border-border-notion text-foreground/40 hover:text-accent hover:border-accent/30 disabled:opacity-20 transition-all"
              >
                <ChevronRight size={16} className="rotate-180" /> Câu trước
              </button>

              {currentIdx < quizQuestions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(i => i + 1)}
                  className="flex items-center gap-2 bg-accent text-background px-8 py-3 rounded-2xl font-bold text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all"
                >
                  Câu tiếp theo <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={!allAnswered}
                  className={cn(
                    "flex items-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-xl transition-all",
                    allAnswered
                      ? "bg-success text-background hover:opacity-90 active:scale-95"
                      : "bg-foreground/10 text-foreground/30 cursor-not-allowed"
                )}
              >
                <CheckCircle2 size={16} />
                Nộp bài {!allAnswered && `(còn ${quizQuestions.length - totalAnswered} câu chưa trả lời)`}
              </button>
            )}
          </div>

          {/* Submit button always visible when all answered */}
          {allAnswered && currentIdx < quizQuestions.length - 1 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-success text-background px-8 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:opacity-90 active:scale-95 transition-all"
              >
                <CheckCircle2 size={15} /> Nộp bài ngay
              </button>
            </div>
          )}
          </div>{/* end p-6 md:p-10 */}
        </div>{/* end glass card */}
      </div>{/* end flex-1 */}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick} 
      className={cn(
        "flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-[10px] font-bold transition-all uppercase tracking-widest",
        active 
          ? "bg-card text-accent shadow-lg shadow-accent/5 scale-105" 
          : "text-foreground/30 hover:text-accent/60"
      )}
    >
      <span className={cn("transition-colors", active ? "text-accent" : "text-foreground/20")}>{icon}</span>
      {label}
    </button>
  );
}
