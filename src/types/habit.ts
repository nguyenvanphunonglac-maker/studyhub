import { Timestamp } from "firebase/firestore";

export interface Habit {
  id?: string;
  name: string;
  color: string;
  icon: string;
  userId: string;
  createdAt: Timestamp;
}

export interface HabitLog {
  id?: string;
  habitId: string;
  userId: string;
  date: string;
  completed: boolean;
  createdAt: Timestamp;
}
