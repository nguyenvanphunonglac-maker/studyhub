import { Timestamp } from "firebase/firestore";

export type GoalType = "quiz_score" | "quiz_count" | "study_days" | "flashcard_count" | "custom";
export type GoalPeriod = "daily" | "weekly" | "monthly" | "custom";
export type GoalStatus = "active" | "completed" | "failed";

export interface Goal {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  period: GoalPeriod;
  target: number;
  current: number;
  unit: string;
  status: GoalStatus;
  startDate: Timestamp;
  endDate: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
