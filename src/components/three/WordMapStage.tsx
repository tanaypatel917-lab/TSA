"use client";

import { useEffect, useRef } from "react";
import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapGroupId, type WordMapTone } from "@/content/wordMap";
import { nearest, type WordMapPoint } from "@/engine/wordMap";

const INK = "#1C2A43";
const PAPER = "#F6EFE5";
const COLORS: Record<WordMapTone, string> = {
  sky: "#AFCBE3",
  clay: "#DD8962",
  lake: "#5F86BA",
  ink: INK
};

function cardFace(term: string, tone: WordMapTone, font: string) {
  const canvas = document.createElement("canvas");
  canvas.height = 112;
  let context = canvas.getContext("2d")!;
  const fontSize = 56;
  context.font = `650 ${fontSize}px ${font}`;
  const textWidth = context.measureText(term).width;
  canvas.width = Math.ceil(textWidth + 28);
  context = canvas.getContext("2d")!;
  context.fillStyle = PAPER;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = COLORS[tone];
  context.fillRect(0, 0, canvas.width, 14);
  context.strokeStyle = INK;
  context.lineWidth = 5;
  context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  context.fillStyle = INK;
  context.textBaseline = "middle";
  context.font = `650 ${fontSize}px ${font}`;
  context.fillText(term, 14, 68);
  return canvas;
}

