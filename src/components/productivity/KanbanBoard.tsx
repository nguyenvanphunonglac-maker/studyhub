"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { kanbanService, KanbanTask, TaskStatus, TaskPriority } from "@/services/kanbanService";
import { Plus, MoreHorizontal, Trash2, ChevronRight, Calendar, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import PageShell from "../layout/PageShell";

export default function KanbanBoard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [isAddingTask, setIsAddingTask] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("medium");

  useEffect(() => {
    if (!user) return;
    const unsub = kanbanService.subscribeToTasks(user.uid, setTasks);
    return () => unsub();
  }, [user]);

  const handleAddTask = async (status: TaskStatus) => {
    if (!user || !newTitle.trim()) return;
    await kanbanService.createTask(user.uid, {
      title: newTitle,
      description: "",
      status,
      priority: newPriority
    });
    setNewTitle("");
    setIsAddingTask(null);
  };

  const handleMoveTask = async (taskId: string, newStatus: TaskStatus) => {
    if (!user) return;
    await kanbanService.updateTask(user.uid, taskId, { status: newStatus });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!user || !confirm(t('delete_confirm'))) return;
    await kanbanService.deleteTask(user.uid, taskId);
  };

  const columns: { id: TaskStatus; label: string; icon: any; color: string }[] = [
    { id: "todo", label: t('todo_col'), icon: Clock, color: "text-accent/40" },
    { id: "doing", label: t('doing_col'), icon: AlertCircle, color: "text-warning" },
    { id: "done", label: t('done_col'), icon: CheckCircle2, color: "text-success" }
  ];

  return (
    <PageShell containerClassName="max-w-7xl">
      <div className="h-full flex flex-col">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-accent mb-4 tracking-tighter leading-tight">
            {t('task_manager_title')} <br /><span className="text-foreground/20">{t('task_manager_subtitle')}</span>
          </h1>
          <p className="text-foreground/40 font-bold max-w-2xl text-[10px] sm:text-xs uppercase tracking-widest">{t('productivity_dashboard')}</p>
        </header>

        <div className="flex-1 flex gap-8 min-h-[600px] pb-10 overflow-x-auto no-scrollbar">
          {columns.map(col => (
            <div key={col.id} className="flex-1 min-w-[320px] flex flex-col group">
              <div className="flex items-center justify-between mb-6 px-4">
                <div className="flex items-center gap-3">
                  <col.icon size={18} className={col.color} />
                  <h3 className="font-black text-sm uppercase tracking-[0.2em] text-accent/60">{col.label}</h3>
                  <span className="bg-active-notion text-accent/40 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                    {tasks.filter(t => t.status === col.id).length}
                  </span>
                </div>
                <button 
                  onClick={() => setIsAddingTask(col.id)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-active-notion text-accent/20 hover:text-accent transition-all active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </div>

              <div className="flex-1 bg-active-notion/30 rounded-[40px] p-4 flex flex-col gap-4 border border-transparent group-hover:border-border-notion transition-all duration-500 overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar">
                <AnimatePresence>
                  {isAddingTask === col.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-card rounded-3xl p-5 shadow-2xl border border-accent/10"
                    >
                      <input 
                        autoFocus
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddTask(col.id)}
                        placeholder={t('task_name_placeholder')}
                        className="w-full bg-transparent border-none outline-none font-bold text-accent placeholder:text-foreground/10 mb-4"
                      />
                      <div className="flex items-center justify-between">
                         <select 
                           value={newPriority} 
                           onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                           className="bg-active-notion text-[10px] font-black uppercase px-3 py-1.5 rounded-xl outline-none border-none text-accent/60"
                         >
                         <option value="low">{t('low_priority')}</option>
                           <option value="medium">{t('medium_priority')}</option>
                           <option value="high">{t('high_priority')}</option>
                         </select>
                         <div className="flex gap-2">
                            <button onClick={() => setIsAddingTask(null)} className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase text-foreground/20 hover:text-error transition-all">Hủy</button>
                            <button onClick={() => handleAddTask(col.id)} className="bg-accent text-background px-4 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-accent/20 active:scale-95 transition-all">Thêm</button>
                         </div>
                      </div>
                    </motion.div>
                  )}

                  {tasks.filter(t => t.status === col.id).map(task => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onDelete={() => handleDeleteTask(task.id!)} 
                      onMove={(newStatus) => handleMoveTask(task.id!, newStatus)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}

function TaskCard({ task, onDelete, onMove }: { task: KanbanTask, onDelete: () => void, onMove: (s: TaskStatus) => void }) {
  const { t } = useLanguage();
  const priorityColors = {
    low: "bg-success/10 text-success",
    medium: "bg-warning/10 text-warning",
    high: "bg-error/10 text-error"
  };

  const priorityLabels = {
     low: t('low_priority'),
     medium: t('medium_priority'),
     high: t('high_priority')
  };

  const statusFlow: Record<TaskStatus, TaskStatus[]> = {
    todo: ["doing", "done"],
    doing: ["todo", "done"],
    done: ["todo", "doing"]
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4 }}
      className="bg-card p-6 rounded-[32px] shadow-soft border border-border-notion hover:border-accent/10 transition-all group/card relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
         <button onClick={onDelete} className="p-2 text-foreground/20 hover:text-error hover:bg-error/10 rounded-xl transition-all"><Trash2 size={14}/></button>
      </div>

      <div className={cn("inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-4", priorityColors[task.priority])}>
        {priorityLabels[task.priority]}
      </div>

      <h4 className="text-accent font-bold text-sm leading-tight mb-6">{task.title}</h4>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground/20">
           <Calendar size={12} />
           <span className="text-[10px] font-bold">{t('recently')}</span>
        </div>
        <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
           {statusFlow[task.status].map(s => (
             <button 
               key={s}
               onClick={() => onMove(s)}
               className="w-7 h-7 flex items-center justify-center bg-active-notion rounded-lg text-accent/30 hover:text-accent hover:bg-accent/10 transition-all active:scale-90"
               title={`Chuyển sang ${s}`}
             >
               <ChevronRight size={14} />
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
}
