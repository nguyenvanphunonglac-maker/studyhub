"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Users } from "lucide-react";
import {
  subscribeToParticipants,
  endSession,
  formatProgress,
  shouldShowWarning,
  SessionError,
} from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";

interface HostDashboardProps {
  session: Session;
  hostId: string;
}

type DisplayStatus = "joined" | "submitted" | "auto_submitted" | "tab_left";

function getDisplayStatus(p: ParticipantRecord): DisplayStatus {
  if (!p.isTabActive) return "tab_left";
  return p.status;
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  joined: "Đang làm",
  submitted: "Đã nộp",
  auto_submitted: "Tự động nộp",
  tab_left: "Rời tab",
};

const STATUS_CLASS: Record<DisplayStatus, string> = {
  joined: "bg-blue-500/15 text-blue-600 border border-blue-500/30",
  submitted: "bg-green-500/15 text-green-600 border border-green-500/30",
  auto_submitted: "bg-orange-500/15 text-orange-600 border border-orange-500/30",
  tab_left: "bg-red-500/15 text-red-600 border border-red-500/30",
};

export default function HostDashboard({ session, hostId }: HostDashboardProps) {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToParticipants(session.sessionId, setParticipants);
    return unsubscribe;
  }, [session.sessionId]);

  async function handleEndSession() {
    setError(null);
    setEnding(true);
    try {
      await endSession(session.sessionId, hostId);
    } catch (err) {
      if (err instanceof SessionError) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
      setEnding(false);
    }
  }

  const tabLeftCount = participants.filter((p) => !p.isTabActive).length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground/70">
          <Users size={18} />
          <span className="text-sm font-medium">
            Participants ({participants.length})
          </span>
        </div>

        {tabLeftCount > 0 && (
          <span className="flex items-center gap-1.5 text-xs font-medium text-orange-600 bg-orange-500/10 border border-orange-500/20 px-2.5 py-1 rounded-full">
            <AlertTriangle size={13} />
            {tabLeftCount} rời tab
          </span>
        )}
      </div>

      {/* Participant list */}
      {participants.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-foreground/40">
          <Loader2 size={20} className="animate-spin" />
          <p className="text-sm">Đang tải danh sách participants...</p>
        </div>
      ) : (
        <div className="space-y-2">
          {participants.map((p) => {
            const displayStatus = getDisplayStatus(p);
            const warning = shouldShowWarning(p);

            return (
              <div
                key={p.userId}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border bg-foreground/5 ${
                  warning ? "border-red-500/40" : "border-border"
                }`}
              >
                {/* Name */}
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {p.displayName}
                </span>

                {/* Progress */}
                <span className="text-xs font-mono text-foreground/50 tabular-nums shrink-0">
                  {formatProgress(p.currentQuestionIndex, p.totalQuestions)}
                </span>

                {/* Tab left count */}
                <span
                  className={`text-xs tabular-nums shrink-0 ${
                    warning ? "text-red-500 font-semibold" : "text-foreground/40"
                  }`}
                  title="Số lần rời tab"
                >
                  {p.tabLeftCount}x
                </span>

                {/* Warning indicator */}
                {warning && (
                  <AlertTriangle
                    size={15}
                    className="text-red-500 shrink-0"
                    title="Cảnh báo: rời tab quá nhiều lần"
                  />
                )}

                {/* Status badge */}
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_CLASS[displayStatus]}`}
                >
                  {STATUS_LABEL[displayStatus]}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* End session button */}
      <button
        onClick={handleEndSession}
        disabled={ending}
        className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {ending && <Loader2 size={16} className="animate-spin" />}
        {ending ? "Đang kết thúc..." : "Kết thúc phiên"}
      </button>
    </div>
  );
}
