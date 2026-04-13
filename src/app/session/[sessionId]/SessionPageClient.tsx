"use client";

import { use, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { subscribeToSession, subscribeToParticipants } from "@/services/sessionService";
import { Session, ParticipantRecord } from "@/types/session";
import { Loader2 } from "lucide-react";
import Login from "@/components/auth/Login";
import HostSessionView from "@/components/session/HostSessionView";
import ParticipantSessionView from "@/components/session/ParticipantSessionView";

function SessionLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="animate-spin text-foreground/20" size={32} />
    </div>
  );
}

export default function SessionPageClient({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [hasRecord, setHasRecord] = useState<boolean | null>(null);

  useEffect(() => {
    if (!sessionId) return;
    const unsubSession = subscribeToSession(sessionId, (s) => {
      setSession(s);
      setSessionLoading(false);
    });
    const unsubParticipants = subscribeToParticipants(sessionId, (records) => {
      setParticipants(records);
    });
    return () => {
      unsubSession();
      unsubParticipants();
    };
  }, [sessionId]);

  useEffect(() => {
    if (!user || !session) return;
    if (user.uid === session.hostId) {
      setHasRecord(true);
      return;
    }
    const record = participants.find((p) => p.userId === user.uid);
    setHasRecord(!!record);
  }, [user, session, participants]);

  useEffect(() => {
    if (hasRecord === false) {
      router.replace("/join");
    }
  }, [hasRecord, router]);

  if (authLoading) return <SessionLoader />;
  if (!user) return <Login />;
  if (sessionLoading || hasRecord === null) return <SessionLoader />;
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-foreground/60">Phiên thi không tồn tại.</p>
      </div>
    );
  }

  const isHost = user.uid === session.hostId;

  if (isHost) {
    return <HostSessionView sessionId={sessionId} hostId={user.uid} />;
  }

  return (
    <ParticipantSessionView
      sessionId={sessionId}
      userId={user.uid}
      displayName={user.displayName ?? user.email ?? "Participant"}
    />
  );
}
