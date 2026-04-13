"use client";

// Blast Game — asteroids fall from top, type the answer to destroy them before they hit the bottom

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardSet } from "@/services/flashcardService";
import { Trophy, RotateCcw, X, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlastGameProps {
  set: FlashcardSet;
  onExit: () => void;
}

interface Asteroid {
  id: string;
  front: string;
  back: string;
  x: number;       // 0-100 percent
  speed: number;   // seconds to fall
  startTime: number;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyOk(input: string, answer: string): boolean {
  const a = input.trim().toLowerCase();
  const b = answer.trim().toLowerCase();
  if (!a || a.length < 2) return false; // require at least 2 chars
  if (a === b) return true;
  // Only allow fuzzy if input is at least 60% the length of the answer
  if (a.length < b.length * 0.6) return false;
  const dist = levenshtein(a, b);
  // Allow 1 typo for answers up to 6 chars, 2 typos for longer
  const threshold = b.length <= 6 ? 1 : 2;
  return dist <= threshold;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

const LIVES = 3;
const BASE_SPEED = 12; // seconds
const SPAWN_INTERVAL = 3000; // ms

export default function BlastGame({ set, onExit }: BlastGameProps) {
  const cards = set.cards.filter(c => c.front && c.back);
  const pool = useRef(shuffle(cards));
  const poolIdx = useRef(0);

  const [asteroids, setAsteroids] = useState<Asteroid[]>([]);
  const [input, setInput] = useState("");
  const [lives, setLives] = useState(LIVES);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [blasted, setBlasted] = useState<string[]>([]); // ids being destroyed
  const [missed, setMissed] = useState<string[]>([]);   // ids that hit bottom
  const [finished, setFinished] = useState(false);
  const [level, setLevel] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);
  const spawnRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef<number>(0);
  const startRef = useRef(Date.now());

  const getSpeed = () => Math.max(5, BASE_SPEED - level * 1.5);

  const spawnAsteroid = useCallback(() => {
    if (pool.current.length === 0) return;
    const card = pool.current[poolIdx.current % pool.current.length];
    poolIdx.current++;
    const asteroid: Asteroid = {
      id: `${Date.now()}-${Math.random()}`,
      front: card.front,
      back: card.back,
      x: 5 + Math.random() * 80,
      speed: getSpeed(),
      startTime: Date.now(),
    };
    setAsteroids(prev => [...prev, asteroid]);
  }, [level]);

  // Spawn loop
  useEffect(() => {
    if (finished) return;
    spawnAsteroid();
    spawnRef.current = setInterval(spawnAsteroid, SPAWN_INTERVAL);
    return () => { if (spawnRef.current) clearInterval(spawnRef.current); };
  }, [finished, spawnAsteroid]);

  // Check if asteroids hit bottom
  useEffect(() => {
    if (finished) return;
    const check = () => {
      const now = Date.now();
      setAsteroids(prev => {
        const hit: string[] = [];
        const remaining = prev.filter(a => {
          const elapsed = (now - a.startTime) / 1000;
          if (elapsed >= a.speed) { hit.push(a.id); return false; }
          return true;
        });
        if (hit.length > 0) {
          setMissed(m => [...m, ...hit]);
          setCombo(0);
          setLives(l => {
            const next = l - hit.length;
            if (next <= 0) setFinished(true);
            return Math.max(0, next);
          });
          setTimeout(() => setMissed(m => m.filter(id => !hit.includes(id))), 500);
        }
        return remaining;
      });
      frameRef.current = requestAnimationFrame(check);
    };
    frameRef.current = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frameRef.current);
  }, [finished]);

  // Level up every 10 points
  useEffect(() => {
    setLevel(Math.floor(score / 10) + 1);
  }, [score]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInput(val);

    // Check against all visible asteroids
    const match = asteroids.find(a => fuzzyOk(val, a.back));
    if (match) {
      setBlasted(prev => [...prev, match.id]);
      setTimeout(() => {
        setAsteroids(prev => prev.filter(a => a.id !== match.id));
        setBlasted(prev => prev.filter(id => id !== match.id));
      }, 400);
      setInput("");
      setScore(s => s + 1 + combo);
      setCombo(c => c + 1);
    }
  };

  const handleRestart = () => {
    pool.current = shuffle(cards);
    poolIdx.current = 0;
    setAsteroids([]);
    setInput("");
    setLives(LIVES);
    setScore(0);
    setCombo(0);
    setBlasted([]);
    setMissed([]);
    setFinished(false);
    setLevel(1);
    startRef.current = Date.now();
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8"
      >
        <div className="w-20 h-20 bg-warning/10 text-warning rounded-[24px] flex items-center justify-center border border-warning/20">
          <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-accent tracking-tighter">Game Over!</h2>
        <div className="p-6 glass rounded-2xl border border-border-notion space-y-1">
          <p className="text-5xl font-extrabold text-accent">{score}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Điểm số</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRestart} className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-notion text-accent font-bold text-sm hover:bg-active-notion transition-all">
            <RotateCcw size={16} /> Chơi lại
          </button>
          <button onClick={onExit} className="px-6 py-3 rounded-2xl bg-accent text-background font-bold text-sm hover:opacity-90 transition-all">
            Thoát
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-3xl mx-auto py-4 px-4">
      {/* HUD */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {Array.from({ length: LIVES }).map((_, i) => (
              <Heart key={i} size={18} className={i < lives ? "text-error fill-error" : "text-foreground/20"} />
            ))}
          </div>
          {combo > 1 && (
            <motion.span key={combo} initial={{ scale: 1.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-xs font-black text-warning uppercase tracking-widest"
            >
              x{combo} combo!
            </motion.span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-extrabold text-accent">⚡ {score}</span>
          <span className="text-[10px] font-bold text-foreground/30 uppercase">Lv.{level}</span>
          <button onClick={onExit} className="p-1.5 text-foreground/30 hover:text-error rounded-xl transition-all">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Game field */}
      <div className="relative w-full bg-active-notion/20 border border-border-notion rounded-2xl overflow-hidden"
        style={{ height: "380px" }}
      >
        {/* Stars background */}
        {[...Array(20)].map((_, i) => (
          <div key={i} className="absolute w-0.5 h-0.5 bg-foreground/10 rounded-full"
            style={{ left: `${(i * 37 + 11) % 100}%`, top: `${(i * 53 + 7) % 100}%` }}
          />
        ))}

        {/* Bottom danger line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-error/30" />

        {/* Asteroids */}
        <AnimatePresence>
          {asteroids.map(a => {
            const isBlasted = blasted.includes(a.id);
            const isMissed  = missed.includes(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ top: "-60px" }}
                animate={isBlasted ? { scale: 2, opacity: 0 } : isMissed ? { opacity: 0 } : { top: "100%" }}
                transition={isBlasted || isMissed ? { duration: 0.3 } : { duration: a.speed, ease: "linear" }}
                className={cn(
                  "absolute px-3 py-2 rounded-xl border-2 text-xs font-bold text-center max-w-[140px] cursor-default select-none",
                  isBlasted ? "border-success bg-success/20 text-success" :
                  isMissed  ? "border-error bg-error/20 text-error" :
                  "border-warning/60 bg-warning/10 text-warning shadow-lg shadow-warning/10"
                )}
                style={{ left: `${a.x}%`, transform: "translateX(-50%)" }}
              >
                {isBlasted ? "💥" : "☄️"} {a.front}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Empty state */}
        {asteroids.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-foreground/20 text-xs font-bold uppercase tracking-widest">Chuẩn bị...</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={handleInput}
          placeholder="Gõ đáp án để bắn thiên thạch..."
          className="w-full px-5 py-4 rounded-2xl border-2 border-border-notion bg-active-notion/40 text-accent font-bold text-base outline-none focus:border-accent/40 placeholder:text-foreground/20 transition-all"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
          Enter = bắn
        </span>
      </div>

      <p className="text-[10px] text-foreground/20 font-medium text-center">
        Gõ đáp án (mặt sau thẻ) để phá hủy thiên thạch trước khi chúng chạm đáy
      </p>
    </div>
  );
}
