import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastLogin: Timestamp;
  streak: number;
  age?: number;
  grade?: string;
  subjects?: string[];
  onboardingCompleted?: boolean;
}
