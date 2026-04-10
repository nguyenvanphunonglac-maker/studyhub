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
}

const COLLECTION_NAME = "notes";

export const noteService = {
  // Create a new note
  async createNote(userId: string, title: string = "Untitled", subject: string = ""): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      title,
      content: "",
      userId,
      tags: [],
      subject,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update a note
  async updateNote(id: string, updates: Partial<Note>) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, {
      ...cleanObject(updates),
      updatedAt: Timestamp.now(),
    });
  },

  // Delete a note
  async deleteNote(id: string) {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  // Subscribe to user's notes
  subscribeToNotes(userId: string, callback: (notes: Note[]) => void) {
    const q = query(
      collection(db, COLLECTION_NAME),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
      limit(100)
    );

    return onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[];
      callback(notes);
    });
  },
};
