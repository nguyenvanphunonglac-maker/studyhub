"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { goalService, Goal, GoalType, GoalPeriod } from "@/services/goalService";
import { quizService } from "@/services/quizService";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Plus, Trash2, CheckCircle2, Clock, TrendingUp, X, ChevronRight, Flame, Trophy, BookOpen } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import PageShell from "../layout/PageShell";
import ConfirmModal from "../ui/ConfirmModal";

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

const GOAL_TEMPLATES = [
  { label: "Đạt điểm cao trong bài kiểm tra", type: 'quiz_score' as GoalType, unit: "%", defaultTarget: 80, icon: "🎯" },
  { label: "Hoàn thành số bài kiểm tra", type: 'quiz_count' as GoalType, unit: "bài", defaultTarget: 10, icon: "📝" },
  { label: "Học liên tục nhiều ngày", type: 'study_days' as GoalType, unit: "ngày", defaultTarget: 7, icon: "🔥" },
  { label: "Mục tiêu tùy chỉnh", type: 'custom' as GoalType, unit: "", defaultTarget: 1, icon: "⭐" },
];

const PERIOD_LABELS: Record<GoalPeriod, string> = {
  daily: "Hôm nay",
  weekly: "Tuần này",
  monthly: "Tháng này",
  custom: "Tùy chỉnh",
};

function getPeriodDates(period: GoalPeriod): { start: Date; end: Date } {
  const now = new Date();
  if (period === 'daily') {
    const start = new Date(now); start.setHours(0, 0, 0, 0);
    const end = new Date(now); end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'weekly') {
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  if (period === 'monthly') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
  }
  return { start: now, end: now };
}

function ProgressRing({ pct, size = 64, stroke = 5, color = "stroke-accent" }: { pct: number; size?: number; stroke?: number; color?: string }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-border-notion" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" className={cn("transition-all duration-700", color)} />
    </svg>
  );
}

