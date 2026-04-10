import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface UserMediaItem {
  id?: string;
  userId: string;
  type: 'image' | 'video';
  url: string;
  name: string;
  size: number;
  uploadedAt: Timestamp;
}

const COL = "usermedia";

export const userMediaService = {
  async addMedia(userId: string, item: Omit<UserMediaItem, 'id' | 'userId' | 'uploadedAt'>): Promise<string> {
    const ref = await addDoc(collection(db, COL), {
      ...item,
      userId,
      uploadedAt: Timestamp.now(),
    });
    return ref.id;
  },

  async deleteMedia(id: string) {
    await deleteDoc(doc(db, COL, id));
  },

  subscribeToMedia(userId: string, callback: (items: UserMediaItem[]) => void) {
    const q = query(
      collection(db, COL),
      where("userId", "==", userId),
      orderBy("uploadedAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as UserMediaItem[]);
    });
  },
};
