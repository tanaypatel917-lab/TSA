"use client";

import { useEffect, useRef, useState } from "react";
import { BADGES } from "@/engine/badges";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const PAPER = "#F6EFE5";

function face(mark: string, on: boolean, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d")!;
  context.fillStyle = on ? CLAY : "#2B3D5E";
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = on ? INK : "rgba(246,239,229,.45)";
  context.lineWidth = 8;
  context.setLineDash(on ? [] : [14, 10]);
  context.beginPath();
  context.arc(128, 128, 104, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = on ? INK : "rgba(246,239,229,.55)";
  context.font = `650 ${mark.length > 2 ? 72 : 104}px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(mark, 128, 136);
  return canvas;
}

export function BadgeCoins({ earned }: { earned: string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const { reduced } = useMotionPreference();
  const key = earned.join("|");

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
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 17);
      scene.add(new THREE.HemisphereLight("#ffffff", "#5F86BA", 2.4));
      const sun = new THREE.DirectionalLight("#ffffff", 2.2);
      sun.position.set(-4, 6, 8);
      scene.add(sun);

      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const wall = new THREE.Group();
      scene.add(wall);
      const geometry = new THREE.CylinderGeometry(0.95, 0.95, 0.22, 48);
      geometry.rotateX(Math.PI / 2);
      const rimOn = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.4, metalness: 0.2 });
      const rimOff = new THREE.MeshStandardMaterial({ color: "#2B3D5E", roughness: 0.8, transparent: true, opacity: 0.75 });
      const coins: { mesh: InstanceType<typeof THREE.Mesh>; delay: number; on: boolean; flip: number; home: InstanceType<typeof THREE.Vector3> }[] = [];
      BADGES.forEach((badge, index) => {
        const lit = earned.includes(badge.id);
        const texture = new THREE.CanvasTexture(face(badge.mark, lit, font));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;
        const front = new THREE.MeshStandardMaterial({ map: texture, roughness: lit ? 0.35 : 0.9, metalness: lit ? 0.15 : 0, transparent: !lit, opacity: lit ? 1 : 0.8 });
        const mesh = new THREE.Mesh(geometry, [lit ? rimOn : rimOff, front, front]);
        const column = index % 5, row = Math.floor(index / 5);
        const home = new THREE.Vector3((column - 2) * 2.1 + (row % 2 ? 0.375 : -0.375), (1 - row) * 2.2, lit ? 0.5 : 0);
        mesh.position.copy(home);
        wall.add(mesh);
        coins.push({ mesh, delay: index * 0.05, on: lit, flip: 0, home });
      });

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.position.z = Math.max(18.5, 6.1 / (Math.tan(Math.PI / 12) * camera.aspect));
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      const ray = new THREE.Raycaster();
      const pointer = new THREE.Vector2(9, 9);
      let tiltX = 0, tiltY = 0, visible = true;
      const hero = element.closest(".page-hero") ?? element;
      const move = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = element.getBoundingClientRect();
        pointer.set(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
        tiltX = pointer.x; tiltY = pointer.y;
      };
      const leave = () => { pointer.set(9, 9); tiltX = tiltY = 0; };
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
        wall.rotation.y += (Math.max(-1, Math.min(1, tiltX)) * 0.35 - wall.rotation.y) * 0.06;
        wall.rotation.x += (-Math.max(-1, Math.min(1, tiltY)) * 0.25 - wall.rotation.x) * 0.06;
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(coins.map((coin) => coin.mesh))[0]?.object;
        for (const coin of coins) {
          if (coin.mesh === hit && coin.flip <= 0) coin.flip = 1;
          coin.flip = Math.max(0, coin.flip - 0.016);
          const intro = Math.min(1, Math.max(0, (time - coin.delay) / 0.9));
          const settle = 1 - (1 - intro) ** 4;
          const flip = (1 - coin.flip) ** 3 * Math.PI * 2 * (coin.flip > 0 ? 1 : 0);
          coin.mesh.rotation.y = (1 - settle) * Math.PI * 3 + flip + Math.sin(time * 0.9 + coin.delay * 20) * 0.12;
          coin.mesh.rotation.x = Math.cos(time * 0.7 + coin.delay * 14) * 0.08;
          coin.mesh.position.y = coin.home.y + Math.sin(time * 1.2 + coin.delay * 30) * (coin.on ? 0.08 : 0.04) + (1 - settle) * -4;
          coin.mesh.position.z = coin.home.z + (coin.mesh === hit ? 0.8 : 0);
        }
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
        rimOn.dispose();
        rimOff.dispose();
        for (const coin of coins) {
          const front = (coin.mesh.material as InstanceType<typeof THREE.MeshStandardMaterial>[])[1];
          front.map?.dispose();
          front.dispose();
        }
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [key, reduced]); // eslint-disable-line react-hooks/exhaustive-deps

  return <div ref={host} className="coins3d" data-on={on} />;
}
