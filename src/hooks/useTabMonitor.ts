import { useEffect } from "react";
import { doc, updateDoc, increment, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface UseTabMonitorOptions {
  sessionId: string;
  userId: string;
  isActive: boolean;
}

export function useTabMonitor({ sessionId, userId, isActive }: UseTabMonitorOptions): void {
  useEffect(() => {
    if (!isActive) return;

    const participantRef = doc(db, "quiz_sessions", sessionId, "participants", userId);

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "hidden") {
        await updateDoc(participantRef, {
          tabLeftCount: increment(1),
          lastTabLeftAt: Timestamp.now(),
          isTabActive: false,
        });
      } else {
        await updateDoc(participantRef, {
          isTabActive: true,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessionId, userId, isActive]);
}
