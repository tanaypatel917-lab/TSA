"use client";

import { useEffect, useRef, useState } from "react";
import { glossary } from "@/content/glossary";
import { useMotionPreference } from "../MotionPreferences";

const CHIP = 0.66;

const CLUSTERS: { center: [number, number, number]; fill: string; terms: string[] }[] = [
  { center: [-3.2, 0.9, 0], fill: "#AFCBE3", terms: ["AI", "Machine learning", "Model", "LLM", "Token", "Training data", "Algorithm", "Classifier", "Generative AI"] },
  { center: [3.3, 2.3, -1], fill: "#DD8962", terms: ["Prompt", "Context", "Prompt injection", "Verification", "Hallucination"] },
  { center: [1, -2.6, 1.8], fill: "#F6EFE5", terms: ["Bias", "Fairness", "Privacy", "Deepfake", "Misinformation", "Human oversight"] }
];

function jitter(text: string, salt: number) {
  let hash = salt * 2654435761;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return ((hash >>> 0) % 1000) / 1000 - 0.5;
}

function label(text: string, fill: string, font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  const size = 44;
  context.font = `600 ${size}px ${font}`;
  const width = Math.ceil(context.measureText(text).width) + 56;
  canvas.width = width;
  canvas.height = 84;
  context.fillStyle = "#1C2A43";
  context.beginPath();
  context.roundRect(6, 8, width - 8, 72, 36);
  context.fill();
  context.fillStyle = fill;
  context.strokeStyle = "#1C2A43";
  context.lineWidth = 4;
  context.beginPath();
  context.roundRect(2, 2, width - 8, 72, 36);
  context.fill();
  context.stroke();
  context.fillStyle = "#1C2A43";
  context.font = `600 ${size}px ${font}`;
  context.textBaseline = "middle";
  context.fillText(text, 26, 40);
  return canvas;
}

