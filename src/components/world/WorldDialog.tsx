"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = { labelledBy: string; module: string; onClose: () => void; children: React.ReactNode; wide?: boolean };

export function WorldDialog({ labelledBy, module, onClose, children, wide }: Props) {
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    dialog.current?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape") { event.preventDefault(); close.current(); return; }
      if (event.key !== "Tab" || !dialog.current) return;
      const focusable = Array.from(dialog.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), input, [tabindex='-1']")).filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    document.addEventListener("keydown", keydown, true);
    return () => document.removeEventListener("keydown", keydown, true);
  }, []);

  return createPortal(<div className="station-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close.current(); }}>
    <div ref={dialog} className={`station-panel${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} data-module={module}>{children}</div>
  </div>, document.body);
}
