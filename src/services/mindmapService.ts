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

export interface MindMapData {
  id?: string;
  title: string;
  userId: string;
  nodes: any[];
  edges: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const MINDMAPS_PATH = (userId: string) => `users/${userId}/mindmaps`;

export const mindmapService = {
  // Create a new mindmap
  async createMindMap(userId: string, title: string) {
    const docRef = await addDoc(collection(db, MINDMAPS_PATH(userId)), {
      title,
      userId,
      nodes: [
        { 
          id: '1', 
          type: 'input', 
          data: { label: title || 'Chủ đề chính' }, 
          position: { x: 250, y: 250 },
          style: { 
            background: '#2D2A26', 
            color: '#fff', 
            borderRadius: '20px', 
            padding: '20px',
            fontWeight: 'bold',
            border: 'none',
            fontSize: '16px'
          }
        }
      ],
      edges: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // Update mindmap content
  async updateMindMap(userId: string, id: string, data: Partial<MindMapData>) {
    const docRef = doc(db, MINDMAPS_PATH(userId), id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // Delete mindmap
  async deleteMindMap(userId: string, id: string) {
    await deleteDoc(doc(db, MINDMAPS_PATH(userId), id));
  },

  // Subscribe to mindmaps
  subscribeToMindMaps(userId: string, callback: (maps: MindMapData[]) => void) {
    const q = query(collection(db, MINDMAPS_PATH(userId)), orderBy("updatedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const maps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MindMapData[];
      callback(maps);
    });
  }
};
