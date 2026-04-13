"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { pomodoroService, PomodoroSession } from "@/services/pomodoroService";
import { Play, Pause, RotateCcw, Coffee, BookOpen, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import PageShell from "../layout/PageShell";

const MODES = {
  focus: 25 * 60,
  short: 5 * 60,
  long: 15 * 60,
} as const;

const DAILY_GOAL = 8;

export default function Pomodoro() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState(MODES.focus);
  const [totalTime, setTotalTime] = useState(MODES.focus);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<keyof typeof MODES>("focus");
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);

  // Use Date-based timer to avoid drift
  const endTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = pomodoroService.subscribeToTodaySessions(user.uid, setSessions);
    return () => unsub();
  }, [user]);

  useEffect(() => {
    if (isActive) {
      endTimeRef.current = Date.now() + timeLeft * 1000;
      const tick = () => {
        const remaining = Math.round((endTimeRef.current! - Date.now()) / 1000);
        if (remaining <= 0) {
          setTimeLeft(0);
          setIsActive(false);
          playAlarm();
          if (user) pomodoroService.saveSession(user.uid, mode, totalTime);
        } else {
          setTimeLeft(remaining);
          rafRef.current = requestAnimationFrame(tick);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isActive]);

  const toggleTimer = () => {
    if (!isActive && timeLeft === 0) return;
    setIsActive(prev => !prev);
  };

  const adjustTime = (amount: number) => {
    if (isActive) return;
    const newTime = Math.max(60, timeLeft + amount);
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(MODES[mode]);
    setTotalTime(MODES[mode]);
  };

  const switchMode = (newMode: keyof typeof MODES) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(MODES[newMode]);
    setTotalTime(MODES[newMode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const playAlarm = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {}
  };

  const focusSessions = sessions.filter(s => s.mode === "focus");
  const totalSecondsToday = focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const totalMinsToday = Math.floor(totalSecondsToday / 60);
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <PageShell>
      <div className="max-w-2xl w-full">
        <header className="text-center mb-12 sm:mb-20">
          <div className="flex items-center justify-center gap-3 text-accent font-black uppercase text-[10px] tracking-[0.3em] mb-4">
            <Timer size={14} />
            {t('pomodoro_title')}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-accent mb-6 tracking-tighter leading-tight">
            Tập trung tuyệt đối <br />
            <span className="text-foreground/20">Mỗi phiên học là một bước tiến</span>
          </h1>
          <p className="text-foreground/40 font-bold max-w-md mx-auto text-sm">{t('pomodoro_desc')}</p>
        </header>

        <div className="bg-card border border-border-notion rounded-[60px] p-8 md:p-16 shadow-soft relative overflow-hidden">
          <div
            className="absolute bottom-0 left-0 h-1.5 bg-accent/20 transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />

          <div className="flex justify-center gap-2 mb-16 p-1.5 bg-active-notion rounded-[24px]">
            <ModeButton active={mode === "focus"} label={t('focus')} onClick={() => switchMode("focus")} icon={<BookOpen size={16} />} />
            <ModeButton active={mode === "short"} label={t('short_break')} onClick={() => switchMode("short")} icon={<Coffee size={16} />} />
            <ModeButton active={mode === "long"} label={t('long_break')} onClick={() => switchMode("long")} icon={<RotateCcw size={16} />} />
          </div>

          <div className="flex flex-col items-center mb-16">
            <div className="flex items-center gap-6 md:gap-12">
              <button
                onClick={() => adjustTime(-60)}
                disabled={isActive}
                className="w-12 h-12 rounded-full border border-border-notion flex items-center justify-center text-foreground/20 hover:text-accent hover:border-accent transition-all active:scale-90 disabled:opacity-20"
              >
                <span className="text-2xl font-light">-</span>
              </button>
              <motion.div
                key={Math.floor(timeLeft / 60)}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-8xl md:text-[160px] font-black text-accent tracking-tighter tabular-nums leading-none"
              >
                {formatTime(timeLeft)}
              </motion.div>
              <button
                onClick={() => adjustTime(60)}
                disabled={isActive}
                className="w-12 h-12 rounded-full border border-border-notion flex items-center justify-center text-foreground/20 hover:text-accent hover:border-accent transition-all active:scale-90 disabled:opacity-20"
              >
                <span className="text-2xl font-light">+</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={cn(
                "flex-1 h-20 md:h-24 flex items-center justify-center gap-4 rounded-[32px] text-xl font-black uppercase tracking-widest shadow-2xl transition-all active:scale-95",
                isActive
                  ? "bg-card border-2 border-accent text-accent shadow-accent/5"
                  : "bg-accent text-background hover:scale-[1.02]"
              )}
            >
              {isActive ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
              {isActive ? t('pause') : "Bắt đầu"}
            </button>
            <button
              onClick={resetTimer}
              className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-card border border-border-notion rounded-[32px] text-foreground/20 hover:text-accent hover:bg-active-notion transition-all shadow-soft"
            >
              <RotateCcw size={28} />
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-8 bg-card border border-border-notion rounded-[40px] shadow-soft">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/20 mb-3">{t('daily_goal')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-accent">{focusSessions.length}</span>
              <span className="text-foreground/20 font-bold text-sm">/ {DAILY_GOAL} phiên</span>
            </div>
            <div className="mt-6 h-1 w-full bg-active-notion rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${Math.min((focusSessions.length / DAILY_GOAL) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="p-8 bg-card border border-border-notion rounded-[40px] shadow-soft">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-foreground/20 mb-3">{t('time_studied')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-accent">
                {totalMinsToday >= 60
                  ? `${Math.floor(totalMinsToday / 60)}h ${totalMinsToday % 60}m`
                  : `${totalMinsToday}m`}
              </span>
            </div>
            <p className="mt-6 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
              Hôm nay • {focusSessions.length} phiên tập trung
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function ModeButton({ active, label, onClick, icon }: { active: boolean, label: string, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all",
        active
          ? "bg-accent text-background shadow-lg shadow-accent/5 scale-105"
          : "text-foreground/30 hover:bg-background/40 hover:text-accent"
      )}
    >
      <span className={cn("transition-colors", active ? "text-background" : "text-foreground/20")}>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
