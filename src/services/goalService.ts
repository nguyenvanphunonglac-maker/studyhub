import {
  collection, addDoc, updateDoc, deleteDoc,
  doc, query, where, onSnapshot, Timestamp, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Goal, GoalType, GoalPeriod, GoalStatus } from "@/types/goal";

export type { Goal, GoalType, GoalPeriod, GoalStatus } from "@/types/goal";

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
