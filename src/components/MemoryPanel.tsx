"use client";

import { useState } from "react";
import { deleteAllMemories, listMemories, searchMemories, type Memory } from "@/lib/memory";

export function MemoryPanel() {
  const [query, setQuery] = useState("");
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function run(action: () => Promise<{ memories: Memory[]; error: string | null }>) {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await action();
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMemories(result.memories);
    }
  }

  async function search(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) return;
    await run(() => searchMemories(query.trim()));
  }

  async function showAll() {
    await run(listMemories);
  }

  async function forgetAll() {
    if (!window.confirm("Delete all learning memory for your account? This cannot be undone.")) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = await deleteAllMemories();
    setBusy(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMemories([]);
      setNotice("Learning memory cleared.");
    }
  }

  return (
    <div className="card sm:col-span-2">
      <p className="eyebrow">Learning memory</p>
      <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink/75">
        AI Compass remembers what you finish so your experience can improve over time. Memories are private to your account.
      </p>
      <form className="mt-6 flex flex-wrap gap-3" onSubmit={search}>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search your memory…"
          aria-label="Search learning memory"
          className="min-w-0 flex-1 border-line bg-paper"
        />
        <button className="btn-ghost" type="submit" disabled={busy}>Search</button>
        <button className="btn-ghost" type="button" onClick={showAll} disabled={busy}>Show all</button>
      </form>
      {busy && <p className="mt-5 text-sm text-ink/70">Thinking…</p>}
      {error && <p className="mt-5 text-sm text-accent" role="alert">{error}</p>}
      {notice && <p className="mt-5 text-sm text-ink/70" role="status">{notice}</p>}
      {!busy && memories !== null && (
        memories.length === 0 ? (
          <p className="mt-5 text-sm text-ink/70">Nothing remembered yet — finish a lesson to start.</p>
        ) : (
          <ul className="mt-5 divide-y divide-line">
            {memories.map((memory) => (
              <li key={memory.id} className="py-4">
                <p className="text-sm leading-relaxed">{memory.memory}</p>
                {memory.created_at && (
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-ink/60">
                    {new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(memory.created_at))}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )
      )}
      <div className="mt-6 border-t border-line pt-5">
        <button className="btn-ghost" type="button" onClick={forgetAll} disabled={busy}>Forget everything</button>
      </div>
    </div>
  );
}
