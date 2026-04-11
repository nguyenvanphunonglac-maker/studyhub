import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp, 
  Timestamp,
  onSnapshot
} from "firebase/firestore";

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  lastLogin: Timestamp;
  streak: number;
  // Onboarding fields
  age?: number;
  grade?: string;
  subjects?: string[];
  onboardingCompleted?: boolean;
}

export const userService = {
  subscribeToProfile(uid: string, callback: (profile: UserProfile) => void) {
    const docRef = doc(db, "users", uid);
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        callback(doc.data() as UserProfile);
      }
    });
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  },

  async completeOnboarding(uid: string, data: { displayName: string; age: number; grade: string; subjects: string[] }) {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      displayName: data.displayName,
      age: data.age,
      grade: data.grade,
      subjects: data.subjects,
      onboardingCompleted: true,
    });
  },

  async updateStreak(uid: string, displayName: string | null, email: string | null, photoURL: string | null) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!userSnap.exists()) {
      // First time user
      const profile: UserProfile = {
        uid,
        displayName,
        email,
        photoURL,
        lastLogin: Timestamp.fromDate(now),
        streak: 1
      };
      await setDoc(userRef, profile);
      return 1;
    }

    const data = userSnap.data() as UserProfile;
    const lastLogin = data.lastLogin.toDate();
    const lastLoginDate = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

    const diffTime = today.getTime() - lastLoginDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let newStreak = data.streak;

    if (diffDays === 1) {
      // Logged in yesterday, increment streak
      newStreak += 1;
    } else if (diffDays > 1) {
      // Missed a day or more, reset streak
      newStreak = 1;
    }
    // If diffDays === 0 (already logged in today), keep the same streak

    await updateDoc(userRef, {
      lastLogin: Timestamp.fromDate(now),
      streak: newStreak,
      displayName,
      email,
      photoURL
    });

    return newStreak;
  }
};
