"use client";

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  "use no memo";
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem={false}>
      <LanguageProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
