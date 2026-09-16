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
  useEffect(() => setMounted(true), []);
  const parts = units(children);
  return <Tag className={className}>{parts.map((part, index) => {
    const child = isValidElement(part) ? cloneElement(part) : part;
    return <span className="mr-[.24em] inline-block overflow-hidden align-bottom" key={`${index}-${typeof part === "string" ? part : "node"}`}>
      <motion.span
        className="inline-block"
        initial={mounted && !reduced ? { y: "110%" } : false}
        animate={{ y: 0 }}
        transition={reduced ? { duration: 0 } : { duration: 0.9, delay: delay + index * stagger, ease: [0.22, 1, 0.36, 1] }}
        whileInView={immediate ? undefined : { y: 0 }}
        viewport={{ once: true }}
      >
        {child}
      </motion.span>
    </span>;
  })}</Tag>;
}
