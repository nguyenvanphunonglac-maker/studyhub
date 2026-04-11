import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, Timestamp, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type GoalType = 'quiz_score' | 'quiz_count' | 'study_days' | 'flashcard_count' | 'custom';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';
export type GoalStatus = 'active' | 'completed' | 'failed';

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  period: GoalPeriod;
  target: number;        // e.g. 80 (for 80%), 10 (for 10 quizzes)
  current: number;       // current progress
  unit: string;          // e.g. "%", "bài", "ngày"
  status: GoalStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const COL = (userId: string) => `users/${userId}/goals`;

export const goalService = {
  async createGoal(userId: string, data: Omit<Goal, 'id' | 'userId' | 'current' | 'status' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL(userId)), {
      ...data,
      userId,
      current: 0,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return ref.id;
  },

  async updateProgress(userId: string, goalId: string, current: number) {
    const ref = doc(db, COL(userId), goalId);
    const goal = await (await import('firebase/firestore')).getDoc(ref);
    const data = goal.data() as Goal;
    const status: GoalStatus = current >= data.target ? 'completed' : 'active';
    await updateDoc(ref, { current, status, updatedAt: Timestamp.now() });
  },

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>) {
    await updateDoc(doc(db, COL(userId), goalId), { ...updates, updatedAt: Timestamp.now() });
  },

  async deleteGoal(userId: string, goalId: string) {
    await deleteDoc(doc(db, COL(userId), goalId));
  },

  subscribeToGoals(userId: string, callback: (goals: Goal[]) => void) {
    const q = query(collection(db, COL(userId)), orderBy("createdAt", "desc"));
    return onSnapshot(q, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Goal[]);
    });
  },
};
