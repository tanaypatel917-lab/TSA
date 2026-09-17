"use client";

import { useRouter } from "next/navigation";
import PowerOffSlide from "@/components/smoothui/power-off-slide";

export function FindNorthSlide() {
  const router = useRouter();
  return <PowerOffSlide label="Slide to find north" onPowerOff={() => router.push("/dashboard")} />;
}
