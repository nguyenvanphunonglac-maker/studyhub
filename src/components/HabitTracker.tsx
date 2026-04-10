"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { habitService, Habit, HabitLog } from "@/services/habitService";
import { Plus, Trash2, Check, Target, Flame, Calendar, Trophy, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import PageShell from "./PageShell";

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function HabitTracker() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    if (!user) return;
    const unsubHabits = habitService.subscribeToHabits(user.uid, setHabits);
    const unsubLogs = habitService.subscribeToLogs(user.uid, setLogs);
    return () => {
      unsubHabits();
      unsubLogs();
    };
  }, [user]);

  const handleToggle = async (habitId: string, date: string, currentStatus: boolean) => {
    if (!user) return;
    await habitService.toggleHabit(user.uid, habitId, date, !currentStatus);
  };

  const handleCreate = async () => {
    if (!user || !newName.trim()) return;
    await habitService.createHabit(user.uid, newName, selectedColor);
    setNewName("");
    setIsAddingHabit(false);
  };

  const handleDelete = async (habitId: string) => {
    if (!user || !confirm(t('delete_confirm'))) return;
    await habitService.deleteHabit(user.uid, habitId);
  };

  const last30Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const getLogStatus = (habitId: string, date: string) => {
    return logs.some(l => l.habitId === habitId && l.date === date);
  };

  const calculateStreak = (habitId: string) => {
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const sortedLogs = logs
      .filter(l => l.habitId === habitId)
      .sort((a, b) => b.date.localeCompare(a.date));

    // Simple streak logic
    for (let i = 0; i < 100; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        if (logs.some(l => l.habitId === habitId && l.date === dateStr)) {
            streak++;
        } else {
            if (i > 0) break; // If not today, and not yesterday, break
        }
    }
    return streak;
  };

  return (
    <PageShell>
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 md:mb-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.3em] mb-4">
               <Target size={14} />
               Theo dõi thói quen
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-accent mb-4 tracking-tighter leading-tight">
              Kỷ luật là sức mạnh <br /><span className="text-foreground/20">Xây dựng tương lai qua thói quen</span>
            </h1>
          </div>
          <button 
            onClick={() => setIsAddingHabit(true)}
            className="w-full sm:w-auto p-4 sm:p-5 bg-accent text-background rounded-[24px] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
          >
            <Plus size={24} />
          </button>
        </header>

        <div className="space-y-6 md:space-y-8">
           <AnimatePresence>
             {habits.map((habit) => (
               <motion.div 
                 key={habit.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="bg-card border border-border-notion rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-soft group relative"
               >
                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 md:gap-8">
                    <div className="flex items-center gap-4 md:gap-6 min-w-0">
                       <div 
                         className="w-12 h-12 md:w-16 md:h-16 rounded-[18px] md:rounded-[24px] flex-shrink-0 flex items-center justify-center text-white text-xl md:text-2xl shadow-lg"
                         style={{ backgroundColor: habit.color }}
                       >
                         {habit.name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                          <h3 className="text-lg md:text-xl font-black text-accent mb-1 truncate">{habit.name}</h3>
                          <div className="flex items-center gap-3">
                             <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-orange-500">
                                <Flame size={14} fill="currentColor" />
                                {calculateStreak(habit.id!)} ngày
                             </span>
                             <button 
                               onClick={() => handleDelete(habit.id!)}
                               className="text-foreground/10 hover:text-error transition-colors p-1"
                             >
                               <Trash2 size={12} />
                             </button>
                          </div>
                       </div>
                    </div>

                    <div className="flex overflow-x-auto pb-4 gap-2 custom-scrollbar mask-fade-right">
                       {last30Days.map(date => {
                         const isCompleted = getLogStatus(habit.id!, date);
                         const isToday = date === new Date().toISOString().split("T")[0];
                         
                         return (
                           <button 
                             key={date}
                             onClick={() => handleToggle(habit.id!, date, isCompleted)}
                             className={cn(
                               "w-12 h-16 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-90 flex-shrink-0",
                               isCompleted 
                                 ? "shadow-lg shadow-accent/5" 
                                 : "bg-active-notion/40 border-2 border-dashed border-border-notion hover:border-accent/20",
                               isToday && !isCompleted && "ring-2 ring-accent ring-offset-4 ring-offset-card"
                             )}
                             style={{ 
                               backgroundColor: isCompleted ? habit.color : undefined,
                               color: isCompleted ? "white" : "rgba(45, 42, 38, 0.2)"
                             }}
                           >
                             <span className="text-[10px] font-black uppercase opacity-60">
                               {new Date(date).toLocaleDateString("vi", { weekday: "short" }).replace("Th ", "T")}
                             </span>
                             {isCompleted ? <Check size={18} strokeWidth={4} /> : <span className="text-xs font-black">{new Date(date).getDate()}</span>}
                           </button>
                         );
                       })}
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>

           {habits.length === 0 && (
             <div className="py-40 text-center bg-card border border-dashed border-border-notion rounded-[60px] opacity-20">
                <Target size={64} className="mx-auto mb-6" />
                <p className="font-black uppercase tracking-[0.2em] text-xs">Chưa có thói quen nào được tạo</p>
             </div>
           )}
        </div>
      </div>

      <AnimatePresence>
        {isAddingHabit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsAddingHabit(false)}
               className="absolute inset-0 bg-background/80 backdrop-blur-md"
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="relative bg-card border border-border-notion w-full max-w-md rounded-[48px] p-10 shadow-2xl"
             >
                <div className="flex justify-between items-center mb-8">
                   <h2 className="text-2xl font-black text-accent tracking-tighter">Tạo thói quen mới</h2>
                   <button onClick={() => setIsAddingHabit(false)} className="p-2 hover:bg-active-notion rounded-full transition-colors">
                      <X size={20} />
                   </button>
                </div>
                <input 
                   autoFocus
                   type="text"
                   value={newName}
                   onChange={(e) => setNewName(e.target.value)}
                   placeholder="Tên thói quen (vd: Đọc sách, Chạy bộ...)"
                   className="w-full bg-active-notion border-none rounded-3xl p-6 text-lg font-bold outline-none mb-8 placeholder:text-foreground/10 text-accent"
                />
                
                <p className="text-[10px] font-black uppercase tracking-widest text-accent/40 mb-4 px-2">Chọn màu sắc</p>
                <div className="flex flex-wrap gap-4 mb-10 px-2">
                   {COLORS.map(color => (
                     <button 
                       key={color}
                       onClick={() => setSelectedColor(color)}
                       className={cn(
                         "w-10 h-10 rounded-full transition-all flex items-center justify-center",
                         selectedColor === color ? "ring-4 ring-offset-4 ring-offset-card ring-accent" : "hover:scale-110"
                       )}
                       style={{ backgroundColor: color }}
                     >
                        {selectedColor === color && <Check size={16} className="text-white" />}
                     </button>
                   ))}
                </div>

                <button 
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="w-full bg-accent text-background py-5 rounded-3xl font-black uppercase text-sm shadow-xl shadow-accent/20 hover:opacity-90 disabled:opacity-20 transition-all active:scale-95"
                >
                  Bắt đầu ngay
                </button>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageShell>
  );
}
