"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { nextLearningTask, useProgress } from "@/state/ProgressProvider";

const links = [{ href: "/modules", label: "Explore" }, { href: "/learn", label: "My learning" }, { href: "/play", label: "Play" }, { href: "/glossary", label: "Glossary" }, { href: "/badges", label: "Badges" }, { href: "/about", label: "About" }, { href: "/references", label: "References" }];

export function SiteNav() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { setOpen(false); }, [path]);
  useEffect(() => {
    if (!open) return;
    function escape(event: KeyboardEvent) {
      if (event.key === "Escape") { setOpen(false); trigger.current?.focus(); }
    }
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return <header className="site-header"><div className="shell nav-shell"><Link href="/" className="brand" aria-label="Wordplay home"><span className="wordmark">Wordplay<span aria-hidden="true">.</span></span><span className="brand-descriptor">Hands-on AI literacy</span></Link><button ref={trigger} className="menu-trigger" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu <span aria-hidden="true">{open ? "−" : "+"}</span></button><nav id="site-navigation" aria-label="Main navigation" className="site-navigation" data-open={open}>{links.map(({ href, label }) => <Link key={href} href={href} aria-current={path === href || path.startsWith(`${href}/`) ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}</nav></div></header>;
}

export function ResumeLearning() {
  const { state, hydrated } = useProgress();
  if (!hydrated || !state.startedAt) return null;
  const task = nextLearningTask(state);
  return <div className="resume-learning"><Link className="text-link" href={task.href}>Continue learning <span aria-hidden="true">↗</span></Link><span>{task.label}</span></div>;
}
