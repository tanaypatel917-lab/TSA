"use client";

import { useEffect, useRef } from "react";
import { samplePoints } from "@/engine/glyphPoints";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const POINT_COUNT = 1600;

function rasterizeMark(mark: string, fontFamily: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  if (!context) return new Float32Array(POINT_COUNT * 3);

  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const readAlpha = () => {
    const pixels = context.getImageData(0, 0, 256, 256).data;
    const alpha = new Uint8ClampedArray(256 * 256);
    for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3];
    return alpha;
  };

  const draw = (fontSize: number, offsetX: number, offsetY: number) => {
    context.clearRect(0, 0, 256, 256);
    context.font = `700 ${fontSize}px ${fontFamily}`;
    context.fillText(mark, 128 + offsetX, 128 + offsetY);
  };

  draw(150, 0, 0);
  const probe = readAlpha();
  let minX = 256;
  let maxX = -1;
  let minY = 256;
  let maxY = -1;
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      if (probe[y * 256 + x] <= 128) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < minX || maxY < minY) return samplePoints(probe, 256, 256, POINT_COUNT);

  const extent = Math.max(maxX - minX + 1, maxY - minY + 1);
  const fontSize = Math.min(240, (150 * 204.8) / extent);
  draw(fontSize, 0, 0);
  const centred = readAlpha();
  let sumX = 0;
  let sumY = 0;
  let filled = 0;
  for (let y = 0; y < 256; y += 1) {
    for (let x = 0; x < 256; x += 1) {
      if (centred[y * 256 + x] <= 128) continue;
      sumX += x;
      sumY += y;
      filled += 1;
    }
  }
  if (!filled) return samplePoints(centred, 256, 256, POINT_COUNT);
  draw(fontSize, 128 - sumX / filled, 128 - sumY / filled);
  return samplePoints(readAlpha(), 256, 256, POINT_COUNT);
}

