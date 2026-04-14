"use client";

import { useEffect, useState } from "react";
import { Loader2, Users } from "lucide-react";
import { subscribeToParticipants, subscribeToSession } from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";

interface WaitingRoomParticipantProps {
  session: Session;
  currentUserId: string;
  onSessionStart: () => void;
}

export default function WaitingRoomParticipant({
  session,
  currentUserId,
  onSessionStart,
}: WaitingRoomParticipantProps) {
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToParticipants(session.sessionId, setParticipants);
    return unsubscribe;
  }, [session.sessionId]);

  useEffect(() => {
    const unsubscribe = subscribeToSession(session.sessionId, (updatedSession) => {
      if (updatedSession?.status === "active") {
        onSessionStart();
      }
    });
    return unsubscribe;
  }, [session.sessionId, onSessionStart]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg mx-auto py-8">
      {/* Waiting message */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 size={32} className="animate-spin text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Đang chờ host bắt đầu...</h2>
        <p className="text-sm text-foreground/50">
          Phòng thi sẽ bắt đầu khi host nhấn &quot;Bắt đầu thi&quot;
        </p>
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
          <div className="flex flex-col items-center gap-2 py-6 text-foreground/40">
            <p className="text-sm">Chưa có ai tham gia...</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {participants.map((p) => {
              const isSelf = p.userId === currentUserId;
              return (
                <li
                  key={p.userId}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                    isSelf
                      ? "border-primary bg-primary/10"
                      : "border-border bg-foreground/5"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                  <span className={`text-sm font-medium ${isSelf ? "text-primary" : "text-foreground"}`}>
                    {p.displayName}
                  </span>
                  {isSelf && (
                    <span className="ml-auto text-xs text-primary/70 font-medium">Bạn</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
