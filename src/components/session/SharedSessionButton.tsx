"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createSession } from "@/services/sessionService";
import { QuizSet } from "@/services/quizService";

interface SharedSessionButtonProps {
  quizSet: QuizSet;
}

export default function SharedSessionButton({ quizSet }: SharedSessionButtonProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTimeLimitInput, setShowTimeLimitInput] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<string>("");
  const [shuffleEnabled, setShuffleEnabled] = useState(true);

  const handleCreate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    if (!showTimeLimitInput) {
      setShowTimeLimitInput(true);
      return;
    }

    setLoading(true);
    try {
      const limit = timeLimitMinutes ? parseInt(timeLimitMinutes, 10) : undefined;
      const questionsToUse = shuffleEnabled
        ? [...quizSet.questions].sort(() => Math.random() - 0.5)
        : quizSet.questions;
      const shuffledSet = { ...quizSet, questions: questionsToUse };
      const sessionId = await createSession(user.uid, shuffledSet, limit);
      router.push(`/session/${sessionId}`);
    } catch (err) {
      console.error("Lỗi tạo phòng thi:", err);
      setLoading(false);
    }
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTimeLimitInput(false);
    setTimeLimitMinutes("");
  };

  if (showTimeLimitInput) {
    return (
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setShuffleEnabled(s => !s); }}
          className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            shuffleEnabled
              ? "bg-accent/10 text-accent border-accent/20"
              : "bg-active-notion/40 text-foreground/40 border-border-notion"
          }`}
          title="Xáo trộn câu hỏi"
        >
          🔀
        </button>
        <input
          type="number"
          min={5}
          max={180}
          value={timeLimitMinutes}
          onChange={(e) => setTimeLimitMinutes(e.target.value)}
          placeholder="Phút (5-180)"
          className="w-24 px-2 py-1.5 bg-active-notion/40 border border-border-notion rounded-lg text-xs font-bold text-accent outline-none focus:ring-1 focus:ring-accent/20"
          autoFocus
        />
        <button
          onClick={handleCreate}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning rounded-lg border border-warning/20 text-xs font-bold hover:bg-warning hover:text-background transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 size={12} className="animate-spin" /> : <Users size={12} />}
          Tạo
        </button>
        <button
          onClick={handleCancel}
          className="px-3 py-1.5 text-foreground/40 hover:text-accent text-xs font-bold transition-all"
        >
          Hủy
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleCreate}
      disabled={loading || quizSet.questions.length === 0}
      className="p-3 bg-warning/10 text-warning rounded-xl border border-warning/20 hover:bg-warning hover:text-background transition-all disabled:opacity-30"
      title="Tạo phòng thi chung"
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Users size={16} />}
    </button>
  );
}
