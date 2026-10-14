"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "../MotionPreferences";
import { STARTER, useTray } from "../WordTray";

const FACES = [["#F6EFE5", "#1C2A43"], ["#AFCBE3", "#1C2A43"], ["#DD8962", "#1C2A43"], ["#5F86BA", "#F6EFE5"], ["#F6EFE5", "#1C2A43"]];
const RADIUS = 24;

const pad = (value: number) => String(value).padStart(2, "0");

function front(word: string, index: number, total: number, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 600;
  const context = canvas.getContext("2d")!;
  const [paper, ink] = FACES[index % FACES.length];
  context.fillStyle = paper;
  context.fillRect(0, 0, 420, 600);
  context.strokeStyle = ink;
  context.lineWidth = 8;
  context.strokeRect(4, 4, 412, 592);
  context.setLineDash([10, 8]);
  context.lineWidth = 2;
  context.globalAlpha = 0.45;
  context.strokeRect(24, 24, 372, 552);
  context.setLineDash([]);
  context.globalAlpha = 1;
  context.fillStyle = ink;
  context.font = `700 26px ${font}`;
  context.fillText(`${pad(index + 1)} / ${pad(total)}`, 44, 74);
  let size = 96;
  context.font = `700 ${size}px ${font}`;
  while (context.measureText(word).width > 332 && size > 30) { size -= 4; context.font = `700 ${size}px ${font}`; }
  context.fillText(word, 44, 330);
  context.fillStyle = paper === "#DD8962" ? "#1C2A43" : "#DD8962";
  context.fillRect(44, 362, 84, 10);
  context.fillStyle = ink;
  context.font = `700 22px ${font}`;
  context.fillText("WORD TRAY", 44, 548);
  context.textAlign = "right";
  context.fillText("Aa", 376, 548);
  return canvas;
}

function back(font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 600;
  const context = canvas.getContext("2d")!;
  context.fillStyle = "#1C2A43";
  context.fillRect(0, 0, 420, 600);
  context.strokeStyle = "#F6EFE5";
  context.setLineDash([10, 8]);
  context.lineWidth = 3;
  context.strokeRect(24, 24, 372, 552);
  context.fillStyle = "#DD8962";
  context.font = `700 300px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("?", 210, 310);
  return canvas;
}

export function WordDeck() {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const { reduced } = useMotionPreference();
  const tray = useTray();
  const words = tray.hydrated && tray.terms.length > 0 ? tray.terms.slice(-5) : STARTER;
  const key = words.join("|");

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
      element.appendChild(renderer.domElement);
      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const list = key.split("|");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 1, 400);
      camera.position.set(0, 0, 100);
      scene.add(new THREE.HemisphereLight("#ffffff", "#1C2A43", 2.2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.4);
      sun.position.set(-30, 40, 60);
      scene.add(sun);
      const group = new THREE.Group();
      scene.add(group);
      const card = new THREE.BoxGeometry(14, 20, 0.5);
      const flat = new THREE.PlaneGeometry(14, 20);
      const edge = new THREE.MeshLambertMaterial({ color: "#1C2A43" });
      const shade = new THREE.MeshBasicMaterial({ color: "#1C2A43" });
      const backTexture = new THREE.CanvasTexture(back(font));
      backTexture.colorSpace = THREE.SRGBColorSpace;
      const backMaterial = new THREE.MeshBasicMaterial({ map: backTexture });
      const anisotropy = renderer.capabilities.getMaxAnisotropy();
      const mid = (list.length - 1) / 2;
      const cards = list.map((word, index) => {
        const texture = new THREE.CanvasTexture(front(word, index, list.length, font));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = anisotropy;
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(card, [edge, edge, edge, edge, material, backMaterial]);
        const shadow = new THREE.Mesh(flat, shade);
        shadow.position.set(1.2, -1.2, -0.7);
        mesh.add(shadow);
        const pivot = new THREE.Group();
        pivot.position.set(0, -22, index * 0.9);
        pivot.add(mesh);
        group.add(pivot);
        return { pivot, mesh, texture, material, angle: -(index - mid) * 0.2, lift: 0 };
      });
      const meshes: InstanceType<typeof THREE.Object3D>[] = cards.map(({ mesh }) => mesh);

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      const hero = element.closest(".page-hero") ?? element;
      const pointer = new THREE.Vector2(9, 9);
      const ray = new THREE.Raycaster();
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
        let hovered = -1;
        if (pointer.x < 5) {
          ray.setFromCamera(pointer, camera);
          const hit = ray.intersectObjects(meshes, false)[0];
          if (hit) hovered = meshes.indexOf(hit.object);
        }
        group.rotation.y += (tx * 0.4 + Math.sin(time * 0.4) * 0.08 - group.rotation.y) * 0.06;
        group.rotation.x += (-ty * 0.22 - group.rotation.x) * 0.06;
        cards.forEach((entry, index) => {
          const t = Math.min(1, Math.max(0, (time - 0.15 - index * 0.13) / 0.9));
          const ease = 1 - (1 - t) ** 4;
          entry.lift += ((index === hovered ? 1 : 0) - entry.lift) * 0.14;
          const spread = hovered < 0 || index === hovered ? 0 : Math.sign(hovered - index) * 0.07;
          entry.pivot.rotation.z = (entry.angle + spread + Math.sin(time * 0.8 + index) * 0.015) * ease;
          entry.mesh.position.set(0, RADIUS - (1 - ease) * 34 + entry.lift * 4, entry.lift * 4);
          entry.mesh.rotation.set(-entry.lift * 0.1, (1 - ease) * Math.PI, 0);
        });
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
        cards.forEach(({ texture, material }) => { texture.dispose(); material.dispose(); });
        [card, flat].forEach((geometry) => geometry.dispose());
        [edge, shade, backMaterial].forEach((material) => material.dispose());
        backTexture.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [key, reduced]);

  return <div ref={host} className="deck3d" data-on={on}>
    <ol className="deck-flat">{words.map((word, index) => <li key={word} style={{ "--i": index - (words.length - 1) / 2 } as React.CSSProperties}><small>{pad(index + 1)} / {pad(words.length)}</small><b>{word}</b><small>Word tray</small></li>)}</ol>
  </div>;
}
