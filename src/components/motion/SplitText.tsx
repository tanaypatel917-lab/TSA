"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Children, cloneElement, isValidElement, useEffect, useState, type ElementType, type ReactNode } from "react";

type SplitTextProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
};

function units(children: ReactNode): ReactNode[] {
  const output: ReactNode[] = [];
  Children.toArray(children).forEach((child) => {
    if (typeof child === "string") {
      child.split(/(\s+)/).filter(Boolean).forEach((part) => {
        if (!/^\s+$/.test(part)) output.push(part);
      });
    } else {
      output.push(child);
    }
  });
  return output;
}

export function SplitText({ as: Tag = "div", className = "", children, delay = 0, stagger = 0.04, immediate = false }: SplitTextProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    setMounted(true);
    const timeout = window.setTimeout(() => setFallback(true), 1500);
    return () => window.clearTimeout(timeout);
  }, []);
  const parts = units(children);
  if (!mounted || reduced) return <Tag className={className}>{parts.map((part, index) => <span className="mr-[.24em] inline-block overflow-hidden align-bottom" key={`${index}-${typeof part === "string" ? part : "node"}`}>{isValidElement(part) ? cloneElement(part) : part}</span>)}</Tag>;
  return <Tag className={className}>{parts.map((part, index) => {
    const child = isValidElement(part) ? cloneElement(part) : part;
    return <span className="mr-[.24em] inline-block overflow-hidden align-bottom" key={`${index}-${typeof part === "string" ? part : "node"}`}>
      <motion.span
        className="inline-block"
        initial={{ y: "110%" }}
        animate={immediate || fallback ? { y: 0 } : undefined}
        whileInView={immediate ? undefined : { y: 0 }}
        transition={{ duration: 0.9, delay: delay + index * stagger, ease: [0.22, 1, 0.36, 1] }}
        viewport={{ once: true }}
      >
        {child}
      </motion.span>
    </span>;
  })}</Tag>;
}
