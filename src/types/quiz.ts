import { Timestamp } from "firebase/firestore";

export interface Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: number;
  tags: string[];
  subject: string;
  imageUrl?: string;
}

export interface QuizAnswer {
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizResult {
  id?: string;
  date: Timestamp;
  score: number;
  total: number;
  tags?: string[];
  answers?: QuizAnswer[];
}

export interface QuizSet {
  id?: string;
  title: string;
  description: string;
  questions: Question[];
  userId: string;
  authorName?: string;
  isPublic?: boolean;
  subject: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
