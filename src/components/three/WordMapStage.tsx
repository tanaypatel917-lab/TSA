"use client";

import { useEffect, useRef } from "react";
import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapTone } from "@/content/wordMap";
import { nearest, type WordMapPoint } from "@/engine/wordMap";

const INK = "#1C2A43";
const COLORS: Record<WordMapTone, string> = {
  sky: "#AFCBE3",
  clay: "#DD8962",
  lake: "#5F86BA",
  ink: INK
};

export function WordMapStage({ points, selected, onSelect, onReady }: {
  points: WordMapPoint[];
  selected: string;
  onSelect: (term: string) => void;
  onReady: (ready: boolean) => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const labelLayer = useRef<HTMLDivElement>(null);
  const termLabels = useRef(new Map<string, HTMLButtonElement>());
  const clusterLabels = useRef(new Map<string, HTMLSpanElement>());
  const selectedRef = useRef(selected);
  const selectRef = useRef(onSelect);
  const neighborTerms = useRef(new Set<string>());
  const hoveredTerm = useRef("");
  const focused = useRef(false);
  const suppressClick = useRef(false);

  useEffect(() => {
    selectedRef.current = selected;
    neighborTerms.current = new Set(nearest(points, selected).map((point) => point.term));
  }, [points, selected]);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    onReady(false);

    import("three").then((THREE) => {
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
      element.insertBefore(renderer.domElement, labelLayer.current);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      const layoutSphere = new THREE.Sphere().setFromPoints(points.map((point) => new THREE.Vector3(point.x, point.y, point.z)));
      WORD_MAP_GROUPS.forEach((group) => {
        const center = new THREE.Vector3(...WORD_MAP_GROUP_CENTERS[group.id]);
        const radius = 0.55 + 0.08 * group.terms.length;
        layoutSphere.radius = Math.max(layoutSphere.radius, layoutSphere.center.distanceTo(center) + radius);
      });
      const cloud = new THREE.Group();
      cloud.position.copy(layoutSphere.center);
      cloud.quaternion.setFromUnitVectors(
        new THREE.Vector3(...WORD_MAP_GROUP_CENTERS.models).sub(layoutSphere.center).normalize(),
        new THREE.Vector3(0, 1, 0)
      );
      const layer = new THREE.Group();
      layer.position.copy(layoutSphere.center).negate();
      cloud.add(layer);
      scene.add(cloud);

      const dotGeometry = new THREE.SphereGeometry(0.055, 10, 8);
      const dotMaterials = new Map<WordMapTone, InstanceType<typeof THREE.MeshBasicMaterial>>();
      const dots = points.map((point) => {
        const group = WORD_MAP_GROUPS.find((item) => item.id === point.group)!;
        let material = dotMaterials.get(group.tone);
        if (!material) {
          material = new THREE.MeshBasicMaterial({ color: COLORS[group.tone] });
          dotMaterials.set(group.tone, material);
        }
        const dot = new THREE.Mesh(dotGeometry, material);
        dot.position.set(point.x, point.y, point.z);
        layer.add(dot);
        return { point, dot };
      });
      const dotsByTerm = new Map<string, InstanceType<typeof THREE.Mesh>>(dots.map((item) => [item.point.term, item.dot]));

      const clusterDots: { geometry: InstanceType<typeof THREE.BufferGeometry>; material: InstanceType<typeof THREE.PointsMaterial> }[] = [];
      const clusterAnchors = WORD_MAP_GROUPS.map((group) => {
        const radius = 0.55 + 0.08 * group.terms.length;
        const center = WORD_MAP_GROUP_CENTERS[group.id];
        const positions: number[] = [];
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
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
        const material = new THREE.PointsMaterial({ color: COLORS[group.tone], size: 0.045, sizeAttenuation: true, transparent: true, opacity: 0.2, depthWrite: false });
        const sphere = new THREE.Points(geometry, material);
        layer.add(sphere);
        clusterDots.push({ geometry, material });
        return {
          id: group.id,
          position: new THREE.Vector3(center[0], center[1], center[2]),
          radius
        };
      });

      const linkGeometry = new THREE.CylinderGeometry(0.018, 0.018, 1, 6, 1);
      const linkMaterial = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.8, depthWrite: false });
      const linkMeshes = Array.from({ length: 3 }, () => {
        const link = new THREE.Mesh(linkGeometry, linkMaterial);
        scene.add(link);
        return link;
      });
      const up = new THREE.Vector3(0, 1, 0);
      const worldRight = new THREE.Vector3(1, 0, 0);
      const turn = new THREE.Quaternion();
      let userPitch = 0;
      const direction = new THREE.Vector3();
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      const selectedPosition = new THREE.Vector3();
      const projected = new THREE.Vector3();
      const placedClusterLabels: { left: number; top: number; right: number; bottom: number }[] = [];
      const clusterTopByGroup = new Map<string, number>();

      let cameraDistance = 0;
      const focus = new THREE.Vector3();
      const focusTarget = new THREE.Vector3();
      const cameraOffset = new THREE.Vector3();
      const desiredCamera = new THREE.Vector3();
      const resizeStage = () => {
        const { width, height } = element.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const smallerSideHalfFov = camera.aspect < 1
          ? Math.atan(Math.tan(verticalHalfFov) * camera.aspect)
          : verticalHalfFov;
        cameraDistance = layoutSphere.radius / (0.98 * Math.tan(smallerSideHalfFov));
        cameraOffset.set(0, 0, cameraDistance);
        camera.position.copy(focus).add(cameraOffset);
        camera.lookAt(focus);
        camera.updateMatrixWorld(true);
      };
      resizeStage();
      const resize = new ResizeObserver(resizeStage);
      resize.observe(element);
      let visible = true;
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      let dragging = false;
      let dragged = false;
      let lastX = 0;
      let lastY = 0;
      const down = (event: PointerEvent) => {
        if (event.button !== 0) return;
        dragging = true;
        dragged = false;
        lastX = event.clientX;
        lastY = event.clientY;
        const target = event.target;
        if (target instanceof HTMLElement) target.setPointerCapture(event.pointerId);
      };
      const move = (event: PointerEvent) => {
        if (!dragging) return;
        const dx = event.clientX - lastX;
        const dy = event.clientY - lastY;
        lastX = event.clientX;
        lastY = event.clientY;
        if (Math.abs(dx) + Math.abs(dy) > 1) dragged = true;
        cloud.quaternion.premultiply(turn.setFromAxisAngle(up, dx * 0.006));
        const nextPitch = Math.max(-0.72, Math.min(0.72, userPitch + dy * 0.005));
        cloud.quaternion.premultiply(turn.setFromAxisAngle(worldRight, nextPitch - userPitch));
        userPitch = nextPitch;
      };
      const upPointer = () => {
        if (!dragging) return;
        dragging = false;
        if (dragged) {
          suppressClick.current = true;
          window.setTimeout(() => { suppressClick.current = false; }, 0);
        }
      };
      const leave = () => { hoveredTerm.current = ""; };
      const focusIn = () => { focused.current = true; };
      const focusOut = (event: FocusEvent) => {
        if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) focused.current = false;
      };
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", upPointer);
      element.addEventListener("pointercancel", upPointer);
      element.addEventListener("pointerleave", leave);
      element.addEventListener("focusin", focusIn);
      element.addEventListener("focusout", focusOut);

      let frame = 0;
      let last = performance.now();
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) { last = now; return; }
        const delta = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!dragging && !hoveredTerm.current && !focused.current) {
          cloud.quaternion.premultiply(turn.setFromAxisAngle(up, delta * 0.025));
        }

        cloud.updateMatrixWorld(true);
        const selectedDot = dotsByTerm.get(selectedRef.current) ?? dots[0]?.dot;
        if (!selectedDot) return;
        selectedDot.getWorldPosition(selectedPosition);
        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        clusterAnchors.forEach((anchor) => {
          projected.copy(anchor.position).applyMatrix4(layer.matrixWorld);
          minX = Math.min(minX, projected.x - anchor.radius);
          maxX = Math.max(maxX, projected.x + anchor.radius);
          minY = Math.min(minY, projected.y - anchor.radius);
          maxY = Math.max(maxY, projected.y + anchor.radius);
          minZ = Math.min(minZ, projected.z - anchor.radius);
          maxZ = Math.max(maxZ, projected.z + anchor.radius);
        });
        focusTarget.set((minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2).addScaledVector(selectedPosition, 0.01);
        focus.lerp(focusTarget, 0.045);
        desiredCamera.copy(focus).add(cameraOffset);
        camera.position.lerp(desiredCamera, 0.035);
        camera.lookAt(focus);
        camera.updateMatrixWorld(true);
        cloud.updateMatrixWorld(true);

        const stageRect = element.getBoundingClientRect();
        const neighborSet = neighborTerms.current;
        clusterTopByGroup.clear();
        dots.forEach(({ point, dot }) => {
          const label = termLabels.current.get(point.term);
          if (!label) return;
          dot.getWorldPosition(projected);
          projected.project(camera);
          const isInView = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1.08 && Math.abs(projected.y) <= 1.08;
          const isSelected = point.term === selectedRef.current;
          const isNeighbor = neighborSet.has(point.term);
          const depth = Math.max(0, Math.min(1, (projected.z + 1) / 2));
          const scale = isSelected ? 1.15 : 0.85 + (1 - depth) * 0.25;
          const opacity = isSelected ? 1 : isNeighbor ? 1 - depth * 0.4 : 0.45;
          const rawX = (projected.x * 0.5 + 0.5) * stageRect.width;
          const rawY = (-projected.y * 0.5 + 0.5) * stageRect.height;
          const halfWidth = label.offsetWidth * scale / 2 + 2;
          const halfHeight = label.offsetHeight * scale / 2 + 2;
          const x = Math.max(halfWidth, Math.min(stageRect.width - halfWidth, rawX));
          const y = Math.max(halfHeight, Math.min(stageRect.height - halfHeight, rawY));
          const chipTop = y - halfHeight;
          clusterTopByGroup.set(point.group, Math.min(clusterTopByGroup.get(point.group) ?? Infinity, chipTop));
          label.style.visibility = isInView ? "visible" : "hidden";
          label.style.pointerEvents = isInView ? "auto" : "none";
          label.style.opacity = String(opacity);
          label.style.zIndex = isSelected ? "3000" : isNeighbor ? String(2000 + Math.round((1 - depth) * 100)) : String(100 + Math.round((1 - depth) * 100));
          label.style.transform = `translate3d(${x - label.offsetWidth * scale / 2}px, ${y - label.offsetHeight * scale / 2}px, 0) scale(${scale})`;
        });

        placedClusterLabels.length = 0;
        clusterAnchors.forEach((anchor) => {
          const label = clusterLabels.current.get(anchor.id);
          if (!label) return;
          projected.copy(anchor.position).applyMatrix4(layer.matrixWorld).project(camera);
          label.style.visibility = projected.z >= -1 && projected.z <= 1 ? "visible" : "hidden";
          const width = label.offsetWidth;
          const height = label.offsetHeight;
          const offsetX = anchor.id === "models" ? stageRect.width * 0.3 : 0;
          const left = Math.max(4, Math.min(stageRect.width - width - 4, (projected.x * 0.5 + 0.5) * stageRect.width + offsetX - width / 2));
          let top = (clusterTopByGroup.get(anchor.id) ?? (-projected.y * 0.5 + 0.5) * stageRect.height) - height - 7;
          let attempts = 0;
          while (placedClusterLabels.some((placed) => left < placed.right + 4 && left + width > placed.left - 4 && top < placed.bottom + 4 && top + height > placed.top - 4) && attempts < 8) {
            top -= height + 4;
            attempts += 1;
          }
          top = Math.max(4, Math.min(stageRect.height - height - 4, top));
          label.style.transform = `translate3d(${left}px, ${top}px, 0)`;
          placedClusterLabels.push({ left, top, right: left + width, bottom: top + height });
        });

        let neighborIndex = 0;
        neighborSet.forEach((term) => {
          const index = neighborIndex;
          neighborIndex += 1;
          const link = linkMeshes[index];
          if (!link) return;
          const neighborDot = dotsByTerm.get(term);
          if (!neighborDot) { link.visible = false; return; }
          selectedDot.getWorldPosition(start);
          neighborDot.getWorldPosition(end);
          direction.subVectors(end, start);
          const length = direction.length();
          link.position.copy(start).add(end).multiplyScalar(0.5);
          link.scale.y = length;
          link.quaternion.setFromUnitVectors(up, direction.normalize());
          link.visible = true;
        });
        for (let index = neighborIndex; index < linkMeshes.length; index += 1) linkMeshes[index].visible = false;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      onReady(true);

      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        element.removeEventListener("pointerdown", down);
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", upPointer);
        element.removeEventListener("pointercancel", upPointer);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("focusin", focusIn);
        element.removeEventListener("focusout", focusOut);
        clusterDots.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
        dotGeometry.dispose();
        dotMaterials.forEach((material) => material.dispose());
        linkGeometry.dispose();
        linkMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    }).catch(() => { if (!disposed) onReady(false); });

    return () => {
      disposed = true;
      cleanup();
      onReady(false);
    };
  }, [onReady, points]);

  const neighbors = new Set(nearest(points, selected).map((point) => point.term));

  return <div ref={host} className="word-map-three">
    <div ref={labelLayer} className="word-map-three-labels">
      {WORD_MAP_GROUPS.map((group) => <span
        key={group.id}
        ref={(node) => {
          if (node) clusterLabels.current.set(group.id, node);
          else clusterLabels.current.delete(group.id);
        }}
        className="word-map-three-cluster"
        data-tone={group.tone}
        aria-hidden="true"
      >{group.label}</span>)}
      {points.map((point) => {
        const group = WORD_MAP_GROUPS.find((item) => item.id === point.group)!;
        return <button
          key={point.term}
          ref={(node) => {
            if (node) termLabels.current.set(point.term, node);
            else termLabels.current.delete(point.term);
          }}
          type="button"
          className={`word-map-three-term${selected === point.term ? " is-selected" : ""}${neighbors.has(point.term) ? " is-neighbor" : ""}`}
          data-tone={group.tone}
          aria-hidden="true"
          tabIndex={-1}
          onPointerEnter={() => { hoveredTerm.current = point.term; }}
          onPointerLeave={() => { if (hoveredTerm.current === point.term) hoveredTerm.current = ""; }}
          onFocus={() => { focused.current = true; }}
          onBlur={() => { focused.current = false; }}
          onClick={(event) => {
            if (suppressClick.current) {
              suppressClick.current = false;
              event.preventDefault();
              return;
            }
            selectRef.current(point.term);
          }}
          style={{ transform: "translate3d(-10000px, -10000px, 0)" }}
        >{point.term}</button>;
      })}
    </div>
  </div>;
}
