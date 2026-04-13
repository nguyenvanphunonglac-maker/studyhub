import { Timestamp } from "firebase/firestore";

export interface MediaItem {
  id: string;
  type: "image" | "video";
  url: string;
  name: string;
  size: number;
  uploadedAt: Timestamp;
}

export interface MediaReference {
  mediaId: string;
  position: number;
}

export interface Note {
  id?: string;
  title: string;
  content: string;
  userId: string;
  tags: string[];
  subject: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  thumbnail?: string;
  media?: MediaItem[];
  mediaReferences?: MediaReference[];
}
