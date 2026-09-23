"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Preference = "system" | "reduced" | "full";
type MotionValue = { preference: Preference; reduced: boolean; setPreference: (value: Preference) => void; error: string };
const MotionContext = createContext<MotionValue | null>(null);
export const MOTION_KEY = "wordplay:motion:v1";
const KEY = MOTION_KEY;

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [preference, updatePreference] = useState<Preference>("system");
  const [systemReduced, setSystemReduced] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(query.matches);
    update();
    query.addEventListener("change", update);
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "system" || saved === "reduced" || saved === "full") updatePreference(saved);
    } catch { setError("Motion preference is available for this visit only."); }
    setReady(true);
    return () => query.removeEventListener("change", update);
  }, []);
  const reduced = !ready || preference === "reduced" || (preference === "system" && systemReduced);
  useEffect(() => { document.documentElement.dataset.motion = reduced ? "reduced" : "full"; }, [reduced]);
  function setPreference(value: Preference) {
    updatePreference(value);
    try { localStorage.setItem(KEY, value); setError(""); }
    catch { setError("Motion preference is available for this visit only."); }
  }
  return <MotionContext.Provider value={{ preference, reduced, setPreference, error }}>{children}</MotionContext.Provider>;
}

export function useMotionPreference() {
  const value = useContext(MotionContext);
  if (!value) throw new Error("Motion preferences require MotionProvider");
  return value;
}

export function MotionPreferences() {
  const { preference, setPreference, error } = useMotionPreference();
  return <div className="motion-setting"><label htmlFor="motion-preference">Motion</label><select id="motion-preference" value={preference} onChange={(event) => setPreference(event.target.value as Preference)}><option value="system">System</option><option value="reduced">Reduced</option><option value="full">Full</option></select>{error && <p role="status">{error}</p>}</div>;
}
