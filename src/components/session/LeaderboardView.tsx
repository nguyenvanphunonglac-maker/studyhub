"use client";

import { sortLeaderboard } from "@/services/sessionService";
import { ParticipantRecord } from "@/types/session";

interface LeaderboardViewProps {
  participants: ParticipantRecord[];
  currentUserId: string;
}

const RANK_MEDAL: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

function formatPercentage(score: number | undefined, total: number): string {
  if (total === 0 || score === undefined) return "—";
  return `${Math.round((score / total) * 100)}%`;
}

function formatSubmittedAt(p: ParticipantRecord): string {
  if (!p.submittedAt) return "—";
  return new Date(p.submittedAt.toMillis()).toLocaleTimeString();
}

export default function LeaderboardView({ participants, currentUserId }: LeaderboardViewProps) {
  const sorted = sortLeaderboard(participants);

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto py-6">
      <h2 className="text-xl font-bold text-center text-foreground">Bảng xếp hạng</h2>

      {sorted.length === 0 ? (
        <p className="text-center text-foreground/50 text-sm py-10">Chưa có kết quả</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((p, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const isSelf = p.userId === currentUserId;

            return (
              <div
                key={p.userId}
                data-top3={isTop3 || undefined}
                data-self={isSelf || undefined}
                className={[
                  "flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors",
                  isTop3
                    ? "bg-yellow-500/10 border-yellow-500/40"
                    : "bg-foreground/5 border-border",
                  isSelf ? "ring-2 ring-blue-500/60" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {/* Rank */}
                <span className="w-8 text-center text-sm font-bold shrink-0">
                  {RANK_MEDAL[rank] ?? rank}
                </span>

                {/* Name */}
                <span className="flex-1 text-sm font-medium text-foreground truncate">
                  {p.displayName}
                  {isSelf && (
                    <span className="ml-2 text-xs font-normal text-blue-500">(bạn)</span>
                  )}
                </span>

                {/* Score */}
                <span className="text-sm font-semibold tabular-nums shrink-0 text-foreground">
                  {p.score ?? 0}/{p.totalQuestions}
                </span>

                {/* Percentage */}
                <span className="text-xs tabular-nums text-foreground/60 shrink-0 w-10 text-right">
                  {formatPercentage(p.score, p.totalQuestions)}
                </span>

                {/* Submitted at */}
                <span className="text-xs text-foreground/40 shrink-0 hidden sm:block">
                  {formatSubmittedAt(p)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
