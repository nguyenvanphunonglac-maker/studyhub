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
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { cleanObject } from "@/lib/utils";

export interface Flashcard {
  id?: string;
  front: string;
  back: string;
  easeFactor: number; // Default 2.5
  interval: number; // Days, Default 0
  repetitions: number; // Default 0
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

const SETS_PATH = (userId: string) => `users/${userId}/flashcardSets`;

export const flashcardService = {
  // Create a flashcard set
  async createSet(userId: string, title: string, description: string, subject: string, authorName: string = "Anonymous"): Promise<string> {
    const docRef = await addDoc(collection(db, SETS_PATH(userId)), {
      title,
      description,
      cards: [],
      userId,
      authorName,
      isPublic: false,
      subject,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async createSetFromAI(userId: string, title: string, cardsFromAI: {front: string, back: string}[], authorName: string = "AI Assistant"): Promise<string> {
    const cards = cardsFromAI.map(card => ({
      front: card.front,
      back: card.back,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Timestamp.now(),
      userId,
      tags: ["AI Generated"],
      subject: "AI"
    }));

    const docRef = await addDoc(collection(db, SETS_PATH(userId)), {
      title,
      description: "Được tạo tự động bởi AI từ tài liệu của bạn.",
      cards,
      userId,
      authorName,
      isPublic: false,
      subject: "AI",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  async togglePublicSet(userId: string, setId: string, isPublic: boolean) {
    const setRef = doc(db, SETS_PATH(userId), setId);
    await updateDoc(setRef, {
      isPublic,
      updatedAt: Timestamp.now(),
    });
  },

  // Update set details (title/desc)
  async updateSet(userId: string, setId: string, updates: Partial<Omit<FlashcardSet, 'id' | 'userId' | 'createdAt'>>) {
    const setRef = doc(db, SETS_PATH(userId), setId);
    await updateDoc(setRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete a set
  async deleteSet(userId: string, setId: string) {
    await deleteDoc(doc(db, SETS_PATH(userId), setId));
  },

  // Subscribe to all sets
  subscribeToSets(userId: string, callback: (sets: FlashcardSet[]) => void) {
    const q = query(collection(db, SETS_PATH(userId)), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const sets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FlashcardSet[];
      callback(sets);
    });
  },

  // Manage cards WITHIN a set
  async updateCardsInSet(userId: string, setId: string, cards: Flashcard[]) {
    const setRef = doc(db, SETS_PATH(userId), setId);
    const cleanedCards = cards.map(card => cleanObject(card));
    await updateDoc(setRef, {
      cards: cleanedCards,
      updatedAt: Timestamp.now(),
    });
  },

  async cloneSet(userId: string, originalSet: FlashcardSet, authorName: string) {
    const { cards, title, description } = originalSet;
    const docRef = await addDoc(collection(db, SETS_PATH(userId)), {
      title: `${title} (Clone)`,
      description,
      cards,
      userId,
      authorName,
      isPublic: false,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async fetchPublicSets() {
    const { collectionGroup, getDocs, query, where } = await import("firebase/firestore");
    const q = query(collectionGroup(db, "flashcardSets"), where("isPublic", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FlashcardSet[];
  },

  // Helper for SRS Review Logic (SM-2)
  calculateNextReview(card: Flashcard, quality: number): Partial<Flashcard> {
    const { repetitions, easeFactor, interval } = card;
    let nextRepetitions = 0;
    let nextEaseFactor = easeFactor;
    let nextInterval = 0;

    if (quality >= 3) {
      if (repetitions === 0) {
        nextInterval = 1;
      } else if (repetitions === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(interval * easeFactor);
      }
      nextRepetitions = repetitions + 1;
    } else {
      nextRepetitions = 0;
      nextInterval = 1;
    }

    nextEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (nextEaseFactor < 1.3) nextEaseFactor = 1.3;

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    return {
      repetitions: nextRepetitions,
      easeFactor: nextEaseFactor,
      interval: nextInterval,
      nextReview: Timestamp.fromDate(nextReviewDate)
    };
  }
};
