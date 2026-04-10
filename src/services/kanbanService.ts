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
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface KanbanTask {
  id?: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const TASKS_PATH = (userId: string) => `users/${userId}/kanbanTasks`;

export const kanbanService = {
  // Create a new task
  async createTask(userId: string, task: Omit<KanbanTask, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    const docRef = await addDoc(collection(db, TASKS_PATH(userId)), {
      ...task,
      userId,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update task details or move status
  async updateTask(userId: string, taskId: string, updates: Partial<KanbanTask>) {
    const docRef = doc(db, TASKS_PATH(userId), taskId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete a task
  async deleteTask(userId: string, taskId: string) {
    await deleteDoc(doc(db, TASKS_PATH(userId), taskId));
  },

  // Subscribe to tasks
  subscribeToTasks(userId: string, callback: (tasks: KanbanTask[]) => void) {
    const q = query(collection(db, TASKS_PATH(userId)), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as KanbanTask[];
      callback(tasks);
    });
  }
};
