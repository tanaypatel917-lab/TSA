"use client";

import { useEffect, useRef } from "react";
import { samplePoints } from "@/engine/glyphPoints";

const INK = "#1C2A43";
const CLAY = "#DD8962";
const POINT_COUNT = 1400;
const FRONT_POINT_COUNT = (POINT_COUNT / 4) * 3;
const SHADOW_POINT_COUNT = POINT_COUNT / 4;
const MORPH_DURATION = 900;
const RIPPLE_DELAY = 150;
const SHADOW_LAG = 120;

function drawKnight(context: CanvasRenderingContext2D) {
  const knight = new Path2D();
  knight.moveTo(64, 202);
  knight.lineTo(64, 187);
  knight.lineTo(72, 175);
  knight.lineTo(88, 162);
  knight.lineTo(96, 145);
  knight.lineTo(97, 132);
  knight.lineTo(88, 122);
  knight.lineTo(73, 116);
  knight.lineTo(61, 107);
  knight.lineTo(55, 96);
  knight.lineTo(62, 86);
  knight.lineTo(47, 79);
  knight.lineTo(28, 70);
  knight.lineTo(53, 68);
  knight.lineTo(71, 72);
  knight.lineTo(87, 79);
  knight.lineTo(98, 79);
  knight.lineTo(107, 69);
  knight.lineTo(115, 58);
  knight.lineTo(129, 50);
  knight.lineTo(143, 46);
  knight.lineTo(137, 30);
  knight.lineTo(153, 41);
  knight.lineTo(158, 25);
  knight.lineTo(168, 40);
  knight.lineTo(177, 56);
  knight.lineTo(189, 64);
  knight.lineTo(208, 70);
  knight.lineTo(193, 80);
  knight.lineTo(184, 84);
  knight.lineTo(198, 94);
  knight.lineTo(181, 99);
  knight.lineTo(189, 111);
  knight.lineTo(171, 107);
  knight.lineTo(178, 121);
  knight.lineTo(160, 115);
  knight.lineTo(165, 130);
  knight.lineTo(150, 126);
  knight.lineTo(153, 141);
  knight.lineTo(143, 151);
  knight.lineTo(144, 166);
  knight.lineTo(154, 178);
  knight.lineTo(170, 186);
  knight.lineTo(193, 187);
  knight.lineTo(193, 202);
  knight.closePath();
  context.fill(knight);

  const plinth = new Path2D();
  plinth.moveTo(54, 187);
  plinth.lineTo(202, 187);
  plinth.lineTo(202, 200);
  plinth.lineTo(218, 200);
  plinth.lineTo(218, 215);
  plinth.lineTo(230, 215);
  plinth.lineTo(230, 230);
  plinth.lineTo(26, 230);
  plinth.lineTo(26, 215);
  plinth.lineTo(38, 215);
  plinth.lineTo(38, 200);
  plinth.lineTo(54, 200);
  plinth.closePath();
  context.fill(plinth);

  context.save();
  context.globalCompositeOperation = "destination-out";
  context.beginPath();
  context.ellipse(77, 89, 4.5, 3.5, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.ellipse(47, 74, 2.5, 1.8, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawSun(context: CanvasRenderingContext2D) {
  context.save();
  context.translate(128, 128);
  context.fillStyle = "#fff";
  context.strokeStyle = "#fff";
  context.lineWidth = 14;
  context.lineCap = "round";
  for (let ray = 0; ray < 8; ray += 1) {
    context.save();
    context.rotate((ray * Math.PI) / 4);
    context.beginPath();
    context.moveTo(0, -70);
    context.lineTo(0, -98);
    context.stroke();
    context.restore();
  }
  context.beginPath();
  context.arc(0, 0, 52, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawContactSheet(context: CanvasRenderingContext2D) {
  const sheet = new Path2D();
  for (let row = 0; row < 4; row += 1) {
    for (let column = 0; column < 4; column += 1) {
      sheet.rect(29 + column * 52, 29 + row * 52, 42, 42);
    }
  }
  context.fillStyle = "#fff";
  context.fill(sheet);
}

const DRAWN_MARKS: Record<string, (context: CanvasRenderingContext2D) => void> = {
  "♞": drawKnight,
  "☀": drawSun,
  "▦": drawContactSheet
};

function layerPoints(samples: Float32Array) {
  const points = new Float32Array(POINT_COUNT * 3);
  let frontIndex = 0;
  for (let index = 0; index < POINT_COUNT; index += 1) {
    const offset = index * 3;
    points[offset] = samples[offset];
    points[offset + 1] = samples[offset + 1];
    if (index % 4 === 3) {
      points[offset] += 0.07;
      points[offset + 1] -= 0.07;
      points[offset + 2] = -0.28;
    } else {
      points[offset + 2] = -0.1 + (frontIndex / (FRONT_POINT_COUNT - 1)) * 0.2;
      frontIndex += 1;
    }
  }
  return points;
}

function rasterizeMark(mark: string, fontFamily: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext("2d");
  const emptyAlpha = new Uint8ClampedArray(256 * 256);
  if (!context) return layerPoints(samplePoints(emptyAlpha, 256, 256, POINT_COUNT));

  context.fillStyle = "#fff";
  context.textAlign = "center";
  context.textBaseline = "middle";

  const readAlpha = () => {
    const pixels = context.getImageData(0, 0, 256, 256).data;
    const alpha = new Uint8ClampedArray(256 * 256);
    for (let index = 0; index < alpha.length; index += 1) alpha[index] = pixels[index * 4 + 3];
    return alpha;
  };

  const drawText = (fontSize: number, offsetX: number, offsetY: number) => {
    context.clearRect(0, 0, 256, 256);
    context.font = `700 ${fontSize}px ${fontFamily}`;
    context.fillText(mark, 128 + offsetX, 128 + offsetY);
  };

  const drawnMark = DRAWN_MARKS[mark];
  if (drawnMark) {
    context.clearRect(0, 0, 256, 256);
    drawnMark(context);
    return layerPoints(samplePoints(readAlpha(), 256, 256, POINT_COUNT));
  }

  drawText(150, 0, 0);
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
  if (maxX < minX || maxY < minY) return layerPoints(samplePoints(probe, 256, 256, POINT_COUNT));

  const extent = Math.max(maxX - minX + 1, maxY - minY + 1);
  const fontSize = Math.min(240, (150 * 204.8) / extent);
  drawText(fontSize, 0, 0);
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
  if (!filled) return layerPoints(samplePoints(centred, 256, 256, POINT_COUNT));
  drawText(fontSize, 128 - sumX / filled, 128 - sumY / filled);
  return layerPoints(samplePoints(readAlpha(), 256, 256, POINT_COUNT));
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
        const color = index % 4 === 3 ? clay : ink;
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
        const image = spriteContext.createImageData(32, 32);
        for (let y = 0; y < 32; y += 1) {
          for (let x = 0; x < 32; x += 1) {
            const distance = Math.hypot(x + 0.5 - 16, y + 0.5 - 16) / 16;
            const edge = Math.max(0, Math.min(1, (distance - 0.56) / (0.98 - 0.56)));
            const alpha = Math.round((1 - edge * edge * (3 - 2 * edge)) * 255);
            const offset = (y * 32 + x) * 4;
            image.data[offset] = 255;
            image.data[offset + 1] = 255;
            image.data[offset + 2] = 255;
            image.data[offset + 3] = alpha;
          }
        }
        spriteContext.putImageData(image, 0, 0);
      }
      const texture = new THREE.CanvasTexture(sprite);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      const material = new THREE.PointsMaterial({
        map: texture,
        size: 0.038,
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
        elapsed: MORPH_DURATION + SHADOW_LAG + RIPPLE_DELAY,
        active: false
      };
      const pointDelays = new Float32Array(POINT_COUNT);
      let frontPoint = 0;
      let shadowPoint = 0;
      for (let index = 0; index < POINT_COUNT; index += 1) {
        if (index % 4 === 3) {
          pointDelays[index] = SHADOW_LAG + (shadowPoint / (SHADOW_POINT_COUNT - 1)) * RIPPLE_DELAY;
          shadowPoint += 1;
        } else {
          pointDelays[index] = (frontPoint / (FRONT_POINT_COUNT - 1)) * RIPPLE_DELAY;
          frontPoint += 1;
        }
      }
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
            const progress = Math.max(0, Math.min(1, (transition.elapsed - pointDelays[index]) / MORPH_DURATION));
            const eased = 1 - (1 - progress) ** 3;
            const offset = index * 3;
            positions.array[offset] = transition.start[offset] + (transition.target[offset] - transition.start[offset]) * eased;
            positions.array[offset + 1] = transition.start[offset + 1] + (transition.target[offset + 1] - transition.start[offset + 1]) * eased;
            positions.array[offset + 2] = transition.start[offset + 2] + (transition.target[offset + 2] - transition.start[offset + 2]) * eased;
          }
          positions.needsUpdate = true;
          if (transition.elapsed >= MORPH_DURATION + SHADOW_LAG + RIPPLE_DELAY) transition.active = false;
        }

        const seconds = (now - startedAt) / 1000;
        const maxTilt = (12 * Math.PI) / 180;
        const idleSway = (10 * Math.PI) / 180;
        const idleWobble = (2 * Math.PI) / 180;
        const targetYaw = pointerInside ? pointerX * maxTilt : Math.sin(seconds * 0.28) * idleSway;
        const targetPitch = pointerInside ? -pointerY * maxTilt : Math.sin(seconds * 0.2) * idleWobble;
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
