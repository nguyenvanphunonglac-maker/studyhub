import { Timestamp } from "firebase/firestore";

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
