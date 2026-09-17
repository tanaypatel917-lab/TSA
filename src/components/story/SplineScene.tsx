"use client";

import dynamic from "next/dynamic";
import type { Application } from "@splinetool/runtime";

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
    <div className={className}>
      <Spline scene={scene} onLoad={onLoad} />
    </div>
  );
}
