"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  if (reduced) return <>{children}</>;
  return <><AnimatePresence mode="wait">
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  </AnimatePresence><AnimatePresence>
    <motion.div
      key={`${pathname}-curtain`}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 origin-top bg-ink"
      initial={{ scaleY: 1 }}
      animate={{ scaleY: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    />
  </AnimatePresence></>;
}
