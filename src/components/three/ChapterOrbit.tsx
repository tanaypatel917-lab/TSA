"use client";

import { useEffect, useRef, useState } from "react";
import { moduleVisuals } from "@/content/visuals";
import { useMotionPreference } from "../MotionPreferences";

const INK = "#1C2A43";
const FILLS = ["#F6EFE5", "#DD8962", "#5F86BA", "#1C2A43", "#DD8962"];

function face(mark: string, label: string, fill: string, font: string, body: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 256;
  const context = canvas.getContext("2d")!;
  context.fillStyle = fill;
  context.fillRect(0, 0, 256, 256);
  context.strokeStyle = fill === INK ? "#DD8962" : INK;
  context.lineWidth = 7;
  context.beginPath();
  context.arc(128, 128, 112, 0, Math.PI * 2);
  context.stroke();
  const ink = fill === "#5F86BA" || fill === INK ? "#F6EFE5" : INK;
  context.fillStyle = ink;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `700 24px ${body}`;
  context.fillText(label, 128, 58);
  context.font = `650 ${mark.length > 2 ? 78 : 112}px ${font}`;
  context.fillText(mark, 128, 146);
  return canvas;
}

export function ChapterOrbit() {
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
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 2.2, 17);
      camera.lookAt(0, 0, 0);
      scene.add(new THREE.HemisphereLight("#ffffff", "#5F86BA", 2.2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.4);
      sun.position.set(-5, 7, 8);
      scene.add(sun);

      const styles = getComputedStyle(document.body);
      const font = styles.getPropertyValue("--font-display").trim() || "sans-serif";
      const body = styles.getPropertyValue("--font-body").trim() || "sans-serif";
      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(item: T) => { disposables.push(item); return item; };

      const system = new THREE.Group();
      system.rotation.x = 0.5;
      system.rotation.z = -0.12;
      scene.add(system);

      const core = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(1.45, 1)), keep(new THREE.MeshStandardMaterial({ color: "#DD8962", roughness: 0.5, flatShading: true })));
      const shell = new THREE.Mesh(keep(new THREE.IcosahedronGeometry(1.95, 1)), keep(new THREE.MeshBasicMaterial({ color: INK, wireframe: true, transparent: true, opacity: 0.35 })));
      scene.add(core, shell);

      const radiusX = 4.9, radiusZ = 3.9;
      const ringPoints = Array.from({ length: 129 }, (_, index) => {
        const angle = (index / 128) * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * radiusX, 0, Math.sin(angle) * radiusZ);
      });
      const ring = new THREE.Line(keep(new THREE.BufferGeometry().setFromPoints(ringPoints)), keep(new THREE.LineDashedMaterial({ color: INK, dashSize: 0.25, gapSize: 0.2, transparent: true, opacity: 0.45 })));
      ring.computeLineDistances();
      system.add(ring);

      const geometry = keep(new THREE.CylinderGeometry(0.85, 0.85, 0.24, 48));
      geometry.rotateX(Math.PI / 2);
      const rim = keep(new THREE.MeshStandardMaterial({ color: INK, roughness: 0.4, metalness: 0.2 }));
      const planets = Object.values(moduleVisuals).map((visual, index, list) => {
        const fill = FILLS[index % FILLS.length];
        const texture = keep(new THREE.CanvasTexture(face(visual.mark, String(index + 1).padStart(2, "0"), fill, font, body)));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = 4;
        texture.center.set(0.5, 0.5);
        texture.rotation = Math.PI / 2;
        const front = keep(new THREE.MeshStandardMaterial({ map: texture, roughness: 0.4 }));
        const mesh = new THREE.Mesh(geometry, [rim, front, front]);
        system.add(mesh);
        return { mesh, phase: (index / list.length) * Math.PI * 2, hover: 0 };
      });

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.position.z = camera.aspect < 1.1 ? 23 : 19;
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
        tiltX = Math.max(-1, Math.min(1, pointer.x)); tiltY = Math.max(-1, Math.min(1, pointer.y));
      };
      const leave = () => { pointer.set(9, 9); tiltX = tiltY = 0; };
      hero.addEventListener("pointermove", move);
      hero.addEventListener("pointerleave", leave);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const started = performance.now();
      const world = new THREE.Vector3();
      let spin = 0, last = started, frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) { last = now; return; }
        const time = (now - started) / 1000;
        const delta = Math.min(0.05, (now - last) / 1000);
        last = now;
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(planets.map((planet) => planet.mesh))[0]?.object;
        spin += delta * (hit ? 0.06 : 0.28);
        const intro = 1 - (1 - Math.min(1, time / 1.6)) ** 4;
        system.rotation.x += (0.5 - tiltY * 0.18 - system.rotation.x) * 0.06;
        system.rotation.z += (-0.12 - tiltX * 0.12 - system.rotation.z) * 0.06;
        core.rotation.set(time * 0.35, time * 0.5, 0);
        shell.rotation.set(-time * 0.2, -time * 0.3, 0);
        core.scale.setScalar(intro * (1 + Math.sin(time * 2) * 0.03));
        shell.scale.setScalar(intro);
        for (const planet of planets) {
          planet.hover += ((planet.mesh === hit ? 1 : 0) - planet.hover) * 0.15;
          const angle = planet.phase + spin + (1 - intro) * 2.5;
          const reach = 0.3 + intro * 0.7;
          planet.mesh.position.set(Math.cos(angle) * radiusX * reach, Math.sin(time * 1.3 + planet.phase) * 0.25, Math.sin(angle) * radiusZ * reach);
          planet.mesh.getWorldPosition(world);
          planet.mesh.lookAt(camera.position.clone().sub(world).add(planet.mesh.position));
          planet.mesh.rotateZ(Math.sin(time + planet.phase) * 0.08);
          planet.mesh.rotateY(planet.hover * Math.PI * 2 * (1 - planet.hover) * 0.25);
          planet.mesh.scale.setScalar(intro * (1 + planet.hover * 0.35));
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
        disposables.forEach((item) => item.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [reduced]);

  return <div ref={host} className="orbit3d" data-on={on} />;
}
