import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  onSnapshot,
  Timestamp,
  orderBy,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  date: string; // Format: YYYY-MM-DD
  completed: boolean;
  createdAt: Timestamp;
}

const HABITS_PATH = (userId: string) => `users/${userId}/habits`;
const LOGS_PATH = (userId: string) => `users/${userId}/habitLogs`;

export const habitService = {
  // Habit Management
  async createHabit(userId: string, name: string, color: string, icon: string = "Target") {
    const docRef = await addDoc(collection(db, HABITS_PATH(userId)), {
      name,
      color,
      icon,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async deleteHabit(userId: string, habitId: string) {
    await deleteDoc(doc(db, HABITS_PATH(userId), habitId));
    // Optionally delete all logs related to this habit
    const logsQuery = query(collection(db, LOGS_PATH(userId)), where("habitId", "==", habitId));
    const logsSnapshot = await getDocs(logsQuery);
    // Note: Batch deletion could be added here
  },

  subscribeToHabits(userId: string, callback: (habits: Habit[]) => void) {
    const q = query(collection(db, HABITS_PATH(userId)), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snapshot) => {
      const habits = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[];
      callback(habits);
    });
  },

  // Completion Tracking
  async toggleHabit(userId: string, habitId: string, date: string, completed: boolean) {
    // Check if log exists for this date and habit
    const logsRef = collection(db, LOGS_PATH(userId));
    const q = query(logsRef, where("habitId", "==", habitId), where("date", "==", date));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      if (completed) {
        await addDoc(logsRef, {
          habitId,
          userId,
          date,
          completed: true,
          createdAt: Timestamp.now(),
        });
      }
    } else {
      const logId = snapshot.docs[0].id;
      if (!completed) {
        await deleteDoc(doc(db, LOGS_PATH(userId), logId));
      }
    }
  },

  subscribeToLogs(userId: string, callback: (logs: HabitLog[]) => void) {
    const q = query(collection(db, LOGS_PATH(userId)));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as HabitLog[];
      callback(logs);
    });
  }
};
