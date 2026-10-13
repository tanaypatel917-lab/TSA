"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const PAPER = "#F6EFE5";
const CLAY = "#DD8962";
const TONES = {
  dim: { top: PAPER, front: "#EADFCC", side: "#C9B79F", text: INK, outline: true },
  lit: { top: "#AFCBE3", front: "#5F86BA", side: "#41658F", text: PAPER, outline: false },
  now: { top: "#3A4A66", front: INK, side: "#0F1726", text: CLAY, outline: false },
};
type Tone = typeof TONES.dim;
const WIDTH = 2.3, DEPTH = 2.2, BASE = 1, RISE = 0.55, PX = 256, HULL = 0.09;

export function LevelStairs({ levels }: { levels: readonly string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const element = host.current;
    if (!element || reduced || !window.matchMedia("(min-width: 900px)").matches) { setOn(false); return; }
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import("three"), document.fonts.ready]).then(([THREE]) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
      camera.position.set(4.5, 5, 16);
      camera.lookAt(0, 1.7, 0);

      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };
      const css = getComputedStyle(document.body);
      const font = css.getPropertyValue("--font-display").trim() || "sans-serif";
      const flat = (color: string) => keep(new THREE.MeshBasicMaterial({ color }));
      const fit = (context: CanvasRenderingContext2D, text: string, weight: string, size: number, family: string, room: number) => {
        let px = size;
        do { context.font = `${weight} ${px}px ${family}`; px -= 2; } while (context.measureText(text).width > room && px > 10);
      };
      const face = (index: number, name: string, height: number, tone: Tone) => {
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH * PX; canvas.height = Math.round(height * PX);
        const context = canvas.getContext("2d")!;
        const pad = 0.17 * PX, room = canvas.width - pad * 2;
        context.fillStyle = tone.front; context.fillRect(0, 0, canvas.width, canvas.height);
        context.textBaseline = "top";
        context.lineJoin = "round";
        context.font = `800 ${Math.round(0.62 * PX)}px ${font}`;
        const numeral = String(index + 1).padStart(2, "0");
        if (tone.outline) { context.lineWidth = 8; context.strokeStyle = tone.text; context.strokeText(numeral, pad, pad * 0.6); }
        else { context.fillStyle = tone.text; context.fillText(numeral, pad, pad * 0.6); }
        fit(context, name, "750", Math.round(0.22 * PX), font, room);
        context.fillStyle = tone === TONES.now ? PAPER : tone.text;
        context.textBaseline = "alphabetic";
        context.fillText(name, pad, canvas.height - pad * 0.75);
        const texture = keep(new THREE.CanvasTexture(canvas));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 8;
        return keep(new THREE.MeshBasicMaterial({ map: texture }));
      };
      const skin = (index: number, name: string, height: number, tone: Tone) => {
        const side = flat(tone.side);
        return [side, side, flat(tone.top), side, face(index, name, height, tone), side];
      };
      const ink = flat(INK);
      const hull = keep(new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide }));
      const edge = keep(new THREE.LineBasicMaterial({ color: INK }));

      const stairs = new THREE.Group();
      scene.add(stairs);
      const offset = (levels.length - 1) / 2;
      const steps = levels.map((name, index) => {
        const height = BASE + RISE * index;
        const geometry = keep(new THREE.BoxGeometry(WIDTH, height, DEPTH));
        const skins = { dim: skin(index, name, height, TONES.dim), lit: skin(index, name, height, TONES.lit), now: skin(index, name, height, TONES.now) };
        const mesh = new THREE.Mesh(geometry, skins.dim);
        mesh.add(new THREE.LineSegments(keep(new THREE.EdgesGeometry(geometry)), edge));
        mesh.add(new THREE.Mesh(keep(new THREE.BoxGeometry(WIDTH + HULL, height + HULL, DEPTH + HULL)), hull));
        const x = (index - offset) * WIDTH;
        mesh.position.set(x, height / 2, 0);
        const shadow = new THREE.Mesh(geometry, ink);
        shadow.position.set(x + 0.42, height / 2 - 0.42, -0.7);
        stairs.add(shadow, mesh);
        return { mesh, skins, x, height, state: "dim" as keyof typeof TONES };
      });

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 512;

      const context = canvas.getContext("2d")!;
      context.scale(2, 2);
      context.font = `800 220px ${font}`;
      context.textAlign = "center"; context.textBaseline = "middle";
      context.lineJoin = "round";
      context.lineWidth = 22; context.strokeStyle = PAPER;
      context.strokeText("?", 124, 136);
      context.fillStyle = INK;
      context.fillText("?", 136, 148);
      context.fillStyle = CLAY;
      context.fillText("?", 124, 136);
      context.lineWidth = 6; context.strokeStyle = INK;
      context.strokeText("?", 124, 136);
      const hopperTexture = keep(new THREE.CanvasTexture(canvas));
      hopperTexture.colorSpace = THREE.SRGBColorSpace;
      const hopper = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: hopperTexture, depthTest: false })));
      hopper.renderOrder = 3;
      stairs.add(hopper);
      const blot = new THREE.Mesh(keep(new THREE.CircleGeometry(0.42, 32)), keep(new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.35, depthWrite: false })));
      blot.rotation.x = -Math.PI / 2;
      blot.renderOrder = 2;
      stairs.add(blot);

      const size = () => {
        const box = element.getBoundingClientRect();
        renderer.setSize(box.width, box.height, false);
        const aspect = box.width / Math.max(1, box.height);
        const half = Math.max(2.9, 6.9 / aspect);
        camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);
      let tilt = 0, visible = true;
      const move = (event: PointerEvent) => { const box = element.getBoundingClientRect(); tilt = ((event.clientX - box.left) / box.width) * 2 - 1; };
      const leave = () => { tilt = 0; };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerleave", leave);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const HOP = 0.7, REST = 1.8;
      const cycle = levels.length * HOP + REST;
      const started = performance.now();
      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) return;
        const time = Math.max(0, (now - started) / 1000) % cycle;
        const climb = Math.min(levels.length - 1, time / HOP);
        const from = Math.floor(climb), to = Math.min(levels.length - 1, from + 1), part = climb - from;
        const a = steps[from], b = steps[to];
        hopper.position.set(a.x + (b.x - a.x) * part, a.height + (b.height - a.height) * part + Math.sin(part * Math.PI) * 1.1 + 0.85, 0);
        const under = part < 0.5 ? a : b, lift = hopper.position.y - under.height;
        blot.position.set(hopper.position.x, under.height + 0.02, 0);
        blot.scale.setScalar(Math.max(0.35, 1.25 - lift * 0.35));
        const squash = from === levels.length - 1 ? 1 : 1 - Math.sin(part * Math.PI * 2) * 0.08;
        hopper.scale.set(1.8 / squash, 1.8 * squash, 1);
        const current = Math.round(climb);
        steps.forEach((step, index) => {
          const state = index === current ? "now" : index < current ? "lit" : "dim";
          if (state !== step.state) { step.mesh.material = step.skins[state]; step.state = state; }
          step.mesh.position.y = step.height / 2 + (index === current ? -0.05 : 0);
        });
        stairs.rotation.y += (tilt * 0.12 - stairs.rotation.y) * 0.06;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [reduced, levels]);

  return <div ref={host} className="stairs3d" data-on={on} aria-hidden="true" />;
}
