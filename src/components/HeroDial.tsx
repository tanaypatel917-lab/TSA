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
      <svg viewBox="0 0 500 500" fill="none" className="h-full w-full overflow-visible">
        <defs>
          <radialGradient id="dial-face" cx="50%" cy="42%" r="60%">
            <stop offset="0" stopColor="#f4f2ec" />
            <stop offset=".7" stopColor="#e9e7e1" />
            <stop offset="1" stopColor="#d9d6cd" />
          </radialGradient>
          <radialGradient id="dial-hub" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="#3a3a3a" />
            <stop offset="1" stopColor="#0b0b0b" />
          </radialGradient>
          <linearGradient id="needle-n" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff4f1f" />
            <stop offset="1" stopColor="#b02a08" />
          </linearGradient>
          <filter id="dial-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#0b0b0b" floodOpacity=".22" />
          </filter>
          <filter id="needle-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0b0b0b" floodOpacity=".35" />
          </filter>
        </defs>

        {/* face */}
        <circle cx="250" cy="250" r="236" fill="url(#dial-face)" stroke="currentColor" strokeOpacity=".9" strokeWidth="1.5" filter="url(#dial-shadow)" />
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
          return <text key={d} x={x} y={y + 3} textAnchor="middle" fill="currentColor" fillOpacity=".6" fontFamily="JetBrains Mono Variable, monospace" fontSize="9" letterSpacing="1">{String(d).padStart(3, "0")}</text>;
        })}
        {CARDINALS.map(([c, d]) => {
          const [x, y] = polar(176, d);
          return <text key={c} x={x} y={y + 9} textAnchor="middle" fill={c === "N" ? "#b02a08" : "currentColor"} fontFamily="Instrument Serif, serif" fontStyle="italic" fontSize="30">{c}</text>;
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
        <motion.g style={{ rotate: needle, transformOrigin: "250px 250px" }} filter="url(#needle-shadow)">
          <path d="m250 62 14 188h-28L250 62Z" fill="url(#needle-n)" />
          <path d="m250 438 14-188h-28L250 438Z" fill="#141414" />
          <path d="m62 250 188-9v18L62 250Z" fill="#c8f560" fillOpacity=".9" />
          <path d="m438 250-188-9v18L438 250Z" fill="#c8f560" fillOpacity=".5" />
        </motion.g>

        {/* hub */}
        <circle cx="250" cy="250" r="18" fill="url(#dial-hub)" />
        <circle cx="250" cy="250" r="18" stroke="#e9e7e1" strokeOpacity=".5" strokeWidth="1" />
        <circle cx="245" cy="245" r="4" fill="#e9e7e1" fillOpacity=".7" />

        {/* glass highlight */}
        <path d="M60 210a190 190 0 0 1 300-110" stroke="#fff" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="absolute bottom-[17%] left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[.3em] text-ink/70">
        Stay curious
      </span>
    </motion.div>
  );
}
