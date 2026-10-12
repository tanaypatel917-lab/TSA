"use client";

import { useState } from "react";

export function UnderTheHood({ id, spec, children, onOpenChange }: { id: string; spec: string; children: React.ReactNode; onOpenChange?: (open: boolean) => void }) {
  const [open, setOpen] = useState(false);

  function toggle() {
    const next = !open;
    setOpen(next);
    onOpenChange?.(next);
  }

  return <section className="under-the-hood">
    <p className="under-the-hood-spec">{spec}</p>
    <button type="button" className="under-the-hood-toggle" aria-expanded={open} aria-controls={id} onClick={toggle}>Look under the hood <span aria-hidden="true">{open ? "−" : "+"}</span></button>
    <div className="under-the-hood-panel" id={id} hidden={!open}>{children}</div>
  </section>;
}
