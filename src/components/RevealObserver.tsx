"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMotionPreference } from "./MotionPreferences";

const easing = "cubic-bezier(.23, 1, .32, 1)";

export function RevealObserver() {
  const { reduced } = useMotionPreference();
  const path = usePathname();
  useEffect(() => {
    if (reduced || !("IntersectionObserver" in window) || typeof Element.prototype.animate !== "function") return;
    const armed = new Map<Element, Animation[]>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        armed.get(entry.target)?.forEach((animation) => animation.play());
        armed.delete(entry.target);
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px" });
    const scan = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-revealed])").forEach((element) => {
      element.dataset.revealed = "true";
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) return;
      const delay = Math.min(Number(element.dataset.reveal) || 0, 8) * 70;
      const animations = [
        element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 560, delay, easing, fill: "backwards" }),
        element.animate([{ transform: "translateY(28px)" }, { transform: "translateY(0)" }], { duration: 720, delay, easing, fill: "backwards", composite: "add" })
      ];
      animations.forEach((animation) => { animation.pause(); animation.onfinish = () => animation.cancel(); });
      armed.set(element, animations);
      observer.observe(element);
    });
    scan();
    const mutations = new MutationObserver(scan);
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      mutations.disconnect();
      observer.disconnect();
      armed.forEach((animations) => animations.forEach((animation) => animation.cancel()));
    };
  }, [reduced, path]);
  return null;
}
