"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { evaluateBadges } from "@/engine/badges";
import { mergeProgress } from "@/engine/merge";
import { apply, initialState, normalizeState, type ProgressEvent, type ProgressState } from "@/engine/progress";
import { describeEvent } from "@/engine/memoryEvents";
import { levelFor } from "@/engine/levels";
import { exportProgress, importProgress, isProgressState, loadProgress, saveProgress } from "@/engine/storage";
import { modules } from "@/content";
import { addMemory, deleteAllMemories, memoryConfigured } from "@/lib/memory";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type SyncStatus = "off" | "syncing" | "synced" | "error";

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
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  deleteCloudData: () => Promise<{ error: string | null }>;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const userId = user?.id;
  const [state, setState] = useState(initialState);
  const [hydrated, setHydrated] = useState(false);
  const [newBadgeToast, setNewBadgeToast] = useState<string[]>([]);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("off");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const skipNextSync = useRef(false);
  const stateRef = useRef(state);

  useEffect(() => {
    setState(loadProgress());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveProgress(state);
  }, [hydrated, state]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

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

  const writeCloudState = useCallback(async (userId: string, nextState: ProgressState) => {
    if (!supabase) return { error: null };
    const syncedAt = new Date().toISOString();
    const { error } = await supabase.from("progress").upsert({
      user_id: userId,
      state: nextState,
      updated_at: syncedAt
    });
    if (error) return { error: error.message };
    setLastSyncedAt(syncedAt);
    return { error: null };
  }, []);

  useEffect(() => {
    if (!hydrated || !authReady) return;
    if (!userId || !supabase) {
      setSyncStatus("off");
      return;
    }

    let cancelled = false;
    setSyncStatus("syncing");
    void (async () => {
      const { data, error } = await supabase
        .from("progress")
        .select("state")
        .eq("user_id", userId)
        .maybeSingle();
      if (cancelled) return;
      if (error) {
        setSyncStatus("error");
        return;
      }

      const remote = isProgressState(data?.state) ? normalizeState(data.state) : null;
      const merged = evaluateState(remote ? mergeProgress(stateRef.current, remote) : stateRef.current);
      skipNextSync.current = true;
      setState(merged);
      const result = await writeCloudState(userId, merged);
      if (cancelled) return;
      if (result.error) {
        setSyncStatus("error");
      } else {
        setSyncStatus("synced");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authReady, hydrated, userId, writeCloudState]);

  useEffect(() => {
    if (!hydrated || !authReady || !userId || !supabase) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }
    setSyncStatus("syncing");
    const timer = window.setTimeout(() => {
      void writeCloudState(userId, state).then((result) => {
        setSyncStatus(result.error ? "error" : "synced");
      });
    }, 800);
    return () => window.clearTimeout(timer);
  }, [authReady, hydrated, state, userId, writeCloudState]);

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
    if (memoryConfigured && userId) {
      const messages = describeEvent(event, modules);
      if (messages) {
        void addMemory(messages, { source: "ai-compass", eventType: event.type, day: event.day }).catch(() => undefined);
      }
    }
  }, [userId]);

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

  const deleteCloudData = useCallback(async () => {
    if (!supabase || !userId) return { error: null };
    const { error } = await supabase.from("progress").delete().eq("user_id", userId);
    if (error) {
      setSyncStatus("error");
      return { error: error.message };
    }
    setLastSyncedAt(new Date().toISOString());
    setSyncStatus("synced");
    if (memoryConfigured) {
      void deleteAllMemories().catch(() => undefined);
    }
    return { error: null };
  }, [userId]);

  const value = useMemo(() => ({
    state,
    dispatch,
    reset,
    importJson,
    newBadgeToast,
    celebration,
    dismissCelebration,
    hydrated,
    syncStatus,
    lastSyncedAt,
    deleteCloudData
  }), [state, dispatch, reset, importJson, newBadgeToast, celebration, dismissCelebration, hydrated, syncStatus, lastSyncedAt, deleteCloudData]);
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error("useProgress must be used inside ProgressProvider");
  return context;
}

export { exportProgress };

function evaluateState(state: ProgressState): ProgressState {
  return { ...state, badges: evaluateBadges(state, modules) };
}
