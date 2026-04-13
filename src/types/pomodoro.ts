import { Timestamp } from "firebase/firestore";

export interface PomodoroSession {
  id?: string;
  userId: string;
  mode: "focus" | "short" | "long";
  duration: number;
  completedAt: Timestamp;
}
