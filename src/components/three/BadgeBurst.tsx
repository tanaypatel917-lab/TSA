"use client";

import { useEffect, useRef, useState } from "react";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const PAPER = "#F6EFE5";
const BITS = 140;

function face(mark: string, name: string, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 512;
  const context = canvas.getContext("2d")!;
  context.fillStyle = CLAY;
  context.fillRect(0, 0, 512, 512);
  context.strokeStyle = INK;
  context.lineWidth = 14;
  context.beginPath();
  context.arc(256, 256, 214, 0, Math.PI * 2);
  context.stroke();
  context.fillStyle = INK;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `650 ${mark.length > 2 ? 130 : 190}px ${font}`;
  context.fillText(mark, 256, 236);
  context.font = `600 34px ${font}`;
  context.fillText(name.toUpperCase().slice(0, 22), 256, 372);
  return canvas;
}

export function BadgeBurst({ mark, name }: { mark: string; name: string }) {
  const host = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const element = host.current;
    if (!element || !window.matchMedia("(min-width: 900px)").matches) return;
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
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 200);
      camera.position.set(0, 0, 16);
      scene.add(new THREE.HemisphereLight("#ffffff", "#5F86BA", 2.2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.6);
      sun.position.set(-4, 6, 9);
      scene.add(sun);

      const font = getComputedStyle(document.body).getPropertyValue("--font-display").trim() || "sans-serif";
      const texture = new THREE.CanvasTexture(face(mark, name, font));
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.center.set(0.5, 0.5);
      texture.rotation = Math.PI / 2;
      const geometry = new THREE.CylinderGeometry(2.6, 2.6, 0.5, 64);
      geometry.rotateX(Math.PI / 2);
      const rim = new THREE.MeshStandardMaterial({ color: INK, roughness: 0.35, metalness: 0.3 });
      const front = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.35, metalness: 0.1 });
      const medal = new THREE.Mesh(geometry, [rim, front, front]);
      scene.add(medal);

      const bitGeometry = new THREE.BoxGeometry(0.22, 0.22, 0.22);
      const bitMaterial = new THREE.MeshStandardMaterial({ roughness: 0.5, flatShading: true });
      const bits = new THREE.InstancedMesh(bitGeometry, bitMaterial, BITS);
      const palette = [CLAY, PAPER, "#AFCBE3", "#5F86BA"].map((value) => new THREE.Color(value));
      const motion = Array.from({ length: BITS }, (_, index) => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 6 + Math.random() * 9;
        bits.setColorAt(index, palette[index % palette.length]);
        return { vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed + 3, vz: (Math.random() - 0.5) * 8, spin: Math.random() * 10 };
      });
      bits.visible = false;
      scene.add(bits);

      const size = () => {
        renderer.setSize(window.innerWidth, window.innerHeight, false);
        camera.aspect = window.innerWidth / Math.max(1, window.innerHeight);
        camera.updateProjectionMatrix();
      };
      size();
      window.addEventListener("resize", size);

      const dummy = new THREE.Object3D();
      const started = performance.now();
      const SLAM = 0.42;
      let frame = 0;
      const loop = (now: number) => {
        const time = (now - started) / 1000;
        if (time > 2.4) return;
        frame = requestAnimationFrame(loop);
        const fly = Math.min(1, time / SLAM);
        const ease = fly * fly * fly;
        const settle = Math.max(0, time - SLAM);
        const bounce = Math.exp(-settle * 7) * Math.sin(settle * 26) * 0.12;
        medal.position.z = -40 + ease * 40;
        medal.rotation.y = (1 - ease) * Math.PI * 5 + Math.sin(time * 1.6) * 0.25 * Math.min(1, settle * 3);
        medal.rotation.x = Math.cos(time * 1.3) * 0.12 * Math.min(1, settle * 3);
        medal.rotation.z = -0.14 * ease;
        medal.scale.setScalar(1 + (fly >= 1 ? bounce : 0));
        if (time > 1.75) {
          const out = (time - 1.75) / 0.6;
          medal.position.y = -out * out * 14;
          medal.rotation.x += out * 1.2;
        }
        if (time >= SLAM) {
          bits.visible = true;
          const t = settle;
          motion.forEach((bit, index) => {
            dummy.position.set(bit.vx * t, bit.vy * t - 9 * t * t, bit.vz * t + 0.5);
            dummy.rotation.set(bit.spin * t, bit.spin * t * 0.7, 0);
            dummy.scale.setScalar(Math.max(0, 1 - t / 1.8));
            dummy.updateMatrix();
            bits.setMatrixAt(index, dummy.matrix);
          });
          bits.instanceMatrix.needsUpdate = true;
        }
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("resize", size);
        [texture, geometry, rim, front, bitGeometry, bitMaterial].forEach((item) => item.dispose());
        bits.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); };
  }, [mark, name]);

  return <div ref={host} className="burst3d" data-on={on} />;
}
