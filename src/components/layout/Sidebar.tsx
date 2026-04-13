"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Note } from "@/services/noteService";
import { 
  Plus, 
  Settings, 
  LogOut, 
  FileText, 
  Brain, 
  Timer, 
  GraduationCap, 
  Tag as TagIcon, 
  Hash, 
  LayoutGrid,
  Search,
  Globe,
  LayoutList,
  Target,
  GitBranch,
  Trophy,
  Users
} from "lucide-react";
import { ViewType } from "./Dashboard";
import { useLanguage } from "@/context/LanguageContext";
import SettingsToggle from "@/components/ui/SettingsToggle";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SidebarProps {
  notes: Note[];
  activeNoteId?: string;
  currentView: ViewType;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  activeTag: string | null;
  onTagSelect: (tag: string | null) => void;
  onViewChange: (view: ViewType) => void;
  onSelectNote: (id: string) => void;
  onCreateNote: () => void;
}

export default function Sidebar({ 
  notes, 
  activeNoteId, 
  currentView,
  searchTerm,
  onSearchChange,
  activeTag,
  onTagSelect,
  onViewChange,
  onSelectNote, 
  onCreateNote 
}: SidebarProps) {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  
  const allTags = Array.from(new Set(notes.flatMap(n => n.tags || [])));

  return (
    <aside className="w-full max-w-[90vw] sm:w-72 h-full glass border-r border-border-notion flex flex-col transition-colors duration-300">
      {/* User Session */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-accent text-background flex items-center justify-center font-bold text-sm shadow-md">
            {user?.displayName?.charAt(0) || "U"}
          </div>
          <span className="font-bold text-sm text-accent truncate">{user?.displayName}</span>
        </div>
        <button onClick={logout} className="p-1.5 hover:bg-error/10 hover:text-error rounded-lg text-foreground/40 transition-all" title={t('logout')}>
          <LogOut size={16} />
        </button>
      </div>

      {/* Global Search */}
      <div className="px-4 mb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" />
          <input 
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('search')}
            className="w-full bg-active-notion border-none rounded-xl py-2.5 pl-9 pr-3 text-xs font-medium outline-none focus:ring-2 focus:ring-accent/10 transition-all placeholder:text-foreground/20 text-accent"
          />
        </div>
      </div>

      {/* Scrollable middle section: nav + tags + recent notes */}
      <div className="flex-1 overflow-y-auto min-h-0">
      {/* Navigation Views */}
      <div className="px-3 space-y-1">
        <SidebarItem 
          icon={<LayoutGrid size={18} />} 
          label={t('dashboard')} 
          active={currentView === "dashboard"}
          onClick={() => onViewChange("dashboard")}
        />
        <SidebarItem 
          icon={<Plus size={18} />} 
          label={t('new_note')} 
          onClick={onCreateNote}
          highlight
        />
        <div className="h-px bg-border-notion my-4 mx-3" />
        
        <SidebarItem 
          icon={<FileText size={18} />} 
          label={t('notes')} 
          active={currentView === "notes" && !activeTag}
          onClick={() => onViewChange("notes")}
        />
        <SidebarItem 
          icon={<Brain size={18} />} 
          label={t('flashcards_title')} 
          active={currentView === "flashcards"}
          onClick={() => onViewChange("flashcards")}
        />
        <SidebarItem 
          icon={<GraduationCap size={18} />} 
          label={t('quizzes_title')} 
          active={currentView === "quiz"}
          onClick={() => onViewChange("quiz")}
        />
        <SidebarItem 
          icon={<Globe size={18} />} 
          label={t('community')} 
          active={currentView === "community"}
          onClick={() => onViewChange("community")}
        />
        <SidebarItem 
          icon={<LayoutList size={18} />} 
          label={t('kanban')} 
          active={currentView === "kanban"}
          onClick={() => onViewChange("kanban")}
        />
        <SidebarItem 
          icon={<Target size={18} />} 
          label={t('habits')} 
          active={currentView === "habits"}
          onClick={() => onViewChange("habits")}
        />
        <SidebarItem 
          icon={<Trophy size={18} />} 
          label={t('goals')} 
          active={currentView === "goals"}
          onClick={() => onViewChange("goals")}
        />
        <SidebarItem 
          icon={<GitBranch size={18} />} 
          label={t('mindmap')} 
          active={currentView === "mindmap"}
          onClick={() => onViewChange("mindmap")}
        />
        <SidebarItem 
          icon={<Timer size={18} />} 
          label={t('pomodoro_title')} 
          active={currentView === "pomodoro"}
          onClick={() => onViewChange("pomodoro")}
        />
        <div className="h-px bg-border-notion my-4 mx-3" />
        <SidebarItem
          icon={<Users size={18} />}
          label={t('join_room')}
          onClick={() => window.location.href = "/join"}
        />
      </div>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="mt-8 px-3">
          <p className="px-3 text-[10px] font-black text-foreground/20 uppercase tracking-[2px] mb-3 flex items-center justify-between">
            {t('tags_label')}
            <TagIcon size={10} />
          </p>
          <div className="flex flex-wrap gap-1.5 px-2">
            <button 
              onClick={() => onTagSelect(null)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all border",
                activeTag === null ? "bg-accent text-background border-accent shadow-lg shadow-accent/20" : "bg-card text-foreground/40 border-border-notion hover:border-accent/40"
              )}
            >
              {t('view_all')}
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[11px] font-extrabold transition-all border flex items-center gap-1.5",
                  activeTag === tag ? "bg-accent text-background border-accent shadow-lg shadow-accent/20" : "bg-card text-foreground/40 border-border-notion hover:border-accent/40"
                )}
              >
                <Hash size={10} className={activeTag === tag ? "text-background/40" : "text-foreground/20"} />
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Note Context */}
      <div className="mt-8 px-3 pb-6">
        <p className="px-3 text-[10px] font-black text-foreground/20 uppercase tracking-[2px] mb-3">
          {t('recent_notes')}
        </p>
        <div className="space-y-0.5">
          {notes.slice(0, 10).map((note) => (
            <button
              key={note.id}
              onClick={() => onSelectNote(note.id!)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition-all group",
                activeNoteId === note.id ? "bg-active-notion text-accent" : "text-foreground/50 hover:bg-active-notion hover:text-accent"
              )}
            >
              <FileText size={14} className={activeNoteId === note.id ? "text-accent" : "text-foreground/40 group-hover:text-accent"} />
              <span className="truncate">{note.title || t('untitled')}</span>
            </button>
          ))}
        </div>
      </div>

      </div> {/* end scrollable */}

      {/* Settings & Footer */}
      <SettingsPanel />
    </aside>
  );
}

function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();
  return (
    <>
      {open && <SettingsToggle />}
      <div className="p-4 border-t border-border-notion">
        <button
          onClick={() => setOpen(o => !o)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 text-xs font-bold transition-colors rounded-xl",
            open ? "text-accent bg-active-notion" : "text-foreground/30 hover:text-accent hover:bg-active-notion"
          )}
        >
          <Settings size={16} />
          {t('settings')}
        </button>
      </div>
    </>
  );
}

function SidebarItem({ 
  icon, 
  label, 
  active, 
  onClick, 
  highlight 
}: { 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean;
  onClick?: () => void;
  highlight?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-[13px] font-bold transition-all active:scale-95",
        active 
          ? "bg-accent text-background shadow-xl shadow-accent/20 translate-x-1" 
          : "text-foreground/50 hover:bg-active-notion hover:text-accent",
        highlight && "bg-accent text-background shadow-xl shadow-accent/20 hover:opacity-90"
      )}
    >
      <span className={cn("transition-colors", active ? "text-background" : "text-foreground/40")}>{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
}
