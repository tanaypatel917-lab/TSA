"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { Children, cloneElement, isValidElement, useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

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
  useEffect(() => setMounted(true), []);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const parts = units(children);
  if (!mounted || reduced) return <Tag ref={ref} className={className}>{parts.map((part, index) => <span className="ml-[-.08em] mr-[.16em] inline-block overflow-hidden align-bottom px-[.08em] pb-[.15em] -mb-[.15em]" key={`${index}-${typeof part === "string" ? part : "node"}`}>{isValidElement(part) ? cloneElement(part) : part}</span>)}</Tag>;
  return <Tag ref={ref} className={className}>{parts.map((part, index) => {
    const child = isValidElement(part) ? cloneElement(part) : part;
    return <span className="ml-[-.08em] mr-[.16em] inline-block overflow-hidden align-bottom px-[.08em] pb-[.15em] -mb-[.15em]" key={`${index}-${typeof part === "string" ? part : "node"}`}>
      <motion.span
        className="inline-block"
        initial={{ y: "130%" }}
        animate={immediate || inView ? { y: 0 } : { y: "130%" }}
        transition={{ duration: 0.9, delay: delay + index * stagger, ease: [0.22, 1, 0.36, 1] }}
      >
        {child}
      </motion.span>
    </span>;
  })}</Tag>;
}
