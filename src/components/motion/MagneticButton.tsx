"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef } from "react";

type MagneticButtonProps = {
  href?: string;
  as?: "a" | "button";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const MotionLink = motion.create(Link);

export function MagneticButton({ href, as = "a", children, onClick, type, className = "" }: MagneticButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 320, damping: 18 });
  const y = useSpring(useMotionValue(0), { stiffness: 320, damping: 18 });
  function move(event: React.MouseEvent<HTMLElement>) {
    const bounds = (as === "button" ? buttonRef.current : anchorRef.current)?.getBoundingClientRect();
    if (!bounds) return;
    x.set((event.clientX - (bounds.left + bounds.width / 2)) * 0.15);
    y.set((event.clientY - (bounds.top + bounds.height / 2)) * 0.15);
  }
  const common = { className: `btn-pill group w-full sm:w-auto ${className}`, style: { x, y }, onMouseMove: move, onMouseLeave: () => { x.set(0); y.set(0); }, onClick, "data-cursor": "hover" as const };
  if (as === "button") return <motion.button {...common} ref={buttonRef} type={type}>{children}<span className="ml-3 inline-block transition-transform group-hover:translate-x-1">↗</span></motion.button>;
  return <MotionLink {...common} ref={anchorRef} href={href ?? "/"}>{children}<span className="ml-3 inline-block transition-transform group-hover:translate-x-1">↗</span></MotionLink>;
}
