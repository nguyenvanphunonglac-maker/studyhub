"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { subscribeToSession, subscribeToParticipants } from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";
import WaitingRoomHost from "./WaitingRoomHost";
import HostDashboard from "./HostDashboard";
import LeaderboardView from "./LeaderboardView";

interface HostSessionViewProps {
  sessionId: string;
  hostId: string;
}

export default function HostSessionView({ sessionId, hostId }: HostSessionViewProps) {
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

  if (!session) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-foreground/40" />
      </div>
    );
  }

  if (session.status === "waiting") {
    return <WaitingRoomHost session={session} hostId={hostId} />;
  }

  if (session.status === "active") {
    return <HostDashboard session={session} hostId={hostId} />;
  }

  // finished
  return <LeaderboardView participants={participants} currentUserId={hostId} />;
}
