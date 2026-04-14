"use client";

import { use, useEffect, useState, useRef } from "react";
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
  // Với static export, params luôn là "_" trên hosting
  // Phải đọc sessionId thực từ URL
  const { sessionId: paramSessionId } = use(params);
  const [sessionId, setSessionId] = useState<string>(paramSessionId);

  useEffect(() => {
    // Parse sessionId thực từ pathname: /session/{sessionId}
    const parts = window.location.pathname.split("/");
    const idx = parts.indexOf("session");
    if (idx !== -1 && parts[idx + 1] && parts[idx + 1] !== "_") {
      setSessionId(parts[idx + 1]);
    }
  }, []);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<ParticipantRecord[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [participantsLoaded, setParticipantsLoaded] = useState(false);
  const notFoundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!sessionId || authLoading || !user) return;

    const unsubSession = subscribeToSession(sessionId, (s) => {
      if (s) {
        // Session tồn tại — cancel timer nếu đang chạy
        if (notFoundTimer.current) {
          clearTimeout(notFoundTimer.current);
          notFoundTimer.current = null;
        }
        setSession(s);
        setSessionLoading(false);
      } else {
        // Session chưa có — chờ 5s, nếu vẫn null thì dừng loading
        // (onSnapshot sẽ tự gọi lại khi document được tạo)
        notFoundTimer.current = setTimeout(() => {
          setSessionLoading(false);
        }, 5000);
      }
    });

    const unsubParticipants = subscribeToParticipants(sessionId, (records) => {
      setParticipants(records);
      setParticipantsLoaded(true);
    });

    return () => {
      unsubSession();
      unsubParticipants();
      if (notFoundTimer.current) clearTimeout(notFoundTimer.current);
    };
  }, [sessionId, authLoading, user?.uid]);

  // Redirect participant không có trong danh sách về /join
  useEffect(() => {
    if (!user || !session || sessionLoading || !participantsLoaded) return;
    if (user.uid === session.hostId) return;
    const isParticipant = participants.some((p) => p.userId === user.uid);
    if (!isParticipant) router.replace("/join");
  }, [user, session, participants, sessionLoading, participantsLoaded, router]);

  if (authLoading) return <SessionLoader />;
  if (!user) return <Login />;
  if (sessionLoading) return <SessionLoader />;

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

  if (!participantsLoaded) return <SessionLoader />;

  const isParticipant = participants.some((p) => p.userId === user.uid);
  if (!isParticipant) return <SessionLoader />;

  return (
    <ParticipantSessionView
      sessionId={sessionId}
      userId={user.uid}
      displayName={user.displayName ?? user.email ?? "Participant"}
    />
  );
}
