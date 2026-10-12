"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

const GRID = 40;

const TURNS: Record<string, number> = { "✎": Math.PI / 4 };

type Cell = [number, number, string?];

const PENCIL = { body: "#DD8962", shine: "#EAA585", wood: "#EBD9C0", lead: "#1C2A43", ferrule: "#F6EFE5", eraser: "#B8694A" };

function pencil() {
  const canvas = document.createElement("canvas");
  canvas.width = GRID * 2;
  canvas.height = GRID;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  const tri = (fill: string, points: number[]) => {
    context.fillStyle = fill;
    context.beginPath();
    context.moveTo(points[0], points[1]);
    for (let i = 2; i < points.length; i += 2) context.lineTo(points[i], points[i + 1]);
    context.fill();
  };
  tri(PENCIL.wood, [26, 15, 12, 20, 26, 25]);
  tri(PENCIL.lead, [17.5, 17.4, 11, 20, 17.5, 22.6]);
  context.fillStyle = PENCIL.body; context.fillRect(26, 15, 30, 10);
  context.fillStyle = PENCIL.shine; context.fillRect(26, 15, 30, 3);
  context.fillStyle = PENCIL.ferrule; context.fillRect(56, 15, 5, 10);
  context.fillStyle = PENCIL.eraser; context.fillRect(61, 15, 6, 10);
  const palette = Object.values(PENCIL).map((hex) => [hex, parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)] as const);
  const { data } = context.getImageData(0, 0, GRID * 2, GRID);
  const cells: Cell[] = [];
  for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID * 2; x += 1) {
    const at = (y * GRID * 2 + x) * 4;
    if (data[at + 3] <= 120) continue;
    const [r, g, b] = [data[at], data[at + 1], data[at + 2]].map((v) => v * 255 / data[at + 3]);
    const tint = palette.filter((c) => (x < 26 ? c[0] === PENCIL.lead || c[0] === PENCIL.wood : c[0] !== PENCIL.eraser || x >= 50)).reduce((best, c) => ((c[1] - r) ** 2 + (c[2] - g) ** 2 + (c[3] - b) ** 2 < best[0] ? [(c[1] - r) ** 2 + (c[2] - g) ** 2 + (c[3] - b) ** 2, c[0]] as [number, string] : best), [Infinity, ""] as [number, string])[1];
    cells.push([x - GRID, GRID / 2 - y, tint]);
  }
  return cells;
}


function sample(mark: string, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = GRID * 2;
  canvas.height = GRID;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = "#000";
  context.font = `650 ${GRID * 0.95}px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.translate(GRID, GRID * 0.5);
  context.rotate(TURNS[mark] ?? 0);
  context.fillText(mark, 0, GRID * 0.05);
  const { data } = context.getImageData(0, 0, GRID * 2, GRID);
  const cells: Cell[] = [];
  for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID * 2; x += 1) if (data[(y * GRID * 2 + x) * 4 + 3] > 120) cells.push([x - GRID, GRID / 2 - y]);
  return cells;
}

export function VoxelGlyph({ mark, className = "" }: { mark: string; className?: string }) {
  const glyph = useRef<HTMLSpanElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const { reduced } = useMotionPreference();

  useEffect(() => {
    const element = host.current;
    const text = glyph.current;
    if (!element || !text || reduced || !window.matchMedia("(min-width: 900px)").matches) { setOn(false); return; }
    let disposed = false;
    let cleanup = () => {};
    Promise.all([import("three"), document.fonts.ready]).then(([THREE]) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      element.appendChild(renderer.domElement);
      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const cells = mark === "✎" ? pencil() : sample(mark, font);
      const color = getComputedStyle(text).color;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
      camera.position.set(0, 0, 100);
      scene.add(new THREE.HemisphereLight("#ffffff", "#1C2A43", 2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.6);
      sun.position.set(-30, 40, 60);
      scene.add(sun);
      const group = new THREE.Group();
      group.rotation.z = TURNS[mark] ?? 0;
      scene.add(group);
      const face = new THREE.PlaneGeometry(1.06, 1.06).translate(0, 0, 2);
      const material = new THREE.MeshLambertMaterial({ color });
      const mesh = new THREE.InstancedMesh(face, material, cells.length);
      if (cells[0]?.[2]) {
        material.color.set("#ffffff");
        cells.forEach((cell, index) => mesh.setColorAt(index, new THREE.Color(cell[2])));
        mesh.instanceColor!.needsUpdate = true;
      }
      group.add(mesh);
      const shadow = new THREE.InstancedMesh(face, new THREE.MeshBasicMaterial({ color: "#1C2A43" }), cells.length);
      shadow.position.set(1.4, -1.4, -2.5);
      group.add(shadow);
      const scatter = cells.map(() => [(Math.random() - 0.5) * 110, (Math.random() - 0.5) * 80, (Math.random() - 0.5) * 80 + 30, Math.random() * 0.6]);
      const push = new Float32Array(cells.length);
      const dummy = new THREE.Object3D();

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      const hero = element.closest(".chapter-hero, .lesson-opener, .page-hero, .not-found, .quiz-results, .about-principles li, .intro-gate-card") ?? element;
      const pointer = new THREE.Vector2(9, 9);
      const local = new THREE.Vector3();
      const ray = new THREE.Raycaster();
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      let tx = 0, ty = 0, visible = true;
      const move = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = element.getBoundingClientRect();
        pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        tx = Math.max(-1, Math.min(1, pointer.x)); ty = Math.max(-1, Math.min(1, pointer.y));
      };
      const leave = () => { pointer.set(9, 9); tx = ty = 0; };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const started = performance.now();
      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) return;
        const time = (now - started) / 1000;
        group.rotation.y += (tx * 0.55 + Math.sin(time * 0.5) * 0.12 - group.rotation.y) * 0.06;
        group.rotation.x += (-ty * 0.35 - group.rotation.x) * 0.06;
        group.updateMatrixWorld();
        let hit = false;
        if (pointer.x < 5) {
          ray.setFromCamera(pointer, camera);
          hit = !!ray.ray.intersectPlane(plane, local);
          if (hit) group.worldToLocal(local);
        }
        cells.forEach(([x, y], index) => {
          const [sx, sy, sz, delay] = scatter[index];
          const t = Math.min(1, Math.max(0, (time - delay - (x + GRID) * 0.004) / 1.1));
          const ease = 1 - (1 - t) ** 4;
          const near = hit ? Math.max(0, 1 - Math.hypot(local.x - x, local.y - y) / 10) : 0;
          push[index] += (near - push[index]) * 0.12;
          const lift = push[index] * 10;
          dummy.position.set(sx + (x - sx) * ease, sy + (y - sy) * ease, sz * (1 - ease) + lift);
          dummy.rotation.set((1 - ease) * sx * 0.05 + push[index] * 0.8, (1 - ease) * sy * 0.05, 0);
          dummy.scale.setScalar(1 - push[index] * 0.25);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          dummy.position.z = 0;
          dummy.updateMatrix();
          shadow.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        shadow.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        hero.removeEventListener("pointermove", move);
        hero.removeEventListener("pointerleave", leave);
        face.dispose();
        material.dispose();
        (shadow.material as InstanceType<typeof THREE.Material>).dispose();
        mesh.dispose();
        shadow.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [mark, reduced]);

  return <span className={`voxel-glyph ${className}`.trim()} data-on={on} aria-hidden="true"><span ref={glyph} className="chapter-glyph">{mark}</span><span ref={host} className="voxel-glyph-stage" /></span>;
}
