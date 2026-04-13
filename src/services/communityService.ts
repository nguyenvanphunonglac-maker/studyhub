import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  arrayUnion, 
  arrayRemove,
  increment,
  limit,
  startAfter,
  getDocs,
  DocumentSnapshot,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { CommunityPost, CommunityComment } from "@/types/community";

export type { CommunityPost, CommunityComment } from "@/types/community";

export const communityService = {
  createPost: async (userId: string, userName: string, content: string, images: string[]) => {
    return await addDoc(collection(db, "community_posts"), {
      userId,
      userName,
      content,
      images,
      createdAt: serverTimestamp(),
      likes: 0,
      commentCount: 0,
      likedBy: []
    });
  },

  PAGE_SIZE: 20,

  subscribeToPosts: (callback: (posts: CommunityPost[], lastDoc: DocumentSnapshot | null) => void) => {
    const q = query(collection(db, "community_posts"), orderBy("createdAt", "desc"), limit(20));
    return onSnapshot(q, (snapshot) => {
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityPost[];
      const lastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
      callback(posts, lastDoc);
    });
  },

  loadMorePosts: async (lastDoc: DocumentSnapshot): Promise<{ posts: CommunityPost[], lastDoc: DocumentSnapshot | null }> => {
    const q = query(
      collection(db, "community_posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastDoc),
      limit(20)
    );
    const snapshot = await getDocs(q);
    const posts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as CommunityPost[];
    const newLastDoc = snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null;
    return { posts, lastDoc: newLastDoc };
  },

  addComment: async (postId: string, userId: string, userName: string, content: string) => {
    await addDoc(collection(db, "community_posts", postId, "comments"), {
      userId,
      userName,
      content,
      createdAt: serverTimestamp()
    });
    
    // Increment comment count on post
    await updateDoc(doc(db, "community_posts", postId), {
      commentCount: increment(1)
    });
  },

  subscribeToComments: (postId: string, callback: (comments: CommunityComment[]) => void) => {
    const q = query(
      collection(db, "community_posts", postId, "comments"), 
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as CommunityComment[];
      callback(comments);
    });
  },

  toggleLike: async (postId: string, userId: string, isLiked: boolean) => {
    const postRef = doc(db, "community_posts", postId);
    await updateDoc(postRef, {
      likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
      likes: increment(isLiked ? -1 : 1)
    });
  }
};
