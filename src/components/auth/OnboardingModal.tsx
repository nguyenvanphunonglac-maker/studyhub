"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { subjects } from "@/context/LanguageContext";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const GRADES = [
  "Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9",
  "Lớp 10", "Lớp 11", "Lớp 12",
  "Đại học", "Sau đại học", "Khác",
];

export default function OnboardingModal() {
  const { user, finishOnboarding } = useAuth();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [age, setAge] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggleSubject = (s: string) => {
    setSelectedSubjects(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]
    );
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    await userService.completeOnboarding(user.uid, {
      displayName: displayName.trim() || user.displayName || "Học sinh",
      age: parseInt(age) || 0,
      grade,
      subjects: selectedSubjects,
    });
    finishOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border-notion rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Sparkles size={20} className="text-accent" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30">Bước {step}/2</p>
            <h2 className="text-xl font-extrabold text-accent tracking-tight">
              {step === 1 ? "Chào mừng bạn! 👋" : "Môn học quan tâm"}
            </h2>
          </div>
        </div>
        <p className="text-sm text-foreground/40 font-medium mb-8">
          {step === 1
            ? "Cho chúng tôi biết thêm về bạn để cá nhân hóa trải nghiệm học tập."
            : "Chọn các môn bạn muốn tập trung. Có thể thay đổi sau."}
        </p>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30 mb-2">Tên hiển thị</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Tên của bạn..."
                className="w-full px-4 py-3 bg-active-notion/40 border border-border-notion rounded-xl text-sm font-bold text-accent outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30 mb-2">Tuổi</label>
              <input
                type="number"
                min={6}
                max={99}
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="VD: 16"
                className="w-full px-4 py-3 bg-active-notion/40 border border-border-notion rounded-xl text-sm font-bold text-accent outline-none focus:ring-2 focus:ring-accent/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-widest text-foreground/30 mb-2">Lớp / Cấp học</label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map(g => (
                  <button
                    key={g}
                    onClick={() => setGrade(g)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-bold border transition-all",
                      grade === g
                        ? "bg-accent text-background border-accent shadow-lg shadow-accent/20"
                        : "bg-active-notion/40 text-foreground/50 border-border-notion hover:border-accent/30"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {subjects.map(s => (
              <button
                key={s}
                onClick={() => toggleSubject(s)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold border transition-all",
                  selectedSubjects.includes(s)
                    ? "bg-accent text-background border-accent shadow-lg shadow-accent/20"
                    : "bg-active-notion/40 text-foreground/50 border-border-notion hover:border-accent/30"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border-notion/50">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-foreground/40 hover:text-accent transition-colors"
            >
              ← Quay lại
            </button>
          ) : (
            <div />
          )}
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!displayName.trim() || !grade}
              className="flex items-center gap-2 bg-accent text-background px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:opacity-90 disabled:opacity-30 transition-all"
            >
              Tiếp theo <ChevronRight size={14} />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={saving || selectedSubjects.length === 0}
              className="flex items-center gap-2 bg-accent text-background px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest shadow-xl hover:opacity-90 disabled:opacity-30 transition-all"
            >
              {saving ? "Đang lưu..." : "Bắt đầu học 🚀"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
