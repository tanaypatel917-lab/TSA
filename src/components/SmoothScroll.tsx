"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useMotionPreference } from "./MotionPreferences";
import "lenis/dist/lenis.css";

let activeLenis: Lenis | null = null;

export function scrollToElement(element: HTMLElement) {
  if (activeLenis) {
    activeLenis.scrollTo(element, { offset: -window.innerHeight / 2 + element.offsetHeight / 2 });
    return;
  }
  element.scrollIntoView({
    behavior: document.documentElement.dataset.motion === "full" ? "smooth" : "auto",
    block: "center"
  });
}

export function SmoothScroll() {
  const { reduced } = useMotionPreference();
  const pathname = usePathname();
  const [finePointer, setFinePointer] = useState(false);

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    const update = () => setFinePointer(pointer.matches);
    update();
    pointer.addEventListener("change", update);
    return () => pointer.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reduced || !finePointer || pathname.startsWith("/intro") || pathname.startsWith("/play")) return;

    const lenis = new Lenis({
      lerp: 0.1,
      anchors: true,
      autoRaf: true,
      prevent: (node) => !!node.closest('[role="dialog"], [data-lenis-prevent], .term-card')
    });
    activeLenis = lenis;
    lenis.on("scroll", () => {
      const velocity = Math.max(-1, Math.min(1, lenis.velocity / 40));
      document.documentElement.style.setProperty("--scroll-velocity", String(Math.round(velocity * 1000) / 1000));
    });
    if (!window.location.hash) lenis.scrollTo(0, { immediate: true });

    return () => {
      lenis.destroy();
      if (activeLenis === lenis) activeLenis = null;
      document.documentElement.style.setProperty("--scroll-velocity", "0");
    };
  }, [finePointer, pathname, reduced]);

  return null;
}
