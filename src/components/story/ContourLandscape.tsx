"use client";

import { cn } from "@/lib/utils";

function sineSum(point: number, layer: number, depth: number) {
  return (
    Math.sin(point * 0.7 + layer * 0.45) * (10 + depth * 18) +
    Math.sin(point * 0.21 + layer) * (7 + depth * 10)
  );
}

const contourPaths = Array.from({ length: 14 }, (_, index) => {
  const depth = index / 13;
  const y = 80 + index * 58;
  const points = Array.from({ length: 21 }, (_, point) => {
    const x = point * 80;
    return `${x},${y + sineSum(point, index, depth)}`;
  });
  return {
    depth,
    d: `M ${points.join(" L ")}`,
    opacity: 0.15 + depth * 0.75,
  };
});

export function ContourLandscape({ className = "" }: { className?: string }) {
  return (
    <div
      className={cn("h-full w-full overflow-hidden", className)}
      style={{ perspective: 1200 }}
    >
      <div className="contour-stage h-full w-full">
        <svg
          aria-hidden="true"
          className="h-full w-full"
          viewBox="0 0 1600 900"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <filter id="needle-glow">
              <feGaussianBlur stdDeviation="12" />
            </filter>
          </defs>
          {contourPaths.map((path) => (
            <path
              key={path.depth}
              d={path.d}
              data-depth={path.depth}
              fill="none"
              opacity={path.opacity}
              stroke="#e9e7e1"
              strokeWidth="1"
            />
          ))}
          <circle
            className="contour-needle-glow"
            cx="1100"
            cy="420"
            r="20"
            fill="none"
            filter="url(#needle-glow)"
            opacity=".9"
            stroke="#c8f560"
            strokeWidth="3"
          />
          <circle
            className="contour-needle"
            cx="1100"
            cy="420"
            r="7"
            fill="#ff4f1f"
          />
        </svg>
      </div>
    </div>
  );
}