export function TimelineParticles({ mark, onReady }: {
  mark: string;
  onReady: (ready: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const markRef = useRef(mark);
  const morphRef = useRef<((nextMark: string) => void) | null>(null);
  const onReadyRef = useRef(onReady);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);

  useEffect(() => {
    markRef.current = mark;
    morphRef.current?.(mark);
  }, [mark]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};

    Promise.all([import("three"), document.fonts.ready]).then(([THREE]) => {
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        onReadyRef.current(false);
        return;
      }

      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.className = "timeline-particles-canvas";
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.tabIndex = -1;
      element.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
      camera.position.set(0, 0, 4);
      const cloud = new THREE.Group();
      scene.add(cloud);

      const fontTarget = document.querySelector<HTMLElement>(".timeline-date time, .timeline-question");
      const fontFamily = getComputedStyle(fontTarget ?? element).fontFamily || "sans-serif";
      const initial = rasterizeMark(markRef.current, fontFamily);
      const geometry = new THREE.BufferGeometry();
      const positions = new THREE.BufferAttribute(initial, 3);
      geometry.setAttribute("position", positions);

      const ink = new THREE.Color(INK);
      const clay = new THREE.Color(CLAY);
      const colors = new Float32Array(POINT_COUNT * 3);
      for (let index = 0; index < POINT_COUNT; index += 1) {
        const color = index % 20 < 3 ? clay : ink;
        colors[index * 3] = color.r;
        colors[index * 3 + 1] = color.g;
        colors[index * 3 + 2] = color.b;
      }
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

      const sprite = document.createElement("canvas");
      sprite.width = 32;
      sprite.height = 32;
      const spriteContext = sprite.getContext("2d");
      if (spriteContext) {
        spriteContext.fillStyle = "#fff";
        spriteContext.beginPath();
        spriteContext.arc(16, 16, 15, 0, Math.PI * 2);
        spriteContext.fill();
      }
      const texture = new THREE.CanvasTexture(sprite);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.PointsMaterial({
        map: texture,
        size: 0.042,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        alphaTest: 0.02
      });
      cloud.add(new THREE.Points(geometry, material));

      const resizeStage = () => {
        const { width, height } = element.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      resizeStage();
      const resize = new ResizeObserver(resizeStage);
      resize.observe(element);

      let inViewport = false;
      let tabVisible = !document.hidden;
      const intersection = new IntersectionObserver(([entry]) => {
        inViewport = entry.isIntersecting;
        if (inViewport) schedule();
        else pause();
      });
      intersection.observe(element);

      let pointerInside = false;
      let pointerX = 0;
      let pointerY = 0;
      const movePointer = (event: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        pointerInside = true;
        pointerX = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        pointerY = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
      };
      const leavePointer = () => { pointerInside = false; };
      element.addEventListener("pointermove", movePointer);
      element.addEventListener("pointerleave", leavePointer);

      const transition = {
        start: initial.slice(),
        target: initial,
        elapsed: 1050,
        active: false
      };
      morphRef.current = (nextMark) => {
        transition.start = new Float32Array(positions.array);
        transition.target = new Float32Array(rasterizeMark(nextMark, fontFamily));
        transition.elapsed = 0;
        transition.active = true;
      };

      let frame = 0;
      let lastFrame = 0;
      const startedAt = performance.now();
      const schedule = () => {
        if (inViewport && tabVisible && frame === 0) frame = requestAnimationFrame(render);
      };
      const pause = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        lastFrame = 0;
      };
      const visibilityChange = () => {
        tabVisible = !document.hidden;
        if (tabVisible) schedule();
        else pause();
      };
      document.addEventListener("visibilitychange", visibilityChange);

      const render = (now: number) => {
        frame = 0;
        if (!inViewport || !tabVisible) return;
        const delta = lastFrame ? Math.min(50, now - lastFrame) : 0;
        lastFrame = now;
        if (transition.active) {
          transition.elapsed += delta;
          for (let index = 0; index < POINT_COUNT; index += 1) {
            const delay = (index / (POINT_COUNT - 1)) * 150;
            const progress = Math.max(0, Math.min(1, (transition.elapsed - delay) / 900));
            const eased = 1 - (1 - progress) ** 3;
            const offset = index * 3;
            positions.array[offset] = transition.start[offset] + (transition.target[offset] - transition.start[offset]) * eased;
            positions.array[offset + 1] = transition.start[offset + 1] + (transition.target[offset + 1] - transition.start[offset + 1]) * eased;
            positions.array[offset + 2] = transition.start[offset + 2] + (transition.target[offset + 2] - transition.start[offset + 2]) * eased;
          }
          positions.needsUpdate = true;
          if (transition.elapsed >= 1050) transition.active = false;
        }

        const seconds = (now - startedAt) / 1000;
        const maxTilt = (12 * Math.PI) / 180;
        const idleSway = (6 * Math.PI) / 180;
        const targetYaw = pointerInside ? pointerX * maxTilt : Math.sin(seconds * 0.28) * idleSway;
        const targetPitch = pointerInside ? -pointerY * maxTilt : Math.sin(seconds * 0.2) * idleSway * 0.45;
        const damping = 1 - Math.exp(-Math.max(0, delta) * 0.006);
        cloud.rotation.y += (targetYaw - cloud.rotation.y) * damping;
        cloud.rotation.x += (targetPitch - cloud.rotation.x) * damping;
        renderer.render(scene, camera);
        schedule();
      };

      onReadyRef.current(true);
      schedule();

      cleanup = () => {
        pause();
        resize.disconnect();
        intersection.disconnect();
        document.removeEventListener("visibilitychange", visibilityChange);
        element.removeEventListener("pointermove", movePointer);
        element.removeEventListener("pointerleave", leavePointer);
        morphRef.current = null;
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
        renderer.forceContextLoss();
        renderer.domElement.remove();
      };
    }).catch(() => {
      if (!disposed) onReadyRef.current(false);
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <div ref={host} className="timeline-particles-stage" aria-hidden="true" />;
}
