"use client";

import { useEffect, useState } from "react";
import { Copy, Check, Loader2, Users } from "lucide-react";
import { subscribeToParticipants, startSession, SessionError } from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";

interface WaitingRoomHostProps {
  session: Session;
  hostId: string;
}

export default function WaitingRoomHost({ session, hostId }: WaitingRoomHostProps) {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToParticipants(session.sessionId, setParticipants);
    return unsubscribe;
  }, [session.sessionId]);

  async function handleCopy() {
    await navigator.clipboard.writeText(session.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleStart() {
    setError(null);
    setStarting(true);
    try {
      await startSession(session.sessionId, hostId);
    } catch (err) {
      if (err instanceof SessionError) {
        setError(err.message);
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
      setStarting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8">
      {/* Session code */}
      <div className="w-full text-center space-y-2">
        <p className="text-sm text-foreground/60 uppercase tracking-widest">Mã phòng thi</p>
        <div className="flex items-center justify-center gap-3">
          <span className="text-6xl font-mono font-bold tracking-widest text-primary">
            {session.sessionCode}
          </span>
          <button
            onClick={handleCopy}
            title="Sao chép mã phòng"
            className="p-2 rounded-lg border border-border hover:bg-foreground/5 transition-colors text-foreground/60 hover:text-foreground"
          >
            {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
          </button>
        </div>
        <p className="text-xs text-foreground/40">Chia sẻ mã này để participants tham gia</p>
      </div>

      {/* Participant list */}
      <div className="w-full space-y-3">
        <div className="flex items-center gap-2 text-foreground/70">
          <Users size={16} />
          <span className="text-sm font-medium">
            Participants ({participants.length})
          </span>
        </div>

        {participants.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-foreground/40">
            <Loader2 size={20} className="animate-spin" />
            <p className="text-sm">Đang chờ participants tham gia...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {participants.map((p) => (
              <li
                key={p.userId}
                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-foreground/5"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                <span className="text-sm font-medium text-foreground">{p.displayName}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      {/* Start button */}
      <button
        onClick={handleStart}
        disabled={starting || participants.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {starting && <Loader2 size={16} className="animate-spin" />}
        {starting ? "Đang bắt đầu..." : "Bắt đầu thi"}
      </button>
    </div>
  );
}
