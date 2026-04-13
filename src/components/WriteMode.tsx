"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlashcardSet } from "@/services/flashcardService";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, X, Trophy, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface WriteModeProps {
  set: FlashcardSet;
  onExit: () => void;
}

type AnswerState = "idle" | "correct" | "close" | "wrong";

// Levenshtein distance for fuzzy match
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function fuzzyMatch(input: string, answer: string): AnswerState {
  const a = input.trim().toLowerCase();
  const b = answer.trim().toLowerCase();
  if (a === b) return "correct";
  const dist = levenshtein(a, b);
  const threshold = Math.max(1, Math.floor(b.length * 0.25)); // 25% tolerance
  if (dist <= threshold) return "close";
  return "wrong";
}

interface CardResult {
  front: string;
  back: string;
  userAnswer: string;
  state: AnswerState;
}

export default function WriteMode({ set, onExit }: WriteModeProps) {
  const cards = set.cards;
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState("");
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [results, setResults] = useState<CardResult[]>([]);
  const [finished, setFinished] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const card = cards[idx];
  const isLast = idx === cards.length - 1;

  useEffect(() => {
    inputRef.current?.focus();
  }, [idx]);

  const handleSubmit = () => {
    if (!input.trim() || answerState !== "idle") return;
    const state = fuzzyMatch(input, card.back);
    setAnswerState(state);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setResults(prev => [...prev, {
      front: card.front,
      back: card.back,
      userAnswer: input,
      state: answerState,
    }]);

    if (isLast) {
      setFinished(true);
      return;
    }
    setIdx(i => i + 1);
    setInput("");
    setAnswerState("idle");
    setShowAnswer(false);
  };

  const handleSkip = () => {
    setResults(prev => [...prev, {
      front: card.front,
      back: card.back,
      userAnswer: "",
      state: "wrong",
    }]);
    if (isLast) { setFinished(true); return; }
    setIdx(i => i + 1);
    setInput("");
    setAnswerState("idle");
    setShowAnswer(false);
  };

  const handleRestart = () => {
    setIdx(0);
    setInput("");
    setAnswerState("idle");
    setResults([]);
    setFinished(false);
    setShowAnswer(false);
  };

  // Results screen
  if (finished) {
    const correct = results.filter(r => r.state === "correct").length;
    const close   = results.filter(r => r.state === "close").length;
    const wrong   = results.filter(r => r.state === "wrong").length;
    const pct = Math.round(((correct + close * 0.5) / results.length) * 100);

    return (
      <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-warning/10 text-warning rounded-[20px] flex items-center justify-center mx-auto border border-warning/20">
            <Trophy size={32} />
          </div>
          <h2 className="text-3xl font-extrabold text-accent tracking-tighter">Kết quả</h2>
          <p className="text-foreground/40 font-medium">{set.title}</p>
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Đúng", count: correct, color: "text-success", bg: "bg-success/10 border-success/20" },
            { label: "Gần đúng", count: close,   color: "text-warning", bg: "bg-warning/10 border-warning/20" },
            { label: "Sai",  count: wrong,   color: "text-error",   bg: "bg-error/10 border-error/20"   },
          ].map(s => (
            <div key={s.label} className={cn("p-4 rounded-2xl border text-center", s.bg)}>
              <p className={cn("text-2xl font-extrabold", s.color)}>{s.count}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="space-y-3">
          {results.map((r, i) => (
            <div key={i} className={cn(
              "p-4 rounded-2xl border",
              r.state === "correct" ? "border-success/20 bg-success/5"
              : r.state === "close" ? "border-warning/20 bg-warning/5"
              : "border-error/20 bg-error/5"
            )}>
              <p className="font-bold text-accent text-sm mb-1">{r.front}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-foreground/40">Bạn gõ:</span>
                <span className={cn("font-bold",
                  r.state === "correct" ? "text-success"
                  : r.state === "close" ? "text-warning"
                  : "text-error"
                )}>{r.userAnswer || "(bỏ qua)"}</span>
              </div>
              {r.state !== "correct" && (
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className="text-foreground/40">Đáp án:</span>
                  <span className="font-bold text-success">{r.back}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleRestart} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl border border-border-notion text-accent font-bold text-sm hover:bg-active-notion transition-all">
            <RotateCcw size={16} /> Làm lại
          </button>
          <button onClick={onExit} className="flex-1 py-3 rounded-2xl bg-accent text-background font-bold text-sm hover:opacity-90 transition-all">
            Thoát
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 px-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pencil size={16} className="text-foreground/30" />
          <span className="text-sm font-bold text-foreground/40">{idx + 1} / {cards.length}</span>
        </div>
        <button onClick={onExit} className="p-2 text-foreground/30 hover:text-error hover:bg-error/5 rounded-xl transition-all">
          <X size={18} />
        </button>
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-active-notion rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          animate={{ width: `${(idx / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question */}
      <div className="p-6 glass rounded-2xl border border-border-notion">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-3">Câu hỏi</p>
        <p className="text-xl font-extrabold text-accent leading-snug">{card.front}</p>
      </div>

      {/* Input */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Câu trả lời của bạn</p>
        <input
          ref={inputRef}
          value={input}
          onChange={e => { if (answerState === "idle") setInput(e.target.value); }}
          onKeyDown={e => {
            if (e.key === "Enter") answerState === "idle" ? handleSubmit() : handleNext();
          }}
          placeholder="Gõ câu trả lời..."
          disabled={answerState !== "idle"}
          className={cn(
            "w-full px-5 py-4 rounded-2xl border-2 text-base font-bold outline-none transition-all",
            answerState === "idle"    && "border-border-notion bg-active-notion/40 text-accent placeholder:text-foreground/20 focus:border-accent/40",
            answerState === "correct" && "border-success bg-success/10 text-success",
            answerState === "close"   && "border-warning bg-warning/10 text-warning",
            answerState === "wrong"   && "border-error bg-error/10 text-error",
          )}
        />

        {/* Feedback */}
        <AnimatePresence>
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-4 rounded-2xl border flex items-start gap-3",
                answerState === "correct" && "border-success/30 bg-success/5",
                answerState === "close"   && "border-warning/30 bg-warning/5",
                answerState === "wrong"   && "border-error/30 bg-error/5",
              )}
            >
              {answerState === "correct" && <CheckCircle2 size={18} className="text-success flex-shrink-0 mt-0.5" />}
              {answerState === "close"   && <CheckCircle2 size={18} className="text-warning flex-shrink-0 mt-0.5" />}
              {answerState === "wrong"   && <XCircle      size={18} className="text-error flex-shrink-0 mt-0.5" />}
              <div>
                <p className={cn("font-bold text-sm",
                  answerState === "correct" ? "text-success"
                  : answerState === "close" ? "text-warning"
                  : "text-error"
                )}>
                  {answerState === "correct" ? "Chính xác!" : answerState === "close" ? "Gần đúng!" : "Chưa đúng"}
                </p>
                {answerState !== "correct" && (
                  <p className="text-sm text-foreground/50 mt-1">
                    Đáp án: <span className="font-bold text-accent">{card.back}</span>
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        {answerState === "idle" ? (
          <>
            <button
              onClick={handleSkip}
              className="px-5 py-3 rounded-2xl border border-border-notion text-foreground/40 font-bold text-sm hover:text-accent hover:border-accent/30 transition-all"
            >
              Bỏ qua
            </button>
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="flex-1 py-3 rounded-2xl bg-accent text-background font-bold text-sm hover:opacity-90 disabled:opacity-30 transition-all"
            >
              Kiểm tra
            </button>
          </>
        ) : (
          <button
            onClick={handleNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-accent text-background font-bold text-sm hover:opacity-90 transition-all"
          >
            {isLast ? "Xem kết quả" : "Câu tiếp theo"} <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