export default function GoalTracker() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string }>({ open: false, id: "" });

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(80);
  const [unit, setUnit] = useState("%");
  const [period, setPeriod] = useState<GoalPeriod>("weekly");
  const [customEnd, setCustomEnd] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = goalService.subscribeToGoals(user.uid, setGoals);
    // Auto-update quiz_count and quiz_score goals from quiz results
    const unsubResults = quizService.subscribeToResults(user.uid, async (results) => {
      if (!goals.length) return;
      for (const goal of goals) {
        if (goal.status !== 'active') continue;
        const start = goal.startDate.toDate();
        const end = goal.endDate.toDate();
        const inRange = results.filter(r => {
          const d = r.date.toDate();
          return d >= start && d <= end;
        });
        if (goal.type === 'quiz_count') {
          await goalService.updateProgress(user.uid, goal.id!, inRange.length);
        } else if (goal.type === 'quiz_score') {
          if (inRange.length > 0) {
            const avg = inRange.reduce((s, r) => s + Math.round((r.score / r.total) * 100), 0) / inRange.length;
            await goalService.updateProgress(user.uid, goal.id!, Math.round(avg));
          }
        }
      }
    });
    return () => { unsub(); unsubResults(); };
  }, [user, goals.length]);

  const handleCreate = async () => {
    if (!user || !title) return;
    const tpl = GOAL_TEMPLATES[selectedTemplate];
    const dates = period !== 'custom' ? getPeriodDates(period) : {
      start: new Date(),
      end: customEnd ? new Date(customEnd) : new Date(Date.now() + 7 * 86400000),
    };
    await goalService.createGoal(user.uid, {
      title,
      description,
      type: tpl.type,
      period,
      target,
      unit,
      startDate: Timestamp.fromDate(dates.start),
      endDate: Timestamp.fromDate(dates.end),
    });
    setIsCreating(false);
    setTitle(""); setDescription(""); setTarget(80); setUnit("%"); setPeriod("weekly"); setCustomEnd("");
  };

  const handleTemplateSelect = (idx: number) => {
    setSelectedTemplate(idx);
    const tpl = GOAL_TEMPLATES[idx];
    setTarget(tpl.defaultTarget);
    setUnit(tpl.unit);
    if (!title) setTitle(tpl.label);
  };

  const active = goals.filter(g => g.status === 'active');
  const completed = goals.filter(g => g.status === 'completed');

  return (
    <PageShell>
      <ConfirmModal
        open={confirmDelete.open}
        message="Xóa mục tiêu này?"
        onConfirm={async () => { await goalService.deleteGoal(user!.uid, confirmDelete.id); setConfirmDelete({ open: false, id: "" }); }}
        onCancel={() => setConfirmDelete({ open: false, id: "" })}
      />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <header className="mb-12">
          <div className="flex items-center gap-2.5 text-accent/40 font-bold uppercase text-[10px] tracking-[0.3em] mb-4">
            <Target size={14} className="text-warning" />
            <span>{t('goal_tracker_title')}</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-accent tracking-tighter leading-tight">
              {t('your_goals')}
            </h1>
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-accent text-background px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-accent/10 flex-shrink-0"
            >
              <Plus size={16} /> {t('create_goal')}
            </button>
          </div>

          {/* Stats bar */}
          {goals.length > 0 && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { label: t('active_goals'), value: active.length, icon: <Flame size={18} />, color: "text-warning" },
                { label: t('completed_goals_label'), value: completed.length, icon: <Trophy size={18} />, color: "text-success" },
                { label: t('total_goals'), value: goals.length, icon: <Target size={18} />, color: "text-accent" },
              ].map((s, i) => (
                <div key={i} className="p-5 glass rounded-2xl border border-border-notion flex items-center gap-4">
                  <span className={s.color}>{s.icon}</span>
                  <div>
                    <p className="text-2xl font-extrabold text-accent">{s.value}</p>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </header>

        {/* Create Modal */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-card border border-border-notion rounded-3xl p-8 w-full max-w-lg shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-extrabold text-accent">{t('create_goal')}</h2>
                  <button onClick={() => setIsCreating(false)} className="p-2 hover:bg-active-notion rounded-xl transition-colors">
                    <X size={18} className="text-foreground/40" />
                  </button>
                </div>

                {/* Templates */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {GOAL_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      onClick={() => handleTemplateSelect(i)}
                      className={cn(
                        "p-3 rounded-xl border-2 text-left transition-all",
                        selectedTemplate === i ? "border-accent bg-accent/5" : "border-border-notion hover:border-accent/30"
                      )}
                    >
                      <span className="text-lg">{tpl.icon}</span>
                      <p className="text-xs font-bold text-accent mt-1 leading-tight">{tpl.label}</p>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block">{t('goal_name_label')}</label>
                    <input
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder={t('goal_name_placeholder')}
                      className="w-full p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-medium text-accent placeholder:text-foreground/20 focus:ring-1 focus:ring-accent/20"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block">{t('goal_target_label')}</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={target}
                          onChange={e => setTarget(Number(e.target.value))}
                          className="flex-1 p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-bold text-accent focus:ring-1 focus:ring-accent/20"
                        />
                        <input
                          value={unit}
                          onChange={e => setUnit(e.target.value)}
                          placeholder="đơn vị"
                          className="w-20 p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-medium text-accent placeholder:text-foreground/20 focus:ring-1 focus:ring-accent/20"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block">{t('deadline_label')}</label>
                      <select
                        value={period}
                        onChange={e => setPeriod(e.target.value as GoalPeriod)}
                        className="w-full p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-medium text-accent focus:ring-1 focus:ring-accent/20"
                      >
                        {Object.entries(PERIOD_LABELS).map(([k, v]) => (
                          <option key={k} value={k} className="bg-card">{v}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {period === 'custom' && (
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block">{t('end_date_label')}</label>
                      <input
                        type="date"
                        value={customEnd}
                        onChange={e => setCustomEnd(e.target.value)}
                        className="w-full p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-medium text-accent focus:ring-1 focus:ring-accent/20"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5 block">{t('note_optional')}</label>
                    <textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      placeholder={t('note_placeholder')}
                      rows={2}
                      className="w-full p-3 bg-active-notion/40 rounded-xl outline-none text-sm font-medium text-accent placeholder:text-foreground/20 resize-none focus:ring-1 focus:ring-accent/20"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button onClick={() => setIsCreating(false)} className="flex-1 py-3 rounded-xl font-bold text-sm text-foreground/40 hover:bg-active-notion transition-colors">
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!title}
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-accent text-background hover:opacity-90 disabled:opacity-30 transition-all shadow-lg"
                  >
                    {t('create_goal')}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {goals.length === 0 && (
          <div className="text-center py-32 border-2 border-dashed border-border-notion rounded-3xl">
            <Target size={48} className="mx-auto text-foreground/10 mb-4" />
            <p className="font-bold text-foreground/30 mb-2">{t('no_goals')}</p>
            <p className="text-sm text-foreground/20 mb-6">{t('no_goals_desc')}</p>
            <button onClick={() => setIsCreating(true)} className="bg-accent text-background px-8 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              {t('create_first_goal')}
            </button>
          </div>
        )}

        {/* Active Goals */}
        {active.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Flame size={14} className="text-warning" /> {t('active_goals')} ({active.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {active.map(goal => <GoalCard key={goal.id} goal={goal} onDelete={id => setConfirmDelete({ open: true, id })} onUpdateProgress={async (val) => { await goalService.updateProgress(user!.uid, goal.id!, val); }} />)}
            </div>
          </section>
        )}

        {/* Completed Goals */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-bold text-foreground/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Trophy size={14} className="text-success" /> {t('completed_goals_label')} ({completed.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completed.map(goal => <GoalCard key={goal.id} goal={goal} onDelete={id => setConfirmDelete({ open: true, id })} />)}
            </div>
          </section>
        )}
      </div>
    </PageShell>
  );
}

function GoalCard({ goal, onDelete, onUpdateProgress }: {
  goal: Goal;
  onDelete: (id: string) => void;
  onUpdateProgress?: (val: number) => void;
}) {
  const { t } = useLanguage();
  const pct = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  const isCompleted = goal.status === 'completed';
  const daysLeft = Math.ceil((goal.endDate.toDate().getTime() - Date.now()) / 86400000);
  const tpl = GOAL_TEMPLATES.find(t => t.type === goal.type) || GOAL_TEMPLATES[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "p-6 glass rounded-2xl border-2 transition-all",
        isCompleted ? "border-success/30 bg-success/5" : "border-border-notion hover:border-accent/20"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <ProgressRing pct={pct} size={60} stroke={5} color={isCompleted ? "stroke-success" : "stroke-accent"} />
            <span className="absolute inset-0 flex items-center justify-center text-lg">{tpl.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-extrabold text-accent truncate">{goal.title}</p>
            <p className="text-xs text-foreground/40 mt-0.5">
              {goal.current}{goal.unit} / {goal.target}{goal.unit}
              <span className="ml-2 font-bold text-accent">{pct}%</span>
            </p>
            {goal.description && <p className="text-xs text-foreground/30 mt-1 truncate">{goal.description}</p>}
          </div>
        </div>
        <button onClick={() => onDelete(goal.id!)} className="p-2 text-foreground/20 hover:text-error hover:bg-error/10 rounded-xl transition-all flex-shrink-0">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-2 bg-active-notion rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", isCompleted ? "bg-success" : "bg-accent")}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className={cn("text-[10px] font-bold uppercase tracking-widest", isCompleted ? "text-success" : daysLeft <= 1 ? "text-error" : "text-foreground/30")}>
          {isCompleted ? t('completed_badge') : daysLeft > 0 ? `${t('days_left').replace('{n}', String(daysLeft))}` : t('expired')}
        </span>
        <span className="text-[10px] font-bold text-foreground/20 uppercase">{PERIOD_LABELS[goal.period]}</span>
      </div>

      {/* Manual progress update for custom goals */}
      {goal.type === 'custom' && !isCompleted && onUpdateProgress && (
        <div className="mt-4 flex items-center gap-2">
          <input
            type="number"
            defaultValue={goal.current}
            min={0}
            max={goal.target}
            onBlur={e => onUpdateProgress(Number(e.target.value))}
            className="w-20 p-2 bg-active-notion/40 rounded-lg text-xs font-bold text-accent outline-none focus:ring-1 focus:ring-accent/20"
          />
          <span className="text-xs text-foreground/30">{goal.unit} ({t('manual_update')})</span>
        </div>
      )}
    </motion.div>
  );
}
