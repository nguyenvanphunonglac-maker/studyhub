import { Timestamp } from "firebase/firestore";
import { Question } from "@/services/quizService";

export interface Session {
  sessionId: string;
  sessionCode: string;          // 6 ký tự uppercase alphanumeric
  hostId: string;
  hostName: string;
  quizSetId: string;
  questions: Question[];        // snapshot từ QuizSet tại thời điểm tạo
  status: 'waiting' | 'active' | 'finished';
  timeLimitMinutes?: number;    // optional, 5-180
  createdAt: Timestamp;
  expiresAt: Timestamp;         // createdAt + 24h
  startedAt?: Timestamp;
  endedAt?: Timestamp;
}

export interface SessionAnswer {
  questionIndex: number;
  selectedOption: number;       // index 0-3
  isCorrect: boolean;
}

export interface ParticipantRecord {
  userId: string;
  displayName: string;
  status: 'joined' | 'submitted' | 'auto_submitted';
  currentQuestionIndex: number; // 0-based, cập nhật realtime
  answers: SessionAnswer[];     // chỉ có sau khi submit
  score?: number;
  totalQuestions: number;
  submittedAt?: Timestamp;
  tabLeftCount: number;         // số lần rời tab
  lastTabLeftAt?: Timestamp;
  isTabActive: boolean;
  joinedAt: Timestamp;
}
