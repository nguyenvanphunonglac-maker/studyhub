import { Timestamp } from "firebase/firestore";

export interface UserMediaItem {
  id?: string;
  userId: string;
  type: "image" | "video";
  url: string;
  name: string;
  size: number;
  uploadedAt: Timestamp;
}
