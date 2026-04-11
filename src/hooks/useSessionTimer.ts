import { useState, useEffect, useRef } from "react";
import { Session } from "@/types/session";

interface UseSessionTimerResult {
  timeRemaining: number; // milliseconds
}

export function useSessionTimer(
  session: Session,
  onExpire: () => void
): UseSessionTimerResult {
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    if (!session.timeLimitMinutes || !session.startedAt) return Infinity;
    const deadline = session.startedAt.toMillis() + session.timeLimitMinutes * 60 * 1000;
    return Math.max(0, deadline - Date.now());
  });

  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!session.timeLimitMinutes || !session.startedAt) return;

    const deadline = session.startedAt.toMillis() + session.timeLimitMinutes * 60 * 1000;

    const tick = () => {
      const remaining = Math.max(0, deadline - Date.now());
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        onExpireRef.current();
      }
    };

    tick(); // run immediately
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [session.timeLimitMinutes, session.startedAt]);

  return { timeRemaining };
}