export function EmbeddingSpace() {
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
      const font = getComputedStyle(document.body).getPropertyValue("--font-body").trim() || "sans-serif";
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0, 24.5);
      const space = new THREE.Group();
      scene.add(space);

      type Node = { sprite: InstanceType<typeof THREE.Sprite>; home: InstanceType<typeof THREE.Vector3>; width: number; links: number[] };
      const nodes: Node[] = [];
      const known = new Set(glossary.map((entry) => entry.term));
      CLUSTERS.forEach((cluster, clusterIndex) => cluster.terms.filter((term) => known.has(term)).forEach((term) => {
        const texture = new THREE.CanvasTexture(label(term, cluster.fill, font));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
        const width = (texture.image as HTMLCanvasElement).width / 84;
        sprite.scale.set(width * CHIP, CHIP, 1);
        const home = new THREE.Vector3(cluster.center[0] + jitter(term, 1) * 4.6, cluster.center[1] + jitter(term, 2) * 4.2, cluster.center[2] * 0.35 + jitter(term, 3) * 0.5);
        sprite.position.copy(home).multiplyScalar(0.05);
        sprite.userData.cluster = clusterIndex;
        space.add(sprite);
        nodes.push({ sprite, home, width, links: [] });
      }));
      for (let pass = 0; pass < 120; pass += 1) nodes.forEach((node, index) => nodes.forEach((other, otherIndex) => {
        if (otherIndex <= index) return;
        const dx = other.home.x - node.home.x;
        const dy = other.home.y - node.home.y;
        const overlapX = (node.width + other.width) * 0.26 + 0.3 - Math.abs(dx);
        const overlapY = 0.86 - Math.abs(dy);
        if (overlapX <= 0 || overlapY <= 0) return;
        if (overlapY < overlapX) {
          const push = (overlapY / 2 + 0.01) * (dy >= 0 ? 1 : -1);
          node.home.y -= push;
          other.home.y += push;
        } else {
          const push = (overlapX / 2 + 0.01) * (dx >= 0 ? 1 : -1);
          node.home.x -= push;
          other.home.x += push;
        }
      }));
      const middle = nodes.reduce((sum, node) => sum.add(node.home), new THREE.Vector3()).divideScalar(Math.max(1, nodes.length));
      nodes.forEach((node) => { node.home.x -= middle.x; node.home.y -= middle.y - 0.3; });
      nodes.forEach((node, index) => {
        node.links = nodes.map((other, otherIndex) => ({ otherIndex, distance: otherIndex === index ? Infinity : node.home.distanceTo(other.home) })).sort((a, b) => a.distance - b.distance).slice(0, 2).map((item) => item.otherIndex);
      });
      const pairs: [number, number][] = [];
      nodes.forEach((node, index) => node.links.forEach((other) => { if (!pairs.some(([a, b]) => (a === other && b === index))) pairs.push([index, other]); }));
      const positions = new Float32Array(pairs.length * 6);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: "#1C2A43", transparent: true, opacity: 0.35 });
      space.add(new THREE.LineSegments(lineGeometry, lineMaterial));
      const hotPositions = new Float32Array(12);
      const hotGeometry = new THREE.BufferGeometry();
      hotGeometry.setAttribute("position", new THREE.BufferAttribute(hotPositions, 3));
      const hotMaterial = new THREE.LineBasicMaterial({ color: "#DD8962" });
      const hotLines = new THREE.LineSegments(hotGeometry, hotMaterial);
      space.add(hotLines);

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
        const grow = 1 - (1 - Math.min(1, time / 1.6)) ** 4;
        space.rotation.y += (Math.sin(time * 0.3) * 0.14 + tx * 0.2 - space.rotation.y) * 0.05;
        space.rotation.x += (-ty * 0.3 - space.rotation.x) * 0.05;
        ray.setFromCamera(pointer, camera);
        const hit = pointer.x < 5 ? ray.intersectObjects(nodes.map((node) => node.sprite))[0]?.object : undefined;
        const hot = nodes.findIndex((node) => node.sprite === hit);
        nodes.forEach((node, index) => {
          const float = Math.sin(time * 0.8 + index * 1.3) * 0.12;
          node.sprite.position.set(node.home.x * grow, (node.home.y + float) * grow, node.home.z * grow);
          const linked = hot >= 0 && (index === hot || nodes[hot].links.includes(index) || node.links.includes(hot));
          const target = index === hot ? 1.3 : linked ? 1.1 : 1;
          const scale = node.sprite.scale.y / CHIP + (target - node.sprite.scale.y / CHIP) * 0.2;
          node.sprite.scale.set(node.width * CHIP * scale, CHIP * scale, 1);
          (node.sprite.material as InstanceType<typeof THREE.SpriteMaterial>).opacity = hot >= 0 && !linked ? 0.35 : 1;
        });
        pairs.forEach(([a, b], index) => {
          nodes[a].sprite.position.toArray(positions, index * 6);
          nodes[b].sprite.position.toArray(positions, index * 6 + 3);
        });
        lineGeometry.attributes.position.needsUpdate = true;
        lineMaterial.opacity = hot >= 0 ? 0.12 : 0.35 * grow;
        hotLines.visible = hot >= 0;
        if (hot >= 0) {
          nodes[hot].links.forEach((other, index) => {
            nodes[hot].sprite.position.toArray(hotPositions, index * 6);
            nodes[other].sprite.position.toArray(hotPositions, index * 6 + 3);
          });
          hotGeometry.attributes.position.needsUpdate = true;
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
        for (const node of nodes) {
          const material = node.sprite.material as InstanceType<typeof THREE.SpriteMaterial>;
          material.map?.dispose();
          material.dispose();
        }
        lineGeometry.dispose();
        lineMaterial.dispose();
        hotGeometry.dispose();
        hotMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [reduced]);

  return <div ref={host} className="coins3d embed3d" data-on={on}><p className="embed3d-caption">Words near each other here are related, like an AI model&apos;s embedding space.</p></div>;
}
