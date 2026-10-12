"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";

type Props = { chapters: { done: boolean }[][] };

const COLORS = ["#DD8962", "#AFCBE3", "#F6EFE5", "#5F86BA", "#DD8962"];
const INK = "#1C2A43";

export function ProgressTower({ chapters }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const { reduced } = useMotionPreference();
  const key = chapters.map((steps) => steps.map((step) => (step.done ? 1 : 0)).join("")).join("|");

  useEffect(() => {
    const element = host.current;
    if (!element || reduced || !window.matchMedia("(min-width: 900px)").matches) { setOn(false); return; }
    let disposed = false;
    let cleanup = () => {};
    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 5.5, 20);
      camera.lookAt(0, 0.2, 0);
      scene.add(new THREE.HemisphereLight("#ffffff", "#5F86BA", 2.2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.4);
      sun.position.set(4, 8, 6);
      scene.add(sun);

      const tower = new THREE.Group();
      scene.add(tower);
      const box = new THREE.BoxGeometry(1, 0.62, 1);
      const edges = new THREE.EdgesGeometry(box);
      const line = new THREE.LineBasicMaterial({ color: INK });
      const ghostLine = new THREE.LineBasicMaterial({ color: "#F6EFE5", transparent: true, opacity: 0.3 });
      const ghost = new THREE.MeshStandardMaterial({ color: "#33466A", roughness: 0.8, flatShading: true });
      const blocks: { mesh: InstanceType<typeof THREE.Object3D>; target: number; delay: number }[] = [];
      const radius = 2.1;
      chapters.forEach((steps, column) => {
        const angle = (column / chapters.length) * Math.PI * 2;
        const material = new THREE.MeshStandardMaterial({ color: COLORS[column % COLORS.length], roughness: 0.55, flatShading: true });
        steps.forEach((step, row) => {
          const group = new THREE.Group();
          if (step.done) {
            group.add(new THREE.Mesh(box, material));
            group.add(new THREE.LineSegments(edges, line));
          } else {
            group.add(new THREE.Mesh(box, ghost));
            group.add(new THREE.LineSegments(edges, ghostLine));
          }
          const target = row * 0.66 - 2.4;
          group.position.set(Math.sin(angle) * radius, target + 6, Math.cos(angle) * radius);
          group.rotation.y = angle;
          tower.add(group);
          blocks.push({ mesh: group, target, delay: column * 0.08 + row * 0.06 });
        });
      });
      const plinth = new THREE.CylinderGeometry(3.5, 3.7, 0.3, 40);
      const base = new THREE.Mesh(plinth, new THREE.MeshStandardMaterial({ color: "#2B3D5E", roughness: 0.7, flatShading: true }));
      base.position.y = -2.9;
      base.add(new THREE.LineSegments(new THREE.EdgesGeometry(plinth, 30), new THREE.LineBasicMaterial({ color: "#AFCBE3" })));
      tower.add(base);
      const coreGeometry = new THREE.CylinderGeometry(0.32, 0.32, 4.6, 6);
      const core = new THREE.Mesh(coreGeometry, new THREE.MeshStandardMaterial({ color: "#DD8962", roughness: 0.5, flatShading: true }));
      core.position.y = -0.5;
      core.add(new THREE.LineSegments(new THREE.EdgesGeometry(coreGeometry), line));
      tower.add(core);

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      let pointerX = 0, pointerY = 0, drag = 0, dragging = false, lastX = 0, spin = 0, visible = true;
      const move = (event: PointerEvent) => {
        const rect = element.getBoundingClientRect();
        pointerX = (event.clientX - rect.left) / rect.width - 0.5;
        pointerY = (event.clientY - rect.top) / rect.height - 0.5;
        if (dragging) { spin += (event.clientX - lastX) * 0.004; drag = (event.clientX - lastX) * 0.004; lastX = event.clientX; }
      };
      const down = (event: PointerEvent) => { dragging = true; lastX = event.clientX; element.setPointerCapture(event.pointerId); };
      const up = () => { dragging = false; };
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointerup", up);
      element.addEventListener("pointercancel", up);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const started = performance.now();
      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) return;
        const time = (now - started) / 1000;
        if (!dragging) { drag *= 0.94; spin += 0.0035 + drag; }
        tower.rotation.y = spin + pointerX * 0.5;
        tower.rotation.x = 0.12 + pointerY * 0.25;
        for (const block of blocks) {
          const t = Math.min(1, Math.max(0, (time - block.delay) / 0.7));
          const ease = 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
          block.mesh.position.y = block.target + 6 * (1 - ease) + Math.sin(time * 1.4 + block.delay * 9) * 0.03;
        }
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerdown", down);
        element.removeEventListener("pointerup", up);
        element.removeEventListener("pointercancel", up);
        scene.traverse((object) => {
          const mesh = object as { geometry?: { dispose: () => void }; material?: { dispose: () => void } };
          mesh.geometry?.dispose();
          mesh.material?.dispose();
        });
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [key, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={host} className="tower3d" data-on={on} aria-hidden="true" />;
}
