"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { Moon, Sun, Languages, Palette } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = [
  { id: 'light', name: 'Notion', color: 'bg-white border-slate-200' },
  { id: 'dark', name: 'Dark', color: 'bg-[#1C2128] border-slate-700' },
  { id: 'midnight', name: 'Midnight', color: 'bg-[#1e293b] border-blue-900' },
  { id: 'forest', name: 'Forest', color: 'bg-[#064e3b] border-emerald-900' },
  { id: 'sunset', name: 'Sunset', color: 'bg-[#450a0a] border-rose-900' },
];

export default function SettingsToggle() {
  const { theme: activeTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col gap-4 p-5 bg-active-notion rounded-[32px] mx-3 mb-2 border border-border-notion shadow-sm">
      {/* Theme Selector */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Palette size={12} className="text-foreground/30" />
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[2px]">{t('themes')}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center relative overflow-hidden active:scale-90",
                theme.color,
                activeTheme === theme.id ? "scale-110 shadow-lg ring-2 ring-accent/20 border-accent" : "hover:scale-105 border-transparent"
              )}
              title={theme.name}
            >
              {activeTheme === theme.id && (
                <div className="w-2 h-2 bg-white rounded-full shadow-md animate-in zoom-in duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-border-notion opacity-50" />

      {/* Language Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Languages size={12} className="text-foreground/30" />
          <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[2px]">{t('language')}</span>
        </div>
        <button 
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="px-3 py-1.5 bg-card dark:bg-accent/10 rounded-xl border border-border-notion hover:border-accent/40 transition-all font-black text-[10px] uppercase text-accent tracking-widest active:scale-95 shadow-sm"
        >
          {language === 'vi' ? 'English' : 'Tiếng Việt'}
        </button>
      </div>
    </div>
  );
}
