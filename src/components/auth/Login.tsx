"use client";

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { LogIn, BookOpen } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function Login() {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full p-8 text-center"
      >
        <div className="mb-8 flex justify-center">
          <div className="p-4 bg-card rounded-2xl shadow-sm border border-border-notion">
            <BookOpen size={48} className="text-accent" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold tracking-tight mb-4 text-accent">
          {t('login_title')}
        </h1>
        <p className="text-lg text-foreground/60 mb-10 font-bold">
          {t('login_subtitle')}
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-card hover:bg-active-notion text-accent font-black py-4 px-6 rounded-2xl border border-border-notion shadow-sm transition-all duration-200 uppercase text-xs tracking-widest active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          {t('login_with_google')}
        </button>
        
        <p className="mt-8 text-sm text-foreground/40 leading-relaxed font-bold">
          {t('login_footer')}
        </p>
      </motion.div>
    </div>
  );
}
