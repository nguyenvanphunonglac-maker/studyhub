"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "@/context/AuthContext";
import { noteService, Note } from "@/services/noteService";
import dynamic from "next/dynamic";
import { Loader2, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { subjects } from "@/context/LanguageContext";

import { CardListSkeleton, GridSkeleton, StatsSkeleton } from "@/components/Skeleton";

const loadingCard = () => <div className="p-8"><CardListSkeleton /></div>;
const loadingGrid = () => <div className="p-8"><GridSkeleton /></div>;
const loadingStats = () => <StatsSkeleton />;

const Sidebar = dynamic(() => import("./Sidebar"));
const Editor = dynamic(() => import("./Editor"), { loading: loadingCard });
const FlashcardManager = dynamic(() => import("./FlashcardManager"), { loading: loadingGrid });
const QuizManager = dynamic(() => import("./QuizManager"), { loading: loadingGrid });
const Pomodoro = dynamic(() => import("./Pomodoro"), { loading: loadingCard });
const StatsDashboard = dynamic(() => import("./StatsDashboard"), { loading: loadingStats });
const Community = dynamic(() => import("./Community"), { loading: loadingGrid });
const KanbanBoard = dynamic(() => import("./KanbanBoard"), { loading: loadingCard });
const HabitTracker = dynamic(() => import("./HabitTracker"), { loading: loadingCard });
const MindMap = dynamic(() => import("./MindMap"), { loading: loadingCard });
const AIStudyBuddy = dynamic(() => import("./AIStudyBuddy"), { ssr: false });

export type ViewType = "dashboard" | "notes" | "flashcards" | "quiz" | "pomodoro" | "community" | "kanban" | "habits" | "mindmap";

export default function Dashboard() {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewType>("dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [pendingSubject, setPendingSubject] = useState("Khác");

  useEffect(() => {
    if (!user) return;

    const unsubscribe = noteService.subscribeToNotes(user.uid, (fetchedNotes) => {
      setNotes(fetchedNotes);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Filtering Logic
  const filteredNotes = notes.filter((note) => {
    const matchesSearch = 
      note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = activeTag ? note.tags?.includes(activeTag) : true;
    return matchesSearch && matchesTag;
  });

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  const handleCreateNote = async () => {
    if (!user) return;
    setShowSubjectModal(true);
  };

  const handleConfirmCreateNote = async () => {
    if (!user) return;
    const newId = await noteService.createNote(user.uid, "Untitled", pendingSubject);
    setActiveNoteId(newId);
    setView("notes");
    setIsSidebarOpen(false);
    setShowSubjectModal(false);
    setPendingSubject("Khác");
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
    await noteService.updateNote(id, updates);
  };

  const handleDeleteNote = async (id: string) => {
    if (confirm("Are you sure you want to delete this note?")) {
      await noteService.deleteNote(id);
      if (activeNoteId === id) {
        setActiveNoteId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-foreground/20" size={32} />
      </div>
    );
  }

  const renderContent = () => {
    switch (view) {
      case "dashboard":
        return <StatsDashboard />;
      case "notes":
        return (
          <Editor
            note={activeNote}
            notes={notes}
            onUpdate={handleUpdateNote}
            onDelete={handleDeleteNote}
            onCreate={handleCreateNote}
            onSelect={(id) => setActiveNoteId(id)}
          />
        );
      case "flashcards":
        return <FlashcardManager />;
      case "quiz":
        return <QuizManager />;
      case "pomodoro":
        return <Pomodoro />;
      case "community":
        return <Community />;
      case "kanban":
        return <KanbanBoard />;
      case "habits":
        return <HabitTracker />;
      case "mindmap":
        return <MindMap />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background relative">
      {/* Subject Picker Modal */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm">
          <div className="bg-card border border-border-notion rounded-3xl p-8 shadow-2xl w-full max-w-sm mx-4">
            <h3 className="text-lg font-black text-accent mb-1">Chọn môn học</h3>
            <p className="text-xs text-foreground/40 font-medium mb-6">Ghi chú này thuộc môn nào?</p>
            <select
              value={pendingSubject}
              onChange={(e) => setPendingSubject(e.target.value)}
              className="w-full p-3 bg-active-notion text-foreground border-none rounded-xl mb-6 outline-none font-medium"
            >
              {subjects.map(s => (
                <option key={s} value={s} className="bg-card text-foreground">{s}</option>
              ))}
            </select>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowSubjectModal(false)} className="px-4 py-2 text-foreground/40 font-bold text-sm">Hủy</button>
              <button onClick={handleConfirmCreateNote} className="bg-accent text-background px-6 py-2 rounded-xl font-black text-sm shadow-lg hover:opacity-90">Tạo ghi chú</button>
            </div>
          </div>
        </div>
      )}
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border-notion flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent text-background flex items-center justify-center font-black text-sm">S</div>
          <span className="font-black tracking-tighter text-accent">StudyHub</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-active-notion rounded-xl transition-colors"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Desktop and Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-full max-w-[90vw] transform lg:relative lg:w-auto lg:translate-x-0 transition-transform duration-300 ease-in-out",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar
          notes={filteredNotes}
          activeNoteId={activeNoteId || undefined}
          currentView={view}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          activeTag={activeTag}
          onTagSelect={setActiveTag}
          onViewChange={(v) => {
            setView(v);
            setIsSidebarOpen(false);
          }}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setView("notes");
            setIsSidebarOpen(false);
          }}
          onCreateNote={handleCreateNote}
        />
      </div>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 h-full overflow-hidden relative flex flex-col pt-16 lg:pt-0">
        <div className="flex-1 w-full overflow-y-auto custom-scrollbar relative">
          {renderContent()}
        </div>
      </main>

      {/* AI Study Buddy */}
      <AIStudyBuddy context={view === "notes" && activeNote ? `Tiêu đề: ${activeNote.title}\n\nNội dung: ${activeNote.content}` : undefined} />
    </div>
  );
}
