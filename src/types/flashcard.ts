import { Timestamp } from "firebase/firestore";

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Timestamp;
  userId: string;
  tags: string[];
  subject: string;
}

export interface FlashcardSet {
  id?: string;
  title: string;
  description: string;
  cards: Flashcard[];
  userId: string;
  authorName?: string;
  isPublic?: boolean;
  subject: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