function clusterLabel(text: string, tone: WordMapTone, font: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 80;
  const context = canvas.getContext("2d")!;
  context.fillStyle = tone === "ink" ? INK : PAPER;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = COLORS[tone];
  context.lineWidth = 6;
  context.strokeRect(3, 3, canvas.width - 6, canvas.height - 6);
  context.fillStyle = tone === "ink" ? PAPER : INK;
  context.font = `650 30px ${font}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, canvas.width / 2, canvas.height / 2);
  return canvas;
}

export function WordMapStage({ points, selected, onSelect, onReady }: {
  points: WordMapPoint[];
  selected: string;
  onSelect: (term: string) => void;
  onReady: (ready: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selected);
  const selectRef = useRef(onSelect);

  useEffect(() => { selectedRef.current = selected; }, [selected]);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    onReady(false);

    Promise.all([import("three"), document.fonts.ready]).then(([THREE]) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        onReady(false);
        return;
      }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.domElement.setAttribute("aria-hidden", "true");
      renderer.domElement.tabIndex = -1;
      element.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      camera.position.set(0, 0, 10.5);
      const cloud = new THREE.Group();
      scene.add(cloud);
      const styles = getComputedStyle(document.body);
      const font = styles.getPropertyValue("--font-display").trim() || "sans-serif";
      const bodyFont = styles.getPropertyValue("--font-body").trim() || "sans-serif";
      const cardGeometry = new THREE.PlaneGeometry(1, 1);
      const outlineGeometry = new THREE.EdgesGeometry(cardGeometry);
      const shadowMaterial = new THREE.MeshBasicMaterial({ color: INK });
      const outlineMaterial = new THREE.LineBasicMaterial({ color: COLORS.clay, transparent: true, opacity: 0.95 });
      const cards = points.map((point) => {
        const group = WORD_MAP_GROUPS.find((item) => item.id === point.group)!;
        const texture = new THREE.CanvasTexture(cardFace(point.term, group.tone, font));
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false });
        const card = new THREE.Mesh(cardGeometry, material);
        const width = Math.max(0.65, Math.min(1.15, texture.image.width / texture.image.height * 0.23));
        const height = 0.32;
        card.scale.set(width, height, 1);
        card.userData.term = point.term;
        const shadow = new THREE.Mesh(cardGeometry, shadowMaterial);
        shadow.position.set(0.035, -0.035, -0.025);
        shadow.scale.set(width + 0.035, height + 0.035, 1);
        const outline = new THREE.LineSegments(outlineGeometry, outlineMaterial);
        outline.position.z = 0.02;
        outline.scale.set(width + 0.025, height + 0.025, 1);
        outline.visible = false;
        const billboard = new THREE.Group();
        billboard.position.set(point.x, point.y, point.z);
        billboard.add(shadow, card, outline);
        cloud.add(billboard);
        return { point, billboard, card, shadow, texture, material, outline, width, height };
      });

      const clusters: { geometry: InstanceType<typeof THREE.BufferGeometry>; material: InstanceType<typeof THREE.PointsMaterial>; points: InstanceType<typeof THREE.Points> }[] = [];
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      WORD_MAP_GROUPS.forEach((group) => {
        const radius = 0.55 + 0.08 * group.terms.length;
        const center = WORD_MAP_GROUP_CENTERS[group.id];
        const positions: number[] = [];
        for (let index = 0; index < 72; index += 1) {
          const y = 1 - 2 * (index + 0.5) / 72;
          const horizontal = Math.sqrt(1 - y * y);
          const angle = index * goldenAngle;
          positions.push(
            center[0] + Math.cos(angle) * horizontal * radius,
            center[1] + y * radius,
            center[2] + Math.sin(angle) * horizontal * radius
          );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({ color: COLORS[group.tone], size: 0.055, transparent: true, opacity: 0.33, depthWrite: false });
        const dots = new THREE.Points(geometry, material);
        cloud.add(dots);
        clusters.push({ geometry, material, points: dots });

        const texture = new THREE.CanvasTexture(clusterLabel(group.label, group.tone, bodyFont));
        texture.colorSpace = THREE.SRGBColorSpace;
        const labelMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false });
        const label = new THREE.Sprite(labelMaterial);
        label.position.set(center[0], center[1] + radius + 0.2, center[2]);
        label.scale.set(2.1, 0.4, 1);
        cloud.add(label);
      });

      const linePositions = new Float32Array(3 * 2 * 3);
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.82 });
      const nearestLines = new THREE.LineSegments(lineGeometry, lineMaterial);
      scene.add(nearestLines);

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);
      let visible = true;
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      const pointer = new THREE.Vector2(9, 9);
      const ray = new THREE.Raycaster();
      let dragging = false;
      let dragged = false;
      let lastX = 0;
      let lastY = 0;
      let hoverTerm = "";
      const canvas = renderer.domElement;
      const hitTerm = (event: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(cards.map((item) => item.card), false)[0]?.object;
        hoverTerm = typeof hit?.userData.term === "string" ? hit.userData.term : "";
        canvas.style.cursor = dragging ? "grabbing" : hoverTerm ? "pointer" : "grab";
        return hoverTerm;
      };
      const down = (event: PointerEvent) => {
        dragging = true;
        dragged = false;
        lastX = event.clientX;
        lastY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
        canvas.style.cursor = "grabbing";
      };
      const move = (event: PointerEvent) => {
        if (dragging) {
          const dx = event.clientX - lastX;
          const dy = event.clientY - lastY;
          lastX = event.clientX;
          lastY = event.clientY;
          if (Math.abs(dx) + Math.abs(dy) > 1) dragged = true;
          cloud.rotation.y += dx * 0.008;
          cloud.rotation.x = Math.max(-0.72, Math.min(0.72, cloud.rotation.x + dy * 0.006));
          pointer.set(9, 9);
          hoverTerm = "";
          return;
        }
        const term = hitTerm(event);
        if (term) selectRef.current(term);
      };
      const up = (event: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        if (!dragged) {
          const term = hitTerm(event);
          if (term) selectRef.current(term);
        }
        canvas.style.cursor = hoverTerm ? "pointer" : "grab";
      };
      const leave = () => {
        pointer.set(9, 9);
        hoverTerm = "";
        if (!dragging) canvas.style.cursor = "grab";
      };
      canvas.addEventListener("pointerdown", down);
      canvas.addEventListener("pointermove", move);
      canvas.addEventListener("pointerup", up);
      canvas.addEventListener("pointercancel", up);
      canvas.addEventListener("pointerleave", leave);

      const focus = new THREE.Vector3();
      const destination = new THREE.Vector3();
      const desiredCamera = new THREE.Vector3();
      const cameraOffset = new THREE.Vector3(0, 0, 10.5);
      const selectedPosition = new THREE.Vector3();
      const linkedPositions = Array.from({ length: 3 }, () => new THREE.Vector3());
      const parentQuaternion = new THREE.Quaternion();
      let frame = 0;
      let last = performance.now();
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) { last = now; return; }
        const delta = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!dragging && !hoverTerm) cloud.rotation.y += delta * 0.045;
        const chosen = cards.find((item) => item.point.term === selectedRef.current) ?? cards[0];
        cloud.updateMatrixWorld(true);
        chosen.billboard.getWorldPosition(destination);
        focus.lerp(destination, 0.045);
        desiredCamera.copy(focus).add(cameraOffset);
        camera.position.lerp(desiredCamera, 0.035);
        camera.lookAt(focus);
        cloud.updateMatrixWorld(true);
        cloud.getWorldQuaternion(parentQuaternion).invert();
        const activeNeighbors = nearest(points, selectedRef.current);
        cards.forEach((item) => {
          const isSelected = item.point.term === selectedRef.current;
          const isNeighbor = activeNeighbors.some((point) => point.term === item.point.term);
          const scale = isSelected ? 1.25 : 1;
          item.card.scale.set(item.width * scale, item.height * scale, 1);
          item.shadow.scale.set((item.width + 0.035) * scale, (item.height + 0.035) * scale, 1);
          item.outline.scale.set((item.width + 0.025) * scale, (item.height + 0.025) * scale, 1);
          item.material.opacity = isSelected || isNeighbor ? 1 : 0.35;
          item.outline.visible = isSelected;
          item.billboard.quaternion.copy(parentQuaternion).multiply(camera.quaternion);
        });
        chosen.billboard.getWorldPosition(selectedPosition);
        activeNeighbors.forEach((neighbor, index) => {
          const item = cards.find((card) => card.point.term === neighbor.term)!;
          item.billboard.getWorldPosition(linkedPositions[index]);
          selectedPosition.toArray(linePositions, index * 6);
          linkedPositions[index].toArray(linePositions, index * 6 + 3);
        });
        lineGeometry.attributes.position.needsUpdate = true;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      onReady(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        canvas.removeEventListener("pointerdown", down);
        canvas.removeEventListener("pointermove", move);
        canvas.removeEventListener("pointerup", up);
        canvas.removeEventListener("pointercancel", up);
        canvas.removeEventListener("pointerleave", leave);
        cards.forEach((item) => { item.texture.dispose(); item.material.dispose(); });
        clusters.forEach((cluster) => { cluster.geometry.dispose(); cluster.material.dispose(); });
        cloud.traverse((object) => {
          if (object instanceof THREE.Sprite) {
            const material = object.material as InstanceType<typeof THREE.SpriteMaterial>;
            material.map?.dispose();
            material.dispose();
          }
        });
        cardGeometry.dispose();
        outlineGeometry.dispose();
        shadowMaterial.dispose();
        outlineMaterial.dispose();
        lineGeometry.dispose();
        lineMaterial.dispose();
        renderer.dispose();
        canvas.remove();
      };
    }).catch(() => { if (!disposed) onReady(false); });

    return () => {
      disposed = true;
      cleanup();
      onReady(false);
    };
  }, [onReady, points]);

  return <div ref={host} className="word-map-three" />;
}
