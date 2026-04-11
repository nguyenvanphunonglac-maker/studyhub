"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { joinSession, SessionError } from "@/services/sessionService";

export default function JoinSessionForm() {
  const { user } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setJoining(true);
    try {
      const sessionId = await joinSession(
        code.trim().toUpperCase(),
        user.uid,
        user.displayName ?? user.email ?? "Participant"
      );
      router.push(`/session/${sessionId}`);
    } catch (err) {
      if (err instanceof SessionError) {
        switch (err.code) {
          case "NOT_FOUND":
          case "EXPIRED":
            setError("Mã phòng không hợp lệ hoặc đã hết hạn");
            break;
          case "INVALID_STATE":
            setError("Phiên thi đang diễn ra, không thể tham gia");
            break;
          default:
            setError("Đã xảy ra lỗi. Vui lòng thử lại.");
        }
      } else {
        setError("Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setJoining(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-foreground">Tham gia phòng thi</h1>
        <p className="text-sm text-foreground/60">Nhập mã phòng 6 ký tự để tham gia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="VD: AB12CD"
          maxLength={6}
          required
          className="w-full text-center text-2xl font-mono tracking-widest uppercase border border-border rounded-xl px-4 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={joining || code.trim().length !== 6}
          className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {joining && <Loader2 className="animate-spin" size={16} />}
          {joining ? "Đang tham gia..." : "Tham gia"}
        </button>
      </form>
    </div>
  );
}
