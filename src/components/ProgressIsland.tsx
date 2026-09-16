"use client";

import { useEffect, useRef, useState } from "react";
import { Award, Compass, Sparkles } from "lucide-react";
import DynamicIsland from "@/components/smoothui/dynamic-island";
import { BADGES } from "@/engine/badges";
import { levelFor } from "@/engine/levels";
import { useProgress } from "@/state/ProgressProvider";

const SHOW_MS = 3200;

type Burst = { xp: number; badge: string | null };

export function ProgressIsland() {
  const { state, hydrated, newBadgeToast } = useProgress();
  const previousXp = useRef<number | null>(null);
  const [burst, setBurst] = useState<Burst | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (previousXp.current === null) {
      previousXp.current = state.xp;
      return;
    }
    const gained = state.xp - previousXp.current;
    previousXp.current = state.xp;
    if (gained <= 0) return;
    const badgeId = newBadgeToast[0];
    const badge = badgeId ? BADGES.find((item) => item.id === badgeId)?.name ?? badgeId : null;
    setBurst({ xp: gained, badge });
    const timer = window.setTimeout(() => setBurst(null), SHOW_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, newBadgeToast, state.xp]);

  const level = levelFor(state.xp);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 bottom-14 z-40 flex justify-center px-4">
      <DynamicIsland
        bare
        view={burst ? "ring" : "idle"}
        className="font-mono text-[11px] uppercase tracking-[0.12em] text-paper"
        idleContent={
          <div className="flex items-center gap-2 px-4 py-2">
            <Compass className="h-4 w-4 text-signalBright" />
            <span>lvl://{level.name}</span>
            <span className="text-paper/60">xp://{hydrated ? state.xp : 0}</span>
          </div>
        }
        ringContent={
          burst ? (
            <div className="flex w-72 items-center gap-3 px-4 py-2">
              {burst.badge ? <Award className="h-5 w-5 shrink-0 text-lime" /> : <Sparkles className="h-5 w-5 shrink-0 text-signalBright" />}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-signalBright">+{burst.xp} xp</p>
                <p className="truncate text-paper/70">{burst.badge ? `badge://${burst.badge}` : `lvl://${level.name}`}</p>
              </div>
            </div>
          ) : null
        }
      />
    </div>
  );
}
