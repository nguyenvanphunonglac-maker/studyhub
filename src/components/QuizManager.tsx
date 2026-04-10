"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { quizService, Question, QuizResult, QuizSet } from "@/services/quizService";
import { Plus, Trash2, FileUp, Play, CheckCircle2, XCircle, History, ChevronRight, LayoutList, BookOpen, Sparkles, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { auth } from "@/lib/firebase";
import { subjects } from "@/context/LanguageContext";
import { cn, cleanObject } from "@/lib/utils";
import ConfirmModal from "@/components/ConfirmModal";
import PageShell from "./PageShell";
import { documentProcessor } from "@/utils/documentProcessor";
import { aiService } from "@/services/aiService";
import { Loader2 } from "lucide-react";

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
  const [editingQuestionIdx, setEditingQuestionIdx] = useState<number | null>(null);

  const [isCreatingSet, setIsCreatingSet] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState("");
  const [newSetDescription, setNewSetDescription] = useState("");
  const [newSetSubject, setNewSetSubject] = useState("");

  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; onConfirm: () => void }>({ open: false, onConfirm: () => {} });

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
      subject: editingSet.subject || "Khác"
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
    setEditingQuestionIdx(null);
    setIsAdding(false);
  };

    }
  };

  const handleAIUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsProcessingAI(true);
    try {
      const text = await documentProcessor.extractText(file);
      const quizData = await aiService.generateQuiz(text);
      
      if (quizData && Array.isArray(quizData)) {
        const setId = await quizService.createQuizSetFromAI(
          user.uid, 
          `AI: ${file.name.split('.')[0]}`, 
          quizData, 
          user.displayName || "Gia sư AI"
        );
        console.log("Đã tạo bộ đề từ AI:", setId);
      } else {
        alert("AI không thể tạo được bộ đề từ nội dung này. Thử file khác nhé!");
      }
    } catch (error) {
      console.error("Lỗi tạo bộ đề bằng AI:", error);
      alert("Lỗi khi gọi AI. Có thể file quá lớn hoặc hết hạn mức.");
    } finally {
      setIsProcessingAI(false);
      if (aiFileInputRef.current) aiFileInputRef.current.value = "";
    }
  };

  if (activeTab === "quiz") {
    return <QuizActive questions={editingSet ? editingSet.questions : questions} onExit={() => { setActiveTab("sets"); setEditingSet(null); }} />;
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
               {editingSet ? editingSet.title : "Kiểm tra kiến thức"}
             </h1>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            {editingSet ? (
              <button 
                onClick={() => setEditingSet(null)}
                className="flex items-center gap-2 text-foreground/40 hover:text-accent font-bold uppercase text-[10px] tracking-widest transition-all group"
              >
                <ChevronRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Quay lại danh sách bộ đề
              </button>
            ) : (
              <div className="flex flex-wrap gap-2 p-1.5 glass border border-border-notion rounded-2xl w-full sm:w-fit shadow-soft">
                <TabButton active={activeTab === "sets"} onClick={() => setActiveTab("sets")} icon={<BookOpen size={16} />} label="Bộ đề" />
                <TabButton active={activeTab === "bank"} onClick={() => setActiveTab("bank")} icon={<LayoutList size={16} />} label="Ngân hàng" />
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
                    <option value="" className="bg-card text-foreground">Tất cả môn</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject} className="bg-card text-foreground">{subject}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setIsCreatingSet(true)}
                    className="flex items-center gap-2 bg-active-notion/40 text-accent px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-accent/5 transition-all border border-border-notion"
                  >
                    <Plus size={18} />
                    Tạo bộ đề
                  </button>
                  <input 
                    type="file" 
                    ref={aiFileInputRef} 
                    onChange={handleAIUpload} 
                    className="hidden" 
                    accept=".pdf,.docx,.txt,.md" 
                  />
                  <button
                    onClick={() => aiFileInputRef.current?.click()}
                    disabled={isProcessingAI}
                    className="flex items-center gap-3 bg-accent text-background px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-accent/20 disabled:opacity-50"
                  >
                    {isProcessingAI ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    {isProcessingAI ? "Đang xử lý AI..." : "Tạo bằng AI ✨"}
                  </button>
              </div>
            )}
          </div>
        </header>

        {editingSet ? (
          <section className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <h2 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em]">
                Danh sách câu hỏi ({editingSet?.questions.length})
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
                  disabled={editingSet?.questions.length === 0}
                  onClick={() => setActiveTab("quiz")}
                  className="flex items-center gap-2 bg-success text-background px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:opacity-90 disabled:opacity-20 transition-all"
                >
                  <Play size={16} fill="currentColor" />
                  Bắt đầu làm bài
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
                    {editingQuestionIdx !== null ? 'Cập nhật' : 'Lưu câu hỏi'}
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
                  className="group p-6 bg-card/40 backdrop-blur-sm border border-border-notion rounded-2xl hover:border-accent/10 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-accent text-lg leading-relaxed">{q.text}</p>
                      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, i) => (
                          <div key={i} className={cn(
                            "text-xs px-4 py-2 rounded-xl border flex items-center justify-between",
                            i === q.correctAnswer ? 'bg-success/5 text-success font-bold border-success/20' : 'bg-active-notion/20 text-foreground/40 border-transparent'
                          )}>
                            <span>{opt}</span>
                            {i === q.correctAnswer && <CheckCircle2 size={14} />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => {
                          setNewText(q.text);
                          setNewOptions(q.options);
                          setNewCorrect(q.correctAnswer);
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
                          <p className="text-foreground/40 text-sm font-medium mb-10 line-clamp-2 h-10 leading-relaxed">{set.description || "Không có mô tả cho bộ đề này."}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="px-4 py-1.5 glass bg-accent/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent/70 border border-accent/10">
                            {set.questions.length} questions
                          </div>
                          <div className="flex gap-2 opacity-40 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                            <button
                              onClick={() => handleTogglePublic(set.id!, !!set.isPublic)}
                              className={cn(
                                "p-3 rounded-xl transition-all border",
                                set.isPublic ? "bg-accent text-background border-accent shadow-lg shadow-accent/10" : "bg-active-notion text-accent/40 border-border-notion"
                              )}
                              title={set.isPublic ? "Đang chia sẻ" : "Chia sẻ lên cộng đồng"}
                            >
                              <BookOpen size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setEditingSet(set);
                                setActiveTab("quiz");
                              }}
                              className="p-3 bg-success/10 text-success rounded-xl border border-success/10 hover:bg-success hover:text-background transition-all"
                            >
                              <Play size={16} fill="currentColor" />
                            </button>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setEditingSet(set)}
                                className="p-3 bg-active-notion text-accent/40 hover:text-accent rounded-xl border border-border-notion transition-all"
                              >
                                <History size={16} />
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
                                className="p-3 bg-error/5 text-error rounded-xl border border-error/10 hover:bg-error hover:text-background transition-all"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {quizSets.length === 0 && (
                    <div className="col-span-full py-32 bg-active-notion/5 border-2 border-dashed border-border-notion rounded-[40px] text-center">
                      <BookOpen size={48} className="mx-auto text-foreground/10 mb-6" />
                      <p className="text-foreground/30 font-bold uppercase text-[11px] tracking-widest">Chưa có bộ đề nào. Hãy tạo bộ đề đầu tiên!</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {activeTab === "bank" && (
              <section className="animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-8 px-2">
                  <h2 className="text-[11px] font-bold text-foreground/30 uppercase tracking-[0.2em]">Cơ sở dữ liệu ({questions.length})</h2>
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
                {results.map((res) => (
                  <motion.div 
                    key={res.id} 
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center justify-between p-8 bg-card/40 backdrop-blur-sm border border-border-notion rounded-[24px] shadow-soft hover:shadow-xl hover:shadow-accent/5 transition-all"
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
              </section>
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}

function QuizActive({ questions, onExit }: { questions: Question[], onExit: () => void }) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  
  const [quizQuestions] = useState(() => [...questions].sort(() => Math.random() - 0.5).slice(0, 10));
  const currentQ = quizQuestions[currentIdx];

  const handleAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);
    if (idx === currentQ.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const handleNext = async () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      await quizService.saveResult(user!.uid, score, quizQuestions.length);
      setIsFinished(true);
    }
  };

  if (isFinished) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/5 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center relative z-10">
          <div className="w-24 h-24 bg-success/10 text-success rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl border border-success/20">
            <Trophy size={48} />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-accent mb-4 tracking-tighter leading-tight">{t('quiz_finished')}</h2>
          <p className="text-xl text-foreground/40 mb-12 font-medium">Bạn đạt được <span className="text-accent font-extrabold">{score} / {quizQuestions.length}</span> câu chính xác!</p>
          <button onClick={onExit} className="bg-accent text-background px-16 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all">{t('close_quiz')}</button>
        </motion.div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-8">
        <div className="text-center">
          <BookOpen size={48} className="mx-auto text-foreground/10 mb-6" />
          <h2 className="text-xl font-bold text-accent mb-6">Không có câu hỏi nào trong bộ đề này!</h2>
          <button onClick={onExit} className="bg-accent text-background px-8 py-3 rounded-xl font-bold shadow-xl">Quay lại</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-accent/20 z-20" />
      
      <div className="h-20 px-10 flex items-center justify-between bg-card/40 backdrop-blur-2xl border-b border-border-notion relative z-20">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent/40 mb-2">Câu hỏi {currentIdx + 1} / {quizQuestions.length}</span>
          <div className="flex items-center gap-6">
            <div className="w-64 h-1.5 bg-active-notion/50 rounded-full overflow-hidden border border-border-notion shadow-inner">
              <motion.div 
                className="h-full bg-accent transition-all duration-500" 
                initial={{ width: 0 }}
                animate={{ width: `${((currentIdx + 1)/quizQuestions.length)*100}%` }} 
              />
            </div>
          </div>
        </div>
        <button onClick={onExit} className="p-3 text-foreground/20 hover:text-error hover:bg-error/5 rounded-2xl transition-all"><XCircle size={28} /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-3xl glass p-10 md:p-16 rounded-[48px] border-border-notion/50 shadow-2xl">
          <h3 className="text-2xl md:text-4xl font-extrabold text-accent leading-tight tracking-tight mb-16">{currentQ.text}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQ.options.map((opt, i) => (
              <button 
                key={i}
                disabled={isAnswered}
                onClick={() => handleAnswer(i)}
                className={cn(
                  "w-full text-left p-6 rounded-2xl border-2 transition-all font-bold flex items-center justify-between group",
                  !isAnswered ? 'border-border-notion bg-active-notion/10 hover:border-accent hover:bg-accent/5' : 
                    i === currentQ.correctAnswer ? 'border-success bg-success/5 text-success' : 
                    i === selectedIdx ? 'border-error bg-error/5 text-error' : 'border-border-notion opacity-40'
                )}
              >
                <div className="flex items-center gap-4">
                   <span className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center text-xs border transition-colors",
                     !isAnswered ? "bg-active-notion border-border-notion text-accent/40 group-hover:bg-accent group-hover:text-background" : 
                     i === currentQ.correctAnswer ? "bg-success text-background border-success" :
                     i === selectedIdx ? "bg-error text-background border-error" : "bg-active-notion border-border-notion"
                   )}>
                     {String.fromCharCode(65 + i)}
                   </span>
                   <span>{opt}</span>
                </div>
                {isAnswered && i === currentQ.correctAnswer && <CheckCircle2 size={20} />}
                {isAnswered && i === selectedIdx && i !== currentQ.correctAnswer && <XCircle size={20} />}
              </button>
            ))}
          </div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-16 flex justify-end">
                <button onClick={handleNext} className="bg-accent text-background px-12 py-4 rounded-2xl font-bold uppercase text-[10px] tracking-[0.2em] flex items-center gap-2 group shadow-xl hover:opacity-90 active:scale-95 transition-all">
                  {currentIdx === quizQuestions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                  <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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
