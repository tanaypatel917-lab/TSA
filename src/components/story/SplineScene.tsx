"use client";

import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";

import { cn } from "@/lib/utils";

const Spline = dynamic(() => import("@splinetool/react-spline"), { ssr: false });

export function SplineScene({
  scene,
  onLoad,
  className = "",
}: {
  scene: string;
  onLoad?: (app: Application) => void;
  className?: string;
}) {
  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      <Spline
        scene={scene}
        onLoad={onLoad}
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
