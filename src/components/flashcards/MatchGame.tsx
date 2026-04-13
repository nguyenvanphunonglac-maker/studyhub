"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardSet } from "@/services/flashcardService";
import { Trophy, RotateCcw, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface MatchGameProps {
  set: FlashcardSet;
  onExit: () => void;
}

interface Tile {
  id: string;       // unique per tile
  pairId: string;   // shared between question & answer
  text: string;
  type: "question" | "answer";
}

type TileState = "idle" | "selected" | "matched" | "wrong";

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function MatchGame({ set, onExit }: MatchGameProps) {
  const MAX_PAIRS = 6;
  const cards = set.cards.slice(0, MAX_PAIRS);

  const [tiles, setTiles] = useState<Tile[]>(() => {
    const pairs: Tile[] = cards.flatMap((card, i) => [
      { id: `q-${i}`, pairId: String(i), text: card.front, type: "question" },
      { id: `a-${i}`, pairId: String(i), text: card.back,  type: "answer"   },
    ]);
    return shuffle(pairs);
  });

  const [states, setStates] = useState<Record<string, TileState>>(() =>
    Object.fromEntries(tiles.map(t => [t.id, "idle"]))
  );
  const [selected, setSelected] = useState<string | null>(null);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);

  const totalPairs = cards.length;

  // Timer
  useEffect(() => {
    if (finished) return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [finished]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    return `${m > 0 ? m + "m " : ""}${s % 60}s`;
  };

  const handleTileClick = useCallback((tileId: string) => {
    const state = states[tileId];
    if (state === "matched" || state === "wrong") return;

    // Deselect if clicking same tile
    if (selected === tileId) {
      setSelected(null);
      setStates(prev => ({ ...prev, [tileId]: "idle" }));
      return;
    }

    // First selection
    if (!selected) {
      setSelected(tileId);
      setStates(prev => ({ ...prev, [tileId]: "selected" }));
      return;
    }

    // Second selection — check match
    const first = tiles.find(t => t.id === selected)!;
    const second = tiles.find(t => t.id === tileId)!;

    if (first.pairId === second.pairId && first.type !== second.type) {
      // Correct match
      setStates(prev => ({ ...prev, [selected]: "matched", [tileId]: "matched" }));
      setSelected(null);
      const newCount = matchedCount + 1;
      setMatchedCount(newCount);
      if (newCount === totalPairs) {
        setFinished(true);
        setBestTime(prev => prev === null ? elapsed : Math.min(prev, elapsed));
      }
    } else {
      // Wrong
      setStates(prev => ({ ...prev, [selected]: "wrong", [tileId]: "wrong" }));
      setSelected(null);
      setTimeout(() => {
        setStates(prev => ({
          ...prev,
          [selected]: prev[selected] === "wrong" ? "idle" : prev[selected],
          [tileId]:   prev[tileId]   === "wrong" ? "idle" : prev[tileId],
        }));
      }, 700);
    }
  }, [selected, states, tiles, matchedCount, totalPairs, elapsed]);

  const handleRestart = () => {
    const newTiles = shuffle(tiles.map(t => ({ ...t })));
    setTiles(newTiles);
    setStates(Object.fromEntries(newTiles.map(t => [t.id, "idle"])));
    setSelected(null);
    setMatchedCount(0);
    setElapsed(0);
    setFinished(false);
  };

  const tileClass = (id: string) => {
    const s = states[id];
    return cn(
      "relative px-4 py-3 rounded-2xl border-2 text-sm font-bold cursor-pointer transition-all duration-200 text-left leading-snug select-none",
      s === "idle"     && "border-border-notion bg-card/60 text-accent hover:border-accent/40 hover:bg-accent/5 active:scale-95",
      s === "selected" && "border-accent bg-accent/10 text-accent scale-[1.02] shadow-lg shadow-accent/20",
      s === "matched"  && "border-success/40 bg-success/10 text-success cursor-default opacity-60",
      s === "wrong"    && "border-error/60 bg-error/10 text-error animate-shake",
    );
  };

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8"
      >
        <div className="w-20 h-20 bg-warning/10 text-warning rounded-[24px] flex items-center justify-center shadow-2xl border border-warning/20">
          <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-accent tracking-tighter">Hoàn thành!</h2>
        <p className="text-foreground/40 font-medium">Bạn đã ghép đúng tất cả {totalPairs} cặp</p>
        <div className="px-8 py-4 glass rounded-2xl border border-border-notion">
          <p className="text-3xl font-extrabold text-accent">{formatTime(elapsed)}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mt-1">Thời gian hoàn thành</p>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRestart}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-border-notion text-accent font-bold text-sm hover:bg-active-notion transition-all"
          >
            <RotateCcw size={16} /> Chơi lại
          </button>
          <button
            onClick={onExit}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-background font-bold text-sm hover:opacity-90 transition-all"
          >
            Thoát
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 glass rounded-xl border border-border-notion text-sm font-bold text-accent">
            <Clock size={14} className="text-foreground/40" />
            {formatTime(elapsed)}
          </div>
          <div className="px-3 py-1.5 glass rounded-xl border border-border-notion text-sm font-bold text-foreground/40">
            {matchedCount}/{totalPairs} cặp
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRestart}
            className="p-2 text-foreground/30 hover:text-accent hover:bg-active-notion rounded-xl transition-all"
            title="Chơi lại"
          >
            <RotateCcw size={18} />
          </button>
          <button
            onClick={onExit}
            className="p-2 text-foreground/30 hover:text-error hover:bg-error/5 rounded-xl transition-all"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-active-notion rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${(matchedCount / totalPairs) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Instruction */}
      <p className="text-xs text-foreground/30 font-medium text-center">
        Chọn một câu hỏi và đáp án tương ứng để ghép cặp
      </p>

      {/* Tiles grid */}
      <div className="grid grid-cols-2 gap-3">
        {tiles.map(tile => (
          <motion.button
            key={tile.id}
            layout
            onClick={() => handleTileClick(tile.id)}
            className={tileClass(tile.id)}
            whileTap={states[tile.id] !== "matched" ? { scale: 0.97 } : {}}
          >
            <span className="block text-[9px] font-black uppercase tracking-widest text-foreground/20 mb-1">
              {tile.type === "question" ? "Câu hỏi" : "Đáp án"}
            </span>
            {tile.text}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
