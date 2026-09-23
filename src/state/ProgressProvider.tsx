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
  storageError: string;
  importFeedback: string;
  dismissBadgeToast: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string[]>([]);
  const [storageError, setStorageError] = useState("");
  const [importFeedback, setImportFeedback] = useState("");
  const dismissBadgeToast = useCallback(() => setNewBadgeToast([]), []);

  useEffect(() => {
    setState(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { saveProgress(state); setStorageError(""); }
    catch { setStorageError("Progress could not be saved on this device. You can keep learning and export your progress from My learning before leaving."); }
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
    if (!imported) { setImportFeedback("Import failed. Choose a valid version 1 progress JSON file; your current progress is unchanged."); return false; }
    const unknown = imported.completedLessons.some((key) => !modules.some((module) => module.lessons.some((lesson) => key === `${module.id}/${lesson.id}`)))
      || imported.completedActivities.some((id) => !modules.some((module) => module.id === id))
      || Object.keys(imported.quizBest).some((id) => !modules.some((module) => module.id === id));
    setState({ ...imported, badges: evaluateBadges(imported, modules) });
    setImportFeedback(`Progress imported.${unknown ? " Unrecognized learning IDs were retained for compatibility and are not included in your learning path." : ""}`);
    return true;
  }, []);

  const value = useMemo(() => ({ state, dispatch, reset, importJson, newBadgeToast, hydrated, storageError, importFeedback, dismissBadgeToast }), [state, dispatch, reset, importJson, newBadgeToast, hydrated, storageError, importFeedback, dismissBadgeToast]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}

export function nextLearningTask(state: ProgressState) {
  for (const currentModule of modules) {
    const lesson = currentModule.lessons.find((item) => !state.completedLessons.includes(`${currentModule.id}/${item.id}`));
    if (lesson) return { href: `/modules/${currentModule.slug}/lessons/${lesson.id}`, label: lesson.title };
    if (!state.completedActivities.includes(currentModule.id)) return { href: `/modules/${currentModule.slug}/activity`, label: currentModule.activity.title };
    if ((state.quizBest[currentModule.id] ?? 0) < 70) return { href: `/modules/${currentModule.slug}/quiz`, label: `${currentModule.title}: knowledge check` };
  }
  return { href: "/modules", label: "All chapters complete. Revisit a question that interests you." };
}

export { exportProgress };
