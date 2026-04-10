import { collection, addDoc, query, where, onSnapshot, Timestamp, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface PomodoroSession {
  id?: string;
  userId: string;
  mode: "focus" | "short" | "long";
  duration: number; // seconds
  completedAt: Timestamp;
}

const COLLECTION = "pomodoro_sessions";

export const pomodoroService = {
  async saveSession(userId: string, mode: "focus" | "short" | "long", duration: number) {
    await addDoc(collection(db, COLLECTION), {
      userId,
      mode,
      duration,
      completedAt: Timestamp.now(),
    });
  },

  subscribeToTodaySessions(userId: string, callback: (sessions: PomodoroSession[]) => void) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const q = query(
      collection(db, COLLECTION),
      where("userId", "==", userId),
      where("completedAt", ">=", Timestamp.fromDate(startOfDay)),
      orderBy("completedAt", "desc"),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as PomodoroSession[]);
    });
  },
};
