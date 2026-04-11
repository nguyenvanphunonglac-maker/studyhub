"use client";

import { useTheme } from "next-themes";
import { useLanguage } from "@/context/LanguageContext";
import { subjects } from "@/context/LanguageContext";
import { Moon, Sun, Languages, Palette, User, ChevronDown, ChevronUp, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuth } from "@/context/AuthContext";
import { userService, UserProfile } from "@/services/userService";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const THEMES = [
  { id: 'light',    name: 'Notion',   bg: '#FBFAF9', border: '#e2e8f0', accent: '#2D2A26' },
  { id: 'dark',     name: 'Dark',     bg: '#1F1F1F', border: '#3f3f46', accent: '#D4D4D4' },
  { id: 'midnight', name: 'Midnight', bg: '#1C2128', border: '#79B8FF', accent: '#79B8FF' },
  { id: 'aurora',   name: 'Aurora',   bg: '#1D1B2A', border: '#9D7FEA', accent: '#9D7FEA' },
  { id: 'amber',    name: 'Amber',    bg: '#211E14', border: '#D4A017', accent: '#D4A017' },
  { id: 'rose',     name: 'Rose',     bg: '#211820', border: '#D4789A', accent: '#D4789A' },
];

const GRADES = [
  "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9",
  "Lớp 10", "Lớp 11", "Lớp 12",
  "Đại học", "Sau đại học", "Khác",
];

export default function SettingsToggle() {
  const { theme: activeTheme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => setMounted(true), []);

  // Load profile when opening
  useEffect(() => {
    if (!profileOpen || !user) return;
    userService.getUserProfile(user.uid).then((profile) => {
      if (!profile) return;
      setDisplayName(profile.displayName ?? "");
      setAge(profile.age ? String(profile.age) : "");
      setGrade(profile.grade ?? "");
      setSelectedSubjects(profile.subjects ?? []);
    });
  }, [profileOpen, user]);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    await userService.completeOnboarding(user.uid, {
      displayName: displayName.trim() || user.displayName || "Học sinh",
      age: parseInt(age) || 0,
      grade,
      subjects: selectedSubjects,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
              style={{
                backgroundColor: theme.bg,
                borderColor: activeTheme === theme.id ? theme.accent : theme.border,
                boxShadow: activeTheme === theme.id ? `0 0 0 2px ${theme.accent}40` : 'none',
              }}
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all flex items-center justify-center relative overflow-hidden active:scale-90",
                activeTheme === theme.id ? "scale-110" : "hover:scale-105"
              )}
              title={theme.name}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: theme.accent, opacity: activeTheme === theme.id ? 1 : 0.6 }}
              />
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

      <div className="h-px bg-border-notion opacity-50" />

      {/* Profile Section */}
      <div>
        <button
          onClick={() => setProfileOpen(o => !o)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <User size={12} className="text-foreground/30" />
            <span className="text-[10px] font-black text-foreground/30 uppercase tracking-[2px]">Hồ sơ</span>
          </div>
          {profileOpen ? <ChevronUp size={12} className="text-foreground/30" /> : <ChevronDown size={12} className="text-foreground/30" />}
        </button>

        {profileOpen && (
          <div className="mt-4 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5">Tên hiển thị</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tên của bạn..."
                className="w-full px-3 py-2 bg-card/60 border border-border-notion rounded-xl text-xs font-bold text-accent outline-none focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5">Tuổi</label>
              <input
                type="number"
                min={6}
                max={99}
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="VD: 16"
                className="w-full px-3 py-2 bg-card/60 border border-border-notion rounded-xl text-xs font-bold text-accent outline-none focus:ring-1 focus:ring-accent/20 transition-all"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5">Lớp / Cấp học</label>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all",
                      grade === g
                        ? "bg-accent text-background border-accent"
                        : "bg-card/60 text-foreground/40 border-border-notion hover:border-accent/30"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Subjects */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/30 mb-1.5">Môn học quan tâm</label>
              <div className="flex flex-wrap gap-1.5">
                {subjects.map(s => (
                  <button
                    key={s}
                    onClick={() => toggleSubject(s)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all",
                      selectedSubjects.includes(s)
                        ? "bg-accent text-background border-accent"
                        : "bg-card/60 text-foreground/40 border-border-notion hover:border-accent/30"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className={cn(
                "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                saved
                  ? "bg-success/10 text-success border border-success/20"
                  : "bg-accent text-background hover:opacity-90 disabled:opacity-40"
              )}
            >
              {saved ? <><Check size={12} /> Đã lưu</> : saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
