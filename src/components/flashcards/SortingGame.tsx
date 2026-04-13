"use client";

// Sorting Game (Khối hộp) — drag cards into correct category buckets
// Uses HTML5 drag-and-drop (no extra lib needed)

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardSet } from "@/services/flashcardService";
import { Trophy, RotateCcw, X, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SortingGameProps {
  set: FlashcardSet;
  onExit: () => void;
}

interface CardItem {
  id: string;
  front: string;
  back: string;
}

interface Bucket {
  id: string;
  label: string;       // category name (back of card)
  cards: CardItem[];
}

interface DragState {
  cardId: string;
  fromBucket: string | "hand"; // "hand" = unplaced pile
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// Group cards by their "back" value — each unique back = one bucket
function buildBuckets(cards: CardItem[]): Bucket[] {
  const map = new Map<string, Bucket>();
  for (const card of cards) {
    if (!map.has(card.back)) {
      map.set(card.back, { id: card.back, label: card.back, cards: [] });
    }
  }
  return Array.from(map.values());
}

export default function SortingGame({ set, onExit }: SortingGameProps) {
  const MAX = 12;
  const rawCards: CardItem[] = set.cards.slice(0, MAX).map((c, i) => ({
    id: String(i),
    front: c.front,
    back: c.back,
  }));

  const [hand, setHand] = useState<CardItem[]>(() => shuffle(rawCards));
  const [buckets, setBuckets] = useState<Bucket[]>(() => shuffle(buildBuckets(rawCards)));
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [finished, setFinished] = useState(false);
  const [feedback, setFeedback] = useState<{ cardId: string; ok: boolean } | null>(null);
  const dragging = useRef<DragState | null>(null);

  const total = rawCards.length;

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onDragStart = (cardId: string, fromBucket: string | "hand") => {
    dragging.current = { cardId, fromBucket };
  };

  const onDrop = (toBucketId: string) => {
    if (!dragging.current) return;
    const { cardId, fromBucket } = dragging.current;
    dragging.current = null;

    // Find the card
    let card: CardItem | undefined;
    if (fromBucket === "hand") {
      card = hand.find(c => c.id === cardId);
    } else {
      card = buckets.find(b => b.id === fromBucket)?.cards.find(c => c.id === cardId);
    }
    if (!card) return;

    const isCorrect = card.back === toBucketId;

    // Show feedback flash
    setFeedback({ cardId, ok: isCorrect });
    setTimeout(() => setFeedback(null), 600);

    if (isCorrect) {
      // Move card from source to bucket
      if (fromBucket === "hand") {
        setHand(prev => prev.filter(c => c.id !== cardId));
      } else {
        setBuckets(prev => prev.map(b =>
          b.id === fromBucket ? { ...b, cards: b.cards.filter(c => c.id !== cardId) } : b
        ));
      }
      setBuckets(prev => prev.map(b =>
        b.id === toBucketId ? { ...b, cards: [...b.cards, card!] } : b
      ));
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      if (newCorrect === total) setFinished(true);
    } else {
      setWrong(w => w + 1);
    }
  };

  const handleRestart = () => {
    setHand(shuffle(rawCards));
    setBuckets(shuffle(buildBuckets(rawCards)));
    setCorrect(0);
    setWrong(0);
    setFinished(false);
    setFeedback(null);
  };

  // ── Finished screen ────────────────────────────────────────────────────────
  if (finished) {
    const accuracy = Math.round((correct / (correct + wrong)) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center p-8"
      >
        <div className="w-20 h-20 bg-success/10 text-success rounded-[24px] flex items-center justify-center border border-success/20">
          <Trophy size={40} />
        </div>
        <h2 className="text-4xl font-extrabold text-accent tracking-tighter">Hoàn thành!</h2>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          <div className="p-4 glass rounded-2xl border border-success/20 text-center">
            <p className="text-2xl font-extrabold text-success">{correct}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mt-1">Đúng</p>
          </div>
          <div className="p-4 glass rounded-2xl border border-error/20 text-center">
            <p className="text-2xl font-extrabold text-error">{wrong}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mt-1">Sai</p>
          </div>
        </div>
        <p className="text-foreground/40 font-medium">Độ chính xác: <span className="text-accent font-bold">{accuracy}%</span></p>
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
    <div className="flex flex-col gap-5 w-full max-w-4xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-sm font-bold">
          <span className="flex items-center gap-1.5 text-success"><CheckCircle2 size={14} />{correct}</span>
          <span className="flex items-center gap-1.5 text-error"><XCircle size={14} />{wrong}</span>
          <span className="text-foreground/30">{correct}/{total}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleRestart} className="p-2 text-foreground/30 hover:text-accent hover:bg-active-notion rounded-xl transition-all">
            <RotateCcw size={18} />
          </button>
          <button onClick={onExit} className="p-2 text-foreground/30 hover:text-error hover:bg-error/5 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-active-notion rounded-full overflow-hidden">
        <motion.div className="h-full bg-accent rounded-full" animate={{ width: `${(correct / total) * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Buckets */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {buckets.map(bucket => (
          <div
            key={bucket.id}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(bucket.id)}
            className="min-h-[120px] p-3 rounded-2xl border-2 border-dashed border-border-notion bg-active-notion/20 flex flex-col gap-2 transition-colors hover:border-accent/30"
          >
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-1">{bucket.label}</p>
            {bucket.cards.map(card => (
              <div
                key={card.id}
                draggable
                onDragStart={() => onDragStart(card.id, bucket.id)}
                className="px-3 py-2 bg-success/10 border border-success/20 rounded-xl text-xs font-bold text-success cursor-grab active:cursor-grabbing"
              >
                {card.front}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Hand — cards to place */}
      <div className="mt-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3">Kéo thẻ vào đúng nhóm</p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {hand.map(card => {
              const fb = feedback?.cardId === card.id;
              return (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  draggable
                  onDragStart={() => onDragStart(card.id, "hand")}
                  className={cn(
                    "px-4 py-2.5 rounded-2xl border-2 text-sm font-bold cursor-grab active:cursor-grabbing select-none transition-all",
                    fb && feedback?.ok  ? "border-success bg-success/10 text-success" :
                    fb && !feedback?.ok ? "border-error bg-error/10 text-error animate-shake" :
                    "border-border-notion bg-card/60 text-accent hover:border-accent/40 hover:bg-accent/5"
                  )}
                >
                  {card.front}
                </motion.div>
              );
            })}
          </AnimatePresence>
          {hand.length === 0 && correct < total && (
            <p className="text-foreground/20 text-xs font-bold italic">Kéo thẻ từ các nhóm để sắp xếp lại...</p>
          )}
        </div>
      </div>
    </div>
  );
}
