"use client";

import { useEffect, useRef, useState } from "react";
import { stations, trees, tufts, wordTokens, WORLD } from "@/content/world";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const PAPER = "#F6EFE5";
const LAKE = "#5F86BA";
const UNIT = 220;

export function IslandDiorama() {
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
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 200);
      camera.position.set(0, 24, 40);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight("#ffffff", LAKE, 1.5));
      const sun = new THREE.DirectionalLight("#ffffff", 2.6);
      sun.position.set(-8, 14, 10);
      scene.add(sun);

      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };
      const materials = new Map<string, InstanceType<typeof THREE.MeshStandardMaterial>>();
      const paint = (color: string) => {
        if (!materials.has(color)) materials.set(color, keep(new THREE.MeshStandardMaterial({ color, roughness: 0.6, flatShading: true })));
        return materials.get(color)!;
      };
      const island = new THREE.Group();
      scene.add(island);
      const add = (geometry: InstanceType<typeof THREE.BoxGeometry> | InstanceType<typeof THREE.CylinderGeometry> | InstanceType<typeof THREE.IcosahedronGeometry> | InstanceType<typeof THREE.OctahedronGeometry> | InstanceType<typeof THREE.ConeGeometry>, color: string, x: number, y: number, z: number) => {
        const mesh = new THREE.Mesh(keep(geometry), paint(color));
        mesh.position.set(x, y, z);
        island.add(mesh);
        return mesh;
      };

      const radius = WORLD.radius / UNIT;
      add(new THREE.CylinderGeometry(radius + 1, radius + 0.8, 0.3, 40), LAKE, 0, -1.1, 0);
      add(new THREE.CylinderGeometry(radius, radius - 0.6, 1.4, 28), CLAY, 0, -0.6, 0);
      add(new THREE.CylinderGeometry(radius - 0.6, radius - 1.6, 1.4, 28), INK, 0, -1.9, 0);
      add(new THREE.CylinderGeometry(radius + 0.05, radius + 0.05, 0.12, 28), "#E8DCCB", 0, 0.12, 0);

      for (const station of stations) {
        const x = station.x / UNIT, z = station.z / UNIT;
        add(new THREE.CylinderGeometry(1.05, 1.2, 0.6, 8), station.pedestal, x, 0.48, z);
        const top = 0.78;
        if (station.landmark === "stack") [0, 1, 2].forEach((level) => add(new THREE.BoxGeometry(1.2 - level * 0.3, 0.32, 1.2 - level * 0.3), level % 2 ? INK : station.accent, x, top + 0.16 + level * 0.34, z));
        if (station.landmark === "brackets") [-0.4, 0.4].forEach((offset) => add(new THREE.BoxGeometry(0.16, 1.4, 0.5), station.accent, x + offset, top + 0.7, z));
        if (station.landmark === "scale") { add(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 6), station.accent, x, top + 0.6, z); add(new THREE.BoxGeometry(1.6, 0.1, 0.2), station.accent, x, top + 1.2, z); }
        if (station.landmark === "globe") add(new THREE.IcosahedronGeometry(0.7, 1), station.accent, x, top + 0.7, z);
        if (station.landmark === "star") add(new THREE.OctahedronGeometry(0.75, 0), station.accent, x, top + 0.8, z);
      }
      const landmarks = island.children.slice(4);
      for (const tree of trees) {
        const height = tree.height / UNIT;
        add(new THREE.CylinderGeometry(0.08, 0.1, height * 0.4, 5), INK, tree.x / UNIT, 0.18 + height * 0.2, tree.z / UNIT);
        add(new THREE.ConeGeometry(0.45, height, 6), tree.color, tree.x / UNIT, 0.18 + height * 0.4 + height * 0.5, tree.z / UNIT);
      }
      for (const tuft of tufts) add(new THREE.IcosahedronGeometry(tuft.size / UNIT / 2.4, 0), tuft.color, tuft.x / UNIT, 0.22, tuft.z / UNIT);
      const words = wordTokens.map((token) => add(new THREE.BoxGeometry(0.34, 0.34, 0.34), token.color, token.x / UNIT, 0.7, token.z / UNIT));

      const car = new THREE.Group();
      const body = new THREE.Mesh(keep(new THREE.BoxGeometry(0.9, 0.36, 1.3)), paint(INK));
      body.position.y = 0.38;
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 128;
      const context = canvas.getContext("2d")!;
      context.fillStyle = CLAY;
      context.font = `650 112px ${getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif"}`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("?", 64, 70);
      const mark = new THREE.Sprite(keep(new THREE.SpriteMaterial({ map: keep(new THREE.CanvasTexture(canvas)) })));
      mark.scale.setScalar(2.2);
      mark.position.y = 1.7;
      car.add(body, mark);
      island.add(car);

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      let tiltX = 0, tiltY = 0, visible = true;
      const zone = element.closest(".home-world") ?? element;
      const move = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = element.getBoundingClientRect();
        tiltX = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
        tiltY = Math.max(-1, Math.min(1, ((clientY - rect.top) / rect.height) * 2 - 1));
      };
      const leave = () => { tiltX = tiltY = 0; };
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerleave", leave);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const started = performance.now();
      const path = (stations[0].x ** 2 + stations[0].z ** 2) ** 0.5 / UNIT * 0.62;
      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) return;
        const time = (now - started) / 1000;
        island.rotation.y += (time * 0.12 + tiltX * 0.5 - island.rotation.y) * 0.08;
        island.rotation.x += (tiltY * 0.12 - island.rotation.x) * 0.06;
        island.position.y = Math.sin(time * 0.9) * 0.15;
        const angle = -time * 0.5;
        const wobble = path + Math.sin(time * 1.7) * 0.9;
        car.position.set(Math.cos(angle) * wobble, Math.abs(Math.sin(time * 6)) * 0.08, Math.sin(angle) * wobble);
        car.rotation.y = -angle + Math.PI;
        words.forEach((word, index) => { word.position.y = 0.7 + Math.sin(time * 2 + index) * 0.15; word.rotation.y = time + index; });
        landmarks.forEach((piece, index) => { if (index % 2) piece.rotation.y = time * 0.4; });
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        zone.removeEventListener("pointermove", move);
        zone.removeEventListener("pointerleave", leave);
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [reduced]);

  return <div ref={host} className="island3d" data-on={on} />;
}
