"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluateBadges } from "@/engine/badges";
import { apply, initialState, type ProgressEvent, type ProgressState } from "@/engine/progress";
import { levelFor } from "@/engine/levels";
import { exportProgress, importProgress, loadProgress, saveProgress } from "@/engine/storage";
import { modules } from "@/content";

export type Celebration = { kind: "level-up" | "quiz" | "badge" | "daily" | "shield"; title: string; detail?: string };

type ProgressContextValue = {
  state: ProgressState;
  dispatch: (event: ProgressEvent) => void;
  reset: () => void;
  importJson: (json: string) => boolean;
  newBadgeToast: string[];
  celebration: Celebration | null;
  dismissCelebration: () => void;
  hydrated: boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string[]>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);

  useEffect(() => {
    setState(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(state);
  }, [hydrated, state]);

  useEffect(() => {
    if (!newBadgeToast.length) return;
    const timer = window.setTimeout(() => setNewBadgeToast([]), 4000);
    return () => window.clearTimeout(timer);
  }, [newBadgeToast]);

  useEffect(() => {
    if (!celebration) return;
    const timer = window.setTimeout(() => setCelebration(null), 3500);
    return () => window.clearTimeout(timer);
  }, [celebration]);

  const dismissCelebration = useCallback(() => setCelebration(null), []);

  const dispatch = useCallback((event: ProgressEvent) => {
    setState((current) => {
      const result = apply(current, event, modules);
      const badges = evaluateBadges(result.state, modules);
      const fresh = badges.filter((badge) => !current.badges.includes(badge));
      if (fresh.length) setNewBadgeToast(fresh);
      if (result.leveledUp) {
        setCelebration({ kind: "level-up", title: `Level up! You're now ${levelFor(result.state.xp).name}` });
      } else if (event.type === "quiz-completed" && event.scorePct >= 70) {
        setCelebration({ kind: "quiz", title: "Quiz complete!", detail: `You scored ${Math.round(event.scorePct)}%.` });
      } else if (event.type === "daily-challenge-completed" && result.xpGained > 0) {
        setCelebration({ kind: "daily", title: "Compass Check complete", detail: "+15 XP" });
      }
      if (result.shieldUsed) {
        setCelebration({ kind: "shield", title: "Welcome back! Your compass is still pointing north.", detail: "A streak shield kept your streak alive." });
      }
      return { ...result.state, badges };
    });
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
    setNewBadgeToast([]);
  }, []);

  const importJson = useCallback((json: string) => {
    const imported = importProgress(json);
    if (!imported) return false;
    setState({ ...imported, badges: evaluateBadges(imported, modules) });
    return true;
  }, []);

  const value = useMemo(() => ({ state, dispatch, reset, importJson, newBadgeToast, celebration, dismissCelebration, hydrated }), [state, dispatch, reset, importJson, newBadgeToast, celebration, dismissCelebration, hydrated]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}

export { exportProgress };
