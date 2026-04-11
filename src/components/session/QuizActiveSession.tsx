"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Session, SessionAnswer } from "@/types/session";
import { updateProgress, submitAnswers } from "@/services/sessionService";
import { useTabMonitor } from "@/hooks/useTabMonitor";
import { useSessionTimer } from "@/hooks/useSessionTimer";
import { CheckCircle, WifiOff } from "lucide-react";

interface QuizActiveSessionProps {
  session: Session;
  userId: string;
  displayName: string;
}

function formatTime(ms: number): string {
  if (!isFinite(ms) || ms <= 0) return "00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const LS_KEY = (sessionId: string, userId: string) =>
  `quiz_session_answers_${sessionId}_${userId}`;

export default function QuizActiveSession({
  session,
  userId,
  displayName,
}: QuizActiveSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selections, setSelections] = useState<Record<number, number>>(() => {
    try {
      const saved = localStorage.getItem(LS_KEY(session.sessionId, userId));
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {};
  });
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);
  const [isOnline, setIsOnline] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const submittedRef = useRef(false);

  const questions = session.questions;
  const total = questions.length;

  // Persist selections to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(LS_KEY(session.sessionId, userId), JSON.stringify(selections));
    } catch {
      // ignore
    }
  }, [selections, session.sessionId, userId]);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      // Sync progress back to Firestore on reconnect
      try {
        await updateProgress(session.sessionId, userId, currentIndex);
      } catch {
        // best-effort
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [session.sessionId, userId, currentIndex]);

  // Build SessionAnswer array from current selections
  const buildAnswers = useCallback((): SessionAnswer[] => {
    return Object.entries(selections).map(([qIdx, selectedOption]) => {
      const questionIndex = Number(qIdx);
      return {
        questionIndex,
        selectedOption,
        isCorrect: questions[questionIndex]?.correctAnswer === selectedOption,
      };
    });
  }, [selections, questions]);

  // Submit handler
  const handleSubmit = useCallback(async () => {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    const answers = buildAnswers();
    try {
      await submitAnswers(session.sessionId, userId, answers);
      const correct = answers.filter((a) => a.isCorrect).length;
      setScore(correct);
      setSubmitted(true);
      localStorage.removeItem(LS_KEY(session.sessionId, userId));
    } catch {
      submittedRef.current = false;
      setSubmitting(false);
    }
  }, [buildAnswers, session.sessionId, userId, submitting]);

  // Auto-submit on timer expire
  const handleExpire = useCallback(async () => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    const answers = buildAnswers();
    try {
      await submitAnswers(session.sessionId, userId, answers);
      // Override status to auto_submitted
      await updateDoc(
        doc(db, "quiz_sessions", session.sessionId, "participants", userId),
        { status: "auto_submitted" }
      );
      const correct = answers.filter((a) => a.isCorrect).length;
      setScore(correct);
      setSubmitted(true);
      localStorage.removeItem(LS_KEY(session.sessionId, userId));
    } catch {
      // best-effort
    }
  }, [buildAnswers, session.sessionId, userId]);

  useTabMonitor({ sessionId: session.sessionId, userId, isActive: !submitted });
  const { timeRemaining } = useSessionTimer(session, handleExpire);

  // Navigate to next question and update progress
  async function goToNext() {
    const next = currentIndex + 1;
    setCurrentIndex(next);
    try {
      await updateProgress(session.sessionId, userId, next);
    } catch {
      // best-effort
    }
  }

  function goToPrev() {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }

  function selectOption(optionIndex: number) {
    setSelections((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted) {
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto py-12 text-center">
        <CheckCircle size={56} className="text-green-500" />
        <h2 className="text-2xl font-bold text-foreground">Đã nộp bài!</h2>
        <div className="w-full px-8 py-6 rounded-xl border border-border bg-foreground/5 space-y-2">
          <p className="text-4xl font-bold text-primary">{score} / {total}</p>
          <p className="text-lg text-foreground/70">{percentage}% chính xác</p>
          <p className="text-sm text-foreground/50 mt-1">
            Xin chào {displayName}, kết quả của bạn đã được ghi nhận.
          </p>
        </div>
      </div>
    );
  }

  const question = questions[currentIndex];
  const selectedOption = selections[currentIndex];
  const isLast = currentIndex === total - 1;
  const showTimer = session.timeLimitMinutes != null && isFinite(timeRemaining);
  const timerRed = showTimer && timeRemaining < 60_000;

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-6">
      {/* Offline banner */}
      {!isOnline && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-sm font-medium">
          <WifiOff size={16} />
          Đang kết nối lại...
        </div>
      )}

      {/* Header: timer + counter */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-foreground/60">
          Câu {currentIndex + 1} / {total}
        </span>
        {showTimer && (
          <span
            className={`text-sm font-mono font-semibold tabular-nums ${
              timerRed ? "text-red-500" : "text-foreground/70"
            }`}
          >
            {formatTime(timeRemaining)}
          </span>
        )}
      </div>

      {/* Question */}
      <div className="px-5 py-4 rounded-xl border border-border bg-foreground/5">
        <p className="text-base font-medium text-foreground leading-relaxed">
          {question.text}
        </p>
      </div>

      {/* Options */}
      <ul className="space-y-2">
        {question.options.map((option, idx) => {
          const isSelected = selectedOption === idx;
          return (
            <li key={idx}>
              <button
                onClick={() => selectOption(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-colors text-sm font-medium ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-foreground/5 text-foreground hover:bg-foreground/10"
                }`}
              >
                <span className="mr-2 font-semibold">
                  {String.fromCharCode(65 + idx)}.
                </span>
                {option}
              </button>
            </li>
          );
        })}
      </ul>

      {/* Navigation */}
      <div className="flex items-center gap-3 mt-2">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground/70 hover:bg-foreground/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Câu trước
        </button>

        {!isLast ? (
          <button
            onClick={goToNext}
            className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Câu tiếp theo
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {submitting ? "Đang nộp..." : "Nộp bài"}
          </button>
        )}
      </div>

      {/* Always-accessible submit button (not on last question) */}
      {!isLast && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-2.5 rounded-xl border border-green-600 text-green-600 text-sm font-semibold hover:bg-green-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? "Đang nộp..." : "Nộp bài"}
        </button>
      )}
    </div>
  );
}
