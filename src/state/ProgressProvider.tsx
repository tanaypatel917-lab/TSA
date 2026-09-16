"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { evaluateBadges } from "@/engine/badges";
import { mergeProgress } from "@/engine/merge";
import { apply, initialState, type ProgressEvent, type ProgressState } from "@/engine/progress";
import { exportProgress, importProgress, isProgressState, loadProgress, saveProgress } from "@/engine/storage";
import { modules } from "@/content";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./AuthProvider";

type SyncStatus = "off" | "syncing" | "synced" | "error";

type ProgressContextValue = {
  state: ProgressState;
  dispatch: (event: ProgressEvent) => void;
  reset: () => void;
  importJson: (json: string) => boolean;
  newBadgeToast: string[];
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

      const remote = isProgressState(data?.state) ? data.state : null;
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

  const deleteCloudData = useCallback(async () => {
    if (!supabase || !userId) return { error: null };
    const { error } = await supabase.from("progress").delete().eq("user_id", userId);
    if (error) {
      setSyncStatus("error");
      return { error: error.message };
    }
    setLastSyncedAt(new Date().toISOString());
    setSyncStatus("synced");
    return { error: null };
  }, [userId]);

  const value = useMemo(() => ({
    state,
    dispatch,
    reset,
    importJson,
    newBadgeToast,
    hydrated,
    syncStatus,
    lastSyncedAt,
    deleteCloudData
  }), [state, dispatch, reset, importJson, newBadgeToast, hydrated, syncStatus, lastSyncedAt, deleteCloudData]);
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
