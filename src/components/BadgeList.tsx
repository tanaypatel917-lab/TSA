"use client";
import type { BADGES } from "@/engine/badges";
import { useProgress } from "@/state/ProgressProvider";

export function BadgeList({ badges }: { badges: typeof BADGES }) {
  const { state } = useProgress();
  return (
    <ol className="mt-10 grid gap-px border border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
      {badges.map((badge, i) => {
        const earned = state.badges.includes(badge.id);
        return (
          <li key={badge.id} className={`relative flex min-h-[220px] flex-col justify-between p-6 ${earned ? "bg-ink text-paper" : "bg-paper text-ink"}`}>
            <div className="flex items-start justify-between">
              <span className={`index ${earned ? "text-paper/70" : ""}`}>{String(i + 1).padStart(2, "0")} / {earned ? "earned" : "locked"}</span>
              <span aria-hidden="true" className="text-3xl">{earned ? badge.icon : "🔒"}</span>
            </div>
            <div>
              <h2 className="display-sm">{badge.name}</h2>
              <p className={`mt-3 text-sm leading-relaxed ${earned ? "text-paper/80" : "text-mute"}`}>{badge.description}</p>
            </div>
            {earned && <span aria-hidden="true" className="absolute right-0 top-0 h-2 w-2 bg-signal" />}
          </li>
        );
      })}
    </ol>
  );
}
