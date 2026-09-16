"use client";

import { useState } from "react";
import { levelFor } from "@/engine/levels";
import { useAuth } from "@/state/AuthProvider";
import { useProgress } from "@/state/ProgressProvider";

function syncLabel(status: ReturnType<typeof useProgress>["syncStatus"], lastSyncedAt: string | null): string {
  if (status === "synced" && lastSyncedAt) {
    return `synced · ${new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(lastSyncedAt))}`;
  }
  if (status === "syncing") return "syncing…";
  if (status === "error") return "sync error";
  return "local only";
}

export default function AccountPage() {
  const { configured, user, ready, signIn, signUp, signInWithGoogle, signOut } = useAuth();
  const { state, syncStatus, lastSyncedAt, deleteCloudData } = useProgress();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = mode === "login" ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else if (mode === "signup") {
      setNotice("Check your email to confirm your account, then log in.");
    }
  }

  async function continueWithGoogle() {
    setBusy(true);
    setError(null);
    const result = await signInWithGoogle();
    setBusy(false);
    if (result.error) setError(result.error);
  }

  async function leaveAccount() {
    setBusy(true);
    const result = await signOut();
    setBusy(false);
    if (result.error) setError(result.error);
  }

  async function removeCloudProgress() {
    if (!window.confirm("Delete cloud progress? Your local progress will stay on this device.")) return;
    setBusy(true);
    const result = await deleteCloudData();
    setBusy(false);
    if (result.error) setError(result.error);
    else setNotice("Cloud progress deleted. Your local progress is still here.");
  }

  if (!configured) {
    return <div className="shell py-32"><div className="max-w-3xl"><p className="eyebrow"><span className="mr-3 text-accent">01</span> Your account</p><h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Accounts are<br /><em>not set up yet.</em></h1><p className="mt-10 max-w-prose text-lg leading-relaxed text-ink/70">AI Compass is ready to work locally. An administrator can connect Supabase later to enable optional accounts and cloud progress sync; nothing changes about local progress in the meantime.</p></div></div>;
  }

  if (!ready) {
    return <div className="shell py-32"><p className="eyebrow">Your account</p><p className="mt-8 font-display text-4xl italic">Checking the signal…</p></div>;
  }

  if (user) {
    const level = levelFor(state.xp);
    return <div className="shell py-32"><div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-8"><p className="eyebrow"><span className="mr-3 text-accent">01</span> Your account</p><h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Keep your<br /><em>signal.</em></h1></div><p className="self-end text-lg leading-relaxed text-ink/65 lg:col-start-9 lg:col-span-4">Your account syncs only your learning progress. Practice content and answers stay out of the cloud.</p></div><section className="mt-20 grid gap-6 sm:grid-cols-2"><div className="card"><p className="eyebrow">Signed in as</p><p className="mt-5 break-all font-display text-3xl italic">{user.email}</p><span className="mt-6 inline-flex border border-line px-3 py-2 font-mono text-[10px] uppercase tracking-wider">{syncLabel(syncStatus, lastSyncedAt)}</span></div><div className="card"><p className="eyebrow">Local progress</p><p className="mt-5 font-mono text-5xl">{state.xp} <span className="text-sm text-ink/50">XP</span></p><p className="mt-2 font-display text-2xl italic">{level.name}</p></div></section>{error && <p className="mt-8 text-sm text-accent" role="alert">{error}</p>}{notice && <p className="mt-8 text-sm text-ink/70" role="status">{notice}</p>}<div className="mt-12 flex flex-wrap gap-5 border-t border-line pt-8"><button className="btn-pill" onClick={leaveAccount} disabled={busy}>Sign out</button><button className="btn-ghost" onClick={removeCloudProgress} disabled={busy}>Delete cloud data ↗</button></div><p className="mt-8 max-w-prose text-sm leading-relaxed text-ink/60">Local progress stays on this device even if you sign out or delete your cloud data.</p></div>;
  }

  return <div className="shell py-32"><div className="grid gap-8 lg:grid-cols-12"><div className="lg:col-span-7"><p className="eyebrow"><span className="mr-3 text-accent">01</span> Your account</p><h1 className="mt-7 font-display text-[clamp(3rem,8vw,7rem)] leading-[.88]">Keep learning<br /><em>on your terms.</em></h1></div><p className="self-end text-lg leading-relaxed text-ink/65 lg:col-start-9 lg:col-span-4">Accounts are optional. Local progress works without one; signing in adds a private cloud copy across devices.</p></div><div className="mt-20 max-w-xl"><form className="card" onSubmit={submit}><div><label htmlFor="account-email" className="eyebrow">Email</label><input id="account-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-3 w-full border-line bg-paper" /></div><div className="mt-6"><label htmlFor="account-password" className="eyebrow">Password</label><input id="account-password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-3 w-full border-line bg-paper" /></div>{error && <p className="mt-5 text-sm text-accent" role="alert">{error}</p>}{notice && <p className="mt-5 text-sm text-ink/70" role="status">{notice}</p>}<div className="mt-8 flex flex-wrap gap-4"><button className="btn-pill" type="submit" disabled={busy}>{mode === "login" ? "Log in" : "Create account"}</button><button className="btn-ghost" type="button" onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setNotice(null); }}>{mode === "login" ? "Create account" : "Back to log in"}</button></div><div className="my-8 flex items-center gap-4 font-mono text-[10px] uppercase tracking-wider text-ink/45"><span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" /></div><button className="btn-ghost w-full" type="button" onClick={continueWithGoogle} disabled={busy}>Continue with Google ↗</button></form><p className="mt-6 text-sm leading-relaxed text-ink/60">Only progress data is synced. Lesson answers and practice writing remain on this device.</p></div></div>;
}
