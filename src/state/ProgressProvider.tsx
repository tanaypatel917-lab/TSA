"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { evaluateBadges } from "@/engine/badges";
import { apply, initialState, type ProgressEvent, type ProgressState } from "@/engine/progress";
import { exportProgress, importProgress, loadProgress, saveProgress } from "@/engine/storage";
import { modules } from "@/content";

type ProgressContextValue = {
  state: ProgressState;
  dispatch: (event: ProgressEvent) => void;
  reset: () => void;
  importJson: (json: string) => boolean;
  newBadgeToast: string[];
  hydrated: boolean;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string[]>([]);

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

  const dispatch = useCallback((event: ProgressEvent) => {
    setState((current) => {
      const result = apply(current, event, modules);
      const badges = evaluateBadges(result.state, modules);
      const fresh = badges.filter((badge) => !current.badges.includes(badge));
      if (fresh.length) setNewBadgeToast(fresh);
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

  const value = useMemo(() => ({ state, dispatch, reset, importJson, newBadgeToast, hydrated }), [state, dispatch, reset, importJson, newBadgeToast, hydrated]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}

export { exportProgress };
