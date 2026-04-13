import { Timestamp } from "firebase/firestore";

export interface MindMapData {
  id?: string;
  title: string;
  userId: string;
  nodes: any[];
  edges: any[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
