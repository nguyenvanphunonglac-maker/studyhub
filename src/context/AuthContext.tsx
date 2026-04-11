"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userService } from "@/services/userService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  streak: number;
  needsOnboarding: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  finishOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!user) {
          const newStreak = await userService.updateStreak(
            firebaseUser.uid,
            firebaseUser.displayName,
            firebaseUser.email,
            firebaseUser.photoURL
          );
          setStreak(newStreak);

          // Check if onboarding is needed
          const profile = await userService.getUserProfile(firebaseUser.uid);
          if (!profile?.onboardingCompleted) {
            setNeedsOnboarding(true);
          }
        } else {
          const profile = await userService.getUserProfile(firebaseUser.uid);
          if (profile) setStreak(profile.streak);
        }
      } else {
        setStreak(0);
        setNeedsOnboarding(false);
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error logging in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error logging out", error);
      throw error;
    }
  };

  const finishOnboarding = () => setNeedsOnboarding(false);

  return (
    <AuthContext.Provider value={{ user, loading, streak, needsOnboarding, loginWithGoogle, logout, finishOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
