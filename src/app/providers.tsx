"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";

const OnboardingModal = dynamic(() => import("@/components/auth/OnboardingModal"), { ssr: false });

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { needsOnboarding, user } = useAuth();
  return (
    <>
      {children}
      {user && needsOnboarding && <OnboardingModal />}
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  "use no memo";
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <AuthProvider>
          <OnboardingGate>
            {children}
          </OnboardingGate>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
