"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const PAPER = "#F6EFE5";
const LAKE = "#5F86BA";

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
      const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
      camera.position.set(0, 5.2, 15.5);
      camera.lookAt(0, 2.1, 0);
      scene.add(new THREE.HemisphereLight("#ffffff", LAKE, 1.6));
      const sun = new THREE.DirectionalLight("#ffffff", 2.4);
      sun.position.set(-6, 10, 8);
      scene.add(sun);

      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };
      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const label = (text: string, fill: string, ink: string) => {
        const canvas = document.createElement("canvas");
        canvas.width = 512; canvas.height = 256;
        const context = canvas.getContext("2d")!;
        context.fillStyle = fill; context.fillRect(0, 0, 512, 256);
        context.fillStyle = ink;
        context.font = `650 ${text.length > 9 ? 64 : 80}px ${font}`;
        context.textAlign = "center"; context.textBaseline = "middle";
        context.fillText(text, 256, 132);
        const texture = keep(new THREE.CanvasTexture(canvas));
        texture.colorSpace = THREE.SRGBColorSpace;
        return keep(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 }));
      };
      const side = keep(new THREE.MeshStandardMaterial({ color: INK, roughness: 0.7, flatShading: true }));
      const top = keep(new THREE.MeshStandardMaterial({ color: PAPER, roughness: 0.6 }));
      const lit = keep(new THREE.MeshStandardMaterial({ color: LAKE, roughness: 0.6 }));

      const stairs = new THREE.Group();
      scene.add(stairs);
      const width = 2.3, rise = 0.75;
      const steps = levels.map((name, index) => {
        const height = rise * (index + 1);
        const geometry = keep(new THREE.BoxGeometry(width, height, 2.2));
        const dim = label(name, PAPER, INK), glow = label(name, INK, PAPER);
        const mesh = new THREE.Mesh(geometry, [side, side, top, side, dim, side]);
        const x = (index - (levels.length - 1) / 2) * width;
        mesh.position.set(x, height / 2, 0);
        stairs.add(mesh);
        return { mesh, dim, glow, x, height };
      });

      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const context = canvas.getContext("2d")!;
      context.fillStyle = INK;
      context.font = `700 118px ${font}`;
      context.textAlign = "center"; context.textBaseline = "middle";
      context.fillText("?", 64, 70);
      const hopperTexture = keep(new THREE.CanvasTexture(canvas));
      hopperTexture.colorSpace = THREE.SRGBColorSpace;
      const hopper = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: hopperTexture })));
      hopper.scale.setScalar(1.6);
      hopper.material.depthTest = false;
      hopper.renderOrder = 2;
      stairs.add(hopper);

      const size = () => {
        const box = element.getBoundingClientRect();
        renderer.setSize(box.width, box.height, false);
        camera.aspect = box.width / Math.max(1, box.height);
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

      const HOP = 0.7, REST = 1.6;
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
        hopper.position.set(a.x + (b.x - a.x) * part, a.height + (b.height - a.height) * part + Math.sin(part * Math.PI) * 0.9 + 0.8, 0.2);
        const squash = from === levels.length - 1 ? 1 : 1 - Math.sin(part * Math.PI * 2) * 0.08;
        hopper.scale.set(1.6 / squash, 1.6 * squash, 1);
        steps.forEach((step, index) => {
          const reached = index <= climb + 0.5;
          (step.mesh.material as InstanceType<typeof THREE.Material>[])[2] = reached ? lit : top;
          (step.mesh.material as InstanceType<typeof THREE.Material>[])[4] = reached ? step.glow : step.dim;
          step.mesh.position.y = step.height / 2 + (index === Math.round(climb) ? -0.06 : 0);
        });
        stairs.rotation.y += (-0.12 + tilt * 0.3 - stairs.rotation.y) * 0.06;
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
