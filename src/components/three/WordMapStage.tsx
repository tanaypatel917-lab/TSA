"use client";

import { useEffect, useRef } from "react";
import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapTone } from "@/content/wordMap";
import { random } from "@/engine/labs";
import { nearest, type WordMapPoint } from "@/engine/wordMap";

const INK = "#1C2A43";
const COLORS: Record<WordMapTone, string> = {
  sky: "#AFCBE3",
  clay: "#DD8962",
  lake: "#5F86BA",
  ink: INK
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

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
  const focused = useRef(false);
  const suppressClick = useRef(false);

  useEffect(() => {
    selectedRef.current = selected;
    neighborTerms.current = new Set(nearest(points, selected).map((point) => point.term));
  }, [points, selected]);
  useEffect(() => { selectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const element = host.current;
    const labels = labelLayer.current;
    if (!element || !labels) return;
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
      element.insertBefore(renderer.domElement, labels);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
      const bounds = new THREE.Box3();
      points.forEach((point) => bounds.expandByPoint(new THREE.Vector3(point.x, point.y, point.z)));
      const boundsCenter = bounds.getCenter(new THREE.Vector3());
      const boundsSize = bounds.getSize(new THREE.Vector3());
      const cloud = new THREE.Group();
      cloud.position.copy(boundsCenter);
      cloud.rotation.order = "YXZ";
      scene.add(cloud);
      const content = new THREE.Group();
      content.position.copy(boundsCenter).negate();
      cloud.add(content);

      const clusterDots: { geometry: InstanceType<typeof THREE.BufferGeometry>; material: InstanceType<typeof THREE.PointsMaterial> }[] = [];
      const nextDot = random(9187);
      const clusterAnchors = WORD_MAP_GROUPS.map((group) => {
        const members = points.filter((point) => point.group === group.id);
        const center = WORD_MAP_GROUP_CENTERS[group.id];
        const positions: number[] = [];
        for (let index = 0; index < 56; index += 1) {
          positions.push(
            center[0] + (nextDot() - 0.5) * 1.9,
            center[1] + (nextDot() - 0.5) * 0.76,
            center[2] + (nextDot() - 0.5) * 0.76
          );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        const material = new THREE.PointsMaterial({
          color: COLORS[group.tone],
          size: 0.035,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.2,
          depthWrite: false
        });
        content.add(new THREE.Points(geometry, material));
        clusterDots.push({ geometry, material });
        return {
          id: group.id,
          position: new THREE.Vector3(
            Math.min(...members.map((point) => point.x)),
            Math.max(...members.map((point) => point.y)) + 0.32,
            center[2]
          )
        };
      });

      const positionsByTerm = new Map(points.map((point) => [
        point.term,
        new THREE.Vector3(point.x, point.y, point.z)
      ]));
      const linkGeometry = new THREE.CylinderGeometry(0.009, 0.009, 1, 6, 1);
      const linkMaterial = new THREE.MeshBasicMaterial({ color: INK, transparent: true, opacity: 0.8, depthWrite: false });
      const linkMeshes = Array.from({ length: 3 }, () => {
        const link = new THREE.Mesh(linkGeometry, linkMaterial);
        link.visible = false;
        content.add(link);
        return link;
      });
      const direction = new THREE.Vector3();
      const start = new THREE.Vector3();
      const end = new THREE.Vector3();
      const projected = new THREE.Vector3();
      const desiredRotation = new THREE.Euler();
      const focus = boundsCenter.clone();
      focus.y += boundsSize.y * 0.05;
      let cameraDistance = 0;

      const resizeStage = () => {
        const { width, height } = element.getBoundingClientRect();
        if (width <= 0 || height <= 0) return;
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const verticalHalfFov = THREE.MathUtils.degToRad(camera.fov / 2);
        const horizontalHalfFov = Math.atan(Math.tan(verticalHalfFov) * camera.aspect);
        const projectedWidth = boundsSize.x + boundsSize.z * 0.2;
        const projectedHeight = boundsSize.y + boundsSize.z * 0.12;
        const distanceForWidth = projectedWidth / (2 * Math.tan(horizontalHalfFov) * 0.85);
        const distanceForHeight = projectedHeight / (2 * Math.tan(verticalHalfFov) * 0.85);
        cameraDistance = Math.max(distanceForWidth, distanceForHeight) + boundsSize.z * 0.12;
        camera.position.set(focus.x, focus.y, focus.z + cameraDistance);
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
      let hovering = false;
      let lastX = 0;
      let lastY = 0;
      let targetYaw = 0;
      let targetPitch = 0;
      const down = (event: PointerEvent) => {
        if (event.button !== 0) return;
        dragging = true;
        dragged = false;
        lastX = event.clientX;
        lastY = event.clientY;
        targetYaw = cloud.rotation.y;
        targetPitch = cloud.rotation.x;
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
        targetYaw = clamp(targetYaw + dx * 0.0035, -0.35, 0.35);
        targetPitch = clamp(targetPitch + dy * 0.002, -0.2, 0.2);
      };
      const upPointer = () => {
        if (!dragging) return;
        dragging = false;
        if (dragged) {
          suppressClick.current = true;
          window.setTimeout(() => { suppressClick.current = false; }, 0);
        }
      };
      const enter = () => { hovering = true; };
      const leave = () => { hovering = false; };
      const focusIn = () => { focused.current = true; };
      const focusOut = (event: FocusEvent) => {
        if (!(event.relatedTarget instanceof Node) || !element.contains(event.relatedTarget)) focused.current = false;
      };
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", upPointer);
      element.addEventListener("pointercancel", upPointer);
      element.addEventListener("pointerenter", enter);
      element.addEventListener("pointerleave", leave);
      element.addEventListener("focusin", focusIn);
      element.addEventListener("focusout", focusOut);

      const startedAt = performance.now();
      let frame = 0;
      let last = startedAt;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        if (!visible) { last = now; return; }
        const delta = Math.min(0.05, (now - last) / 1000);
        last = now;
        const isPaused = dragging || hovering || focused.current;
        const swayYaw = dragging ? targetYaw : isPaused ? cloud.rotation.y : 0.12 * Math.sin((now - startedAt) * Math.PI * 2 / 12000);
        const swayPitch = dragging ? targetPitch : isPaused ? cloud.rotation.x : 0;
        desiredRotation.set(swayPitch, swayYaw, 0, "YXZ");
        const damping = 1 - Math.exp(-delta * 8);
        cloud.rotation.x += (desiredRotation.x - cloud.rotation.x) * damping;
        cloud.rotation.y += (desiredRotation.y - cloud.rotation.y) * damping;
        cloud.rotation.z += (desiredRotation.z - cloud.rotation.z) * damping;
        cloud.updateMatrixWorld(true);

        const stageRect = element.getBoundingClientRect();
        const neighborSet = neighborTerms.current;
        points.forEach((point) => {
          const label = termLabels.current.get(point.term);
          const position = positionsByTerm.get(point.term);
          if (!label || !position) return;
          projected.copy(position).sub(boundsCenter);
          cloud.localToWorld(projected);
          projected.project(camera);
          const isInView = projected.z >= -1 && projected.z <= 1 && Math.abs(projected.x) <= 1.08 && Math.abs(projected.y) <= 1.08;
          const isSelected = point.term === selectedRef.current;
          const depth = clamp((projected.z + 1) / 2, 0, 1);
          const scale = 1.05 - depth * 0.15;
          const rawX = (projected.x * 0.5 + 0.5) * stageRect.width;
          const rawY = (-projected.y * 0.5 + 0.5) * stageRect.height;
          const x = clamp(rawX, label.offsetWidth * scale / 2 + 2, stageRect.width - label.offsetWidth * scale / 2 - 2);
          const y = clamp(rawY, label.offsetHeight * scale / 2 + 2, stageRect.height - label.offsetHeight * scale / 2 - 2);
          label.style.visibility = isInView ? "visible" : "hidden";
          label.style.pointerEvents = isInView ? "auto" : "none";
          label.style.zIndex = isSelected ? "3000" : String(100 + Math.round((1 - depth) * 1000) + (neighborSet.has(point.term) ? 1000 : 0));
          label.style.transform = `translate3d(${x - label.offsetWidth / 2}px, ${y - label.offsetHeight / 2}px, 0) scale(${scale})`;
        });

        clusterAnchors.forEach((anchor) => {
          const label = clusterLabels.current.get(anchor.id);
          if (!label) return;
          projected.copy(anchor.position).sub(boundsCenter);
          cloud.localToWorld(projected);
          projected.project(camera);
          label.style.visibility = projected.z >= -1 && projected.z <= 1 ? "visible" : "hidden";
          const width = label.offsetWidth;
          const height = label.offsetHeight;
          const left = clamp((projected.x * 0.5 + 0.5) * stageRect.width, 4, stageRect.width - width - 4);
          const top = clamp((-projected.y * 0.5 + 0.5) * stageRect.height - height - 4, 4, stageRect.height - height - 4);
          label.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        });

        let neighborIndex = 0;
        neighborSet.forEach((term) => {
          const link = linkMeshes[neighborIndex];
          const neighborPosition = positionsByTerm.get(term);
          neighborIndex += 1;
          if (!link || !neighborPosition) return;
          const selectedPosition = positionsByTerm.get(selectedRef.current);
          if (!selectedPosition) { link.visible = false; return; }
          start.copy(selectedPosition);
          end.copy(neighborPosition);
          direction.subVectors(end, start);
          const length = direction.length();
          link.position.copy(start).add(end).multiplyScalar(0.5);
          link.scale.y = length;
          link.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
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
        element.removeEventListener("pointerenter", enter);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("focusin", focusIn);
        element.removeEventListener("focusout", focusOut);
        clusterDots.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
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
        const isSelected = selected === point.term;
        const isNeighbor = neighbors.has(point.term);
        return <button
          key={point.term}
          ref={(node) => {
            if (node) termLabels.current.set(point.term, node);
            else termLabels.current.delete(point.term);
          }}
          type="button"
          className={`word-map-three-term${isSelected ? " is-selected" : ""}${isNeighbor ? " is-neighbor" : ""}${!isSelected && !isNeighbor ? " is-muted" : ""}`}
          data-tone={group.tone}
          aria-hidden="true"
          tabIndex={-1}
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
