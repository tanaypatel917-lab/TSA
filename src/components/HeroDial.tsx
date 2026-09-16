"use client";

import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

const TICKS = Array.from({ length: 72 }, (_, i) => i * 5);
const DEGREES = Array.from({ length: 12 }, (_, i) => i * 30);
const CARDINALS: Array<[string, number]> = [["N", 0], ["E", 90], ["S", 180], ["W", 270]];

function polar(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [250 + r * Math.cos(a), 250 + r * Math.sin(a)];
}

export function HeroDial() {
  const reduced = useReducedMotion();
  const spring = { stiffness: 160, damping: 22 };
  const rotateX = useSpring(useMotionValue(0), spring);
  const rotateY = useSpring(useMotionValue(0), spring);
  const needle = useSpring(useMotionValue(0), { stiffness: 60, damping: 14 });

  function move(event: React.MouseEvent<HTMLDivElement>) {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    const b = event.currentTarget.getBoundingClientRect();
    const dx = (event.clientX - b.left) / b.width - 0.5;
    const dy = (event.clientY - b.top) / b.height - 0.5;
    rotateX.set(dy * -14);
    rotateY.set(dx * 14);
    needle.set((Math.atan2(dy, dx) * 180) / Math.PI + 90);
  }
  function leave() {
    rotateX.set(0);
    rotateY.set(0);
    needle.set(0);
  }

  return (
    <motion.div
      onMouseMove={move}
      onMouseLeave={leave}
      style={{ rotateX, rotateY, transformPerspective: 900 }}
      className="relative aspect-square w-full max-w-[520px] text-ink"
      aria-hidden="true"
    >
      <svg viewBox="0 0 500 500" fill="none" className="h-full w-full">
        {/* face */}
        <circle cx="250" cy="250" r="236" className="fill-paper" stroke="currentColor" strokeWidth="2" />
        <circle cx="250" cy="250" r="222" stroke="currentColor" strokeOpacity=".35" strokeWidth="1" />
        <circle cx="250" cy="250" r="150" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" />

        {/* static bezel: ticks + cardinals + degrees */}
        {TICKS.map((d) => {
          const major = d % 30 === 0;
          const [x1, y1] = polar(major ? 196 : 206, d);
          const [x2, y2] = polar(216, d);
          return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeOpacity={major ? 1 : .45} strokeWidth={major ? 1.5 : 1} />;
        })}
        {DEGREES.filter((d) => d % 90 !== 0).map((d) => {
          const [x, y] = polar(182, d);
          return <text key={d} x={x} y={y + 3} textAnchor="middle" fill="currentColor" fillOpacity=".6" className="font-mono" fontSize="9" letterSpacing="1">{String(d).padStart(3, "0")}</text>;
        })}
        {CARDINALS.map(([c, d]) => {
          const [x, y] = polar(176, d);
          return <text key={c} x={x} y={y + 9} textAnchor="middle" fill={c === "N" ? "#b02a08" : "currentColor"} className="font-display" fontStyle="italic" fontSize="30">{c}</text>;
        })}

        {/* slow rotating inner ring */}
        <g className="compass-dial" style={{ transformOrigin: "250px 250px" }}>
          <circle cx="250" cy="250" r="132" stroke="currentColor" strokeOpacity=".7" strokeWidth="1" strokeDasharray="1 6" />
          <circle cx="250" cy="250" r="122" stroke="#b02a08" strokeWidth="2" strokeDasharray="60 706" strokeLinecap="round" />
          <circle cx="250" cy="250" r="122" stroke="#c8f560" strokeWidth="2" strokeDasharray="24 742" strokeDashoffset="-383" strokeLinecap="round" />
        </g>

        {/* crosshair */}
        <path d="M250 118v264M118 250h264" stroke="currentColor" strokeOpacity=".25" strokeWidth="1" />
        <circle cx="250" cy="250" r="96" stroke="currentColor" strokeOpacity=".5" strokeWidth="1" />

        {/* needle */}
        <motion.g style={{ rotate: needle, transformOrigin: "250px 250px" }}>
          <path d="m250 62 14 188h-28L250 62Z" fill="#b02a08" />
          <path d="m250 438 14-188h-28L250 438Z" fill="#141414" />
          <path d="m62 250 188-9v18L62 250Z" fill="#c8f560" fillOpacity=".9" />
          <path d="m438 250-188-9v18L438 250Z" fill="#c8f560" fillOpacity=".5" />
        </motion.g>

        {/* hub */}
        <circle cx="250" cy="250" r="18" fill="#0b0b0b" />
        <circle cx="250" cy="250" r="6" className="fill-paper" />
      </svg>
      <span className="absolute bottom-[20%] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[.3em] text-ink/70">
        Stay curious
      </span>
    </motion.div>
  );
}
