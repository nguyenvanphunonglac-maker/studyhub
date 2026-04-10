import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanObject } from "@/lib/utils";

export interface Question {
  id?: string;
  text: string;
  options: string[];
  correctAnswer: number; // Index
  tags: string[];
  subject: string;
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

const QUESTIONS_PATH = (userId: string) => `users/${userId}/questions`;
const RESULTS_PATH = (userId: string) => `users/${userId}/results`;
const QUIZSETS_PATH = (userId: string) => `users/${userId}/quizSets`;

export const quizService = {
  // Add a question
  async addQuestion(userId: string, question: Omit<Question, 'id'>) {
    const docRef = await addDoc(collection(db, QUESTIONS_PATH(userId)), {
      ...question,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Bulk add questions (for Excel/CSV)
  async addQuestions(userId: string, questions: Omit<Question, 'id'>[]) {
    // In a real app, use a WriteBatch for performance
    const promises = questions.map(q => this.addQuestion(userId, q));
    await Promise.all(promises);
  },

  // Delete a question
  async deleteQuestion(userId: string, id: string) {
    await deleteDoc(doc(db, QUESTIONS_PATH(userId), id));
  },

  // Subscribe to all questions
  subscribeToQuestions(userId: string, callback: (questions: Question[]) => void) {
    const q = query(collection(db, QUESTIONS_PATH(userId)), orderBy("createdAt", "desc"), limit(200));
    return onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Question[];
      callback(questions);
    });
  },

  // Save quiz result
  async saveResult(userId: string, score: number, total: number, tags?: string[], answers?: QuizAnswer[]) {
    await addDoc(collection(db, RESULTS_PATH(userId)), {
      score,
      total,
      tags: tags || [],
      answers: answers || [],
      date: Timestamp.now(),
    });
  },

  // Subscribe to results
  subscribeToResults(userId: string, callback: (results: QuizResult[]) => void) {
    const q = query(collection(db, RESULTS_PATH(userId)), orderBy("date", "desc"), limit(50));
    return onSnapshot(q, (snapshot) => {
      const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuizResult[];
      callback(results);
    });
  },

  // Quiz Sets
  async createQuizSet(userId: string, title: string, description: string, questions: Question[], subject: string, authorName: string = "Anonymous") {
    const docRef = await addDoc(collection(db, QUIZSETS_PATH(userId)), {
      title,
      description,
      questions,
      userId,
      authorName,
      isPublic: false,
      subject,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async toggleQuizSetPublic(userId: string, setId: string, isPublic: boolean) {
    const docRef = doc(db, QUIZSETS_PATH(userId), setId);
    await updateDoc(docRef, {
      isPublic,
      updatedAt: Timestamp.now(),
    });
  },

  async updateQuizSet(userId: string, setId: string, updates: Partial<Omit<QuizSet, 'id' | 'userId' | 'createdAt'>>) {
    const docRef = doc(db, QUIZSETS_PATH(userId), setId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  async deleteQuizSet(userId: string, setId: string) {
    await deleteDoc(doc(db, QUIZSETS_PATH(userId), setId));
  },

  subscribeToQuizSets(userId: string, callback: (sets: QuizSet[]) => void) {
    const q = query(collection(db, QUIZSETS_PATH(userId)));
    return onSnapshot(q, (snapshot) => {
      const sets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuizSet[];
      sets.sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis());
      callback(sets);
    });
  },

  async updateQuestionsInSet(userId: string, setId: string, questions: Question[]) {
    const docRef = doc(db, QUIZSETS_PATH(userId), setId);
    const cleanedQuestions = questions.map(q => cleanObject(q));
    await updateDoc(docRef, {
      questions: cleanedQuestions,
      updatedAt: Timestamp.now()
    });
  },

  async cloneQuizSet(userId: string, originalSet: QuizSet, authorName: string) {
    const { questions, title, description } = originalSet;
    return await this.createQuizSet(userId, `${title} (Clone)`, description, questions, authorName);
  },

  async fetchPublicQuizSets() {
    const { collectionGroup, getDocs, query, where } = await import("firebase/firestore");
    const q = query(collectionGroup(db, "quizSets"), where("isPublic", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as QuizSet[];
  }
};
