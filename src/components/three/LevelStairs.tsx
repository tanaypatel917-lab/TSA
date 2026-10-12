"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const PAPER = "#F6EFE5";
const TONES = {
  dim: { top: PAPER, front: "#E8DCCB", side: "#C9B9A4", text: INK },
  lit: { top: "#AFCBE3", front: "#5F86BA", side: "#41658F", text: PAPER },
  now: { top: "#3A4A66", front: INK, side: "#0F1726", text: PAPER },
};
const WIDTH = 2.3, DEPTH = 2.4, RISE = 0.8, PX = 256;

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
      camera.position.set(7, 8.5, 16);
      camera.lookAt(0, 1.5, 0);

      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };
      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const flat = (color: string) => keep(new THREE.MeshBasicMaterial({ color }));
      const face = (text: string, height: number, tone: typeof TONES.dim) => {
        const canvas = document.createElement("canvas");
        canvas.width = WIDTH * PX; canvas.height = Math.round(height * PX);
        const context = canvas.getContext("2d")!;
        context.fillStyle = tone.front; context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = tone.text;
        context.font = `650 ${Math.round(0.34 * PX)}px ${font}`;
        context.textBaseline = "top";
        context.fillText(text, 0.16 * PX, 0.17 * PX, canvas.width - 0.3 * PX);
        const texture = keep(new THREE.CanvasTexture(canvas));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        return keep(new THREE.MeshBasicMaterial({ map: texture }));
      };
      const skin = (text: string, height: number, tone: typeof TONES.dim) => {
        const side = flat(tone.side);
        return [side, side, flat(tone.top), side, face(text, height, tone), side];
      };
      const edge = keep(new THREE.LineBasicMaterial({ color: INK }));

      const stairs = new THREE.Group();
      scene.add(stairs);
      const offset = (levels.length - 1) / 2;
      const steps = levels.map((name, index) => {
        const height = RISE * (index + 1);
        const geometry = keep(new THREE.BoxGeometry(WIDTH, height, DEPTH));
        const skins = { dim: skin(name, height, TONES.dim), lit: skin(name, height, TONES.lit), now: skin(name, height, TONES.now) };
        const mesh = new THREE.Mesh(geometry, skins.dim);
        mesh.add(new THREE.LineSegments(keep(new THREE.EdgesGeometry(geometry)), edge));
        const x = (index - offset) * WIDTH;
        mesh.position.set(x, height / 2, 0);
        stairs.add(mesh);
        return { mesh, skins, x, height, state: "dim" as keyof typeof TONES };
      });
      const base = new THREE.Mesh(keep(new THREE.BoxGeometry(WIDTH * levels.length + 0.5, 0.22, DEPTH + 0.5)), skin("", 0.22, TONES.now));
      base.position.y = -0.11;
      stairs.add(base);

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 256;
      const context = canvas.getContext("2d")!;
      context.font = `700 220px ${font}`;
      context.textAlign = "center"; context.textBaseline = "middle";
      context.lineJoin = "round";
      context.lineWidth = 22; context.strokeStyle = PAPER;
      context.strokeText("?", 128, 140);
      context.fillStyle = "#DD8962";
      context.fillText("?", 134, 146);
      context.fillStyle = INK;
      context.fillText("?", 128, 140);
      const hopperTexture = keep(new THREE.CanvasTexture(canvas));
      hopperTexture.colorSpace = THREE.SRGBColorSpace;
      const hopper = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: hopperTexture, depthTest: false })));
      hopper.renderOrder = 2;
      stairs.add(hopper);

      const size = () => {
        const box = element.getBoundingClientRect();
        renderer.setSize(box.width, box.height, false);
        const aspect = box.width / Math.max(1, box.height);
        const half = Math.max(3.4, 7.6 / aspect);
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
        const squash = from === levels.length - 1 ? 1 : 1 - Math.sin(part * Math.PI * 2) * 0.08;
        hopper.scale.set(1.5 / squash, 1.5 * squash, 1);
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
