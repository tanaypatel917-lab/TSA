"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

const GRID = 40;

function sample(mark: string, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = GRID * 2;
  canvas.height = GRID;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = "#000";
  context.font = `650 ${GRID * 0.95}px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(mark, GRID, GRID * 0.55);
  const { data } = context.getImageData(0, 0, GRID * 2, GRID);
  const cells: [number, number][] = [];
  for (let y = 0; y < GRID; y += 1) for (let x = 0; x < GRID * 2; x += 1) if (data[(y * GRID * 2 + x) * 4 + 3] > 120) cells.push([x - GRID, GRID / 2 - y]);
  return cells;
}

export function VoxelGlyph({ mark }: { mark: string }) {
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
      const cells = sample(mark, font);
      const color = getComputedStyle(text).color;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
      camera.position.set(0, 0, 100);
      scene.add(new THREE.HemisphereLight("#ffffff", "#1C2A43", 2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.6);
      sun.position.set(-30, 40, 60);
      scene.add(sun);
      const group = new THREE.Group();
      scene.add(group);
      const geometry = new THREE.BoxGeometry(0.86, 0.86, 4);
      const material = new THREE.MeshStandardMaterial({ color, roughness: 0.45, flatShading: true });
      const mesh = new THREE.InstancedMesh(geometry, material, cells.length);
      group.add(mesh);
      const shadow = new THREE.InstancedMesh(geometry, new THREE.MeshBasicMaterial({ color: "#1C2A43" }), cells.length);
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

      const hero = element.closest(".chapter-hero") ?? element;
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
        geometry.dispose();
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

  return <span className="voxel-glyph" data-on={on} aria-hidden="true"><span ref={glyph} className="chapter-glyph">{mark}</span><span ref={host} className="voxel-glyph-stage" /></span>;
}
