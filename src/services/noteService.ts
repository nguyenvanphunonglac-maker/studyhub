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
import type { Note, MediaItem } from "@/types/note";

export type { Note, MediaItem } from "@/types/note";
export type { MediaReference } from "@/types/note";

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

  // Add media to note
  async addMediaToNote(noteId: string, media: Omit<MediaItem, 'id' | 'uploadedAt'>) {
    const docRef = doc(db, COLLECTION_NAME, noteId);
    const newMedia: MediaItem = {
      ...media,
      id: `${Date.now()}-${Math.random()}`,
      uploadedAt: Timestamp.now(),
    };
    
    const note = await (await import('firebase/firestore')).getDoc(docRef);
    const existingMedia = (note.data()?.media || []) as MediaItem[];
    
    await updateDoc(docRef, {
      media: [...existingMedia, newMedia],
      updatedAt: Timestamp.now(),
    });
    
    return newMedia;
  },

  // Remove media from note
  async removeMediaFromNote(noteId: string, mediaId: string) {
    const docRef = doc(db, COLLECTION_NAME, noteId);
    const note = await (await import('firebase/firestore')).getDoc(docRef);
    const existingMedia = (note.data()?.media || []) as MediaItem[];
    
    await updateDoc(docRef, {
      media: existingMedia.filter(m => m.id !== mediaId),
      updatedAt: Timestamp.now(),
    });
  },
};
