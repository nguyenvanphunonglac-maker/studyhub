"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { subscribeToSession, subscribeToParticipants } from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";
import WaitingRoomParticipant from "./WaitingRoomParticipant";
import QuizActiveSession from "./QuizActiveSession";
import LeaderboardView from "./LeaderboardView";

interface ParticipantSessionViewProps {
  sessionId: string;
  userId: string;
  displayName: string;
}

export default function ParticipantSessionView({
  sessionId,
  userId,
  displayName,
}: ParticipantSessionViewProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToSession(sessionId, setSession);
    return unsubscribe;
  }, [sessionId]);

  useEffect(() => {
    if (session?.status !== "finished") return;
    const unsubscribe = subscribeToParticipants(sessionId, setParticipants);
    return unsubscribe;
  }, [sessionId, session?.status]);

  // WaitingRoomParticipant needs this callback but the session subscription
  // already drives the status transition — no extra action needed here.
  const handleSessionStart = useCallback(() => {}, []);

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-foreground/40" />
      </div>
    );
  }

  if (session.status === "waiting") {
    return (
      <WaitingRoomParticipant
        session={session}
        currentUserId={userId}
        onSessionStart={handleSessionStart}
      />
    );
  }

  if (session.status === "active") {
    return (
      <QuizActiveSession
        session={session}
        userId={userId}
        displayName={displayName}
      />
    );
  }

  // finished
  return <LeaderboardView participants={participants} currentUserId={userId} />;
}
