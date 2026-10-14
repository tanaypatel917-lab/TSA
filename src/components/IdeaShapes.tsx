"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPreference } from "./MotionPreferences";
import "./idea-shapes.css";

const STEPS = [
  { name: "Rules", title: "Someone writes the rules.", body: "Early AI followed rules that people typed in: if this, then that. The rules are easy to check, but they break on anything nobody thought of.", example: "If it says “FREE” and has a link, call it spam." },
  { name: "Learning", title: "It learns from examples.", body: "Machine learning studies thousands of labelled examples and adjusts itself until it sorts new ones the same way. Nobody writes the rule, so it can learn the wrong one.", example: "Thousands of emails marked spam or not spam. It finds the pattern." },
  { name: "Context", title: "It reads the whole message.", body: "A large language model splits text into tokens and weighs each one against the others before it guesses what comes next. It is fluent and flexible, and it can still be confidently wrong.", example: "It reads the whole email, the sender and the tone included." }
];

const N = 48;
const INK = "#1C2A43", CLAY = "#DD8962", SKY = "#AFCBE3", LAKE = "#5F86BA", PAPER = "#F6EFE5";
type Spot = [x: number, y: number, z: number, color: string, scale: number];

const pad = (value: number) => String(value).padStart(2, "0");
const rand = (seed: number) => { const x = Math.sin(seed * 12.9898) * 43758.5453; return x - Math.floor(x); };
const quad = (x: number, y: number, color: string, out: Spot[]) => { for (const [dx, dy] of [[-0.9, 0.9], [0.9, 0.9], [-0.9, -0.9], [0.9, -0.9]]) out.push([x + dx, y + dy, 0, color, 1]); };

function rules() {
  const nodes: [number, number, string][] = [[0, 11, CLAY], [-9, 2, SKY], [9, 2, SKY], [-13.5, -7, LAKE], [-4.5, -7, CLAY], [4.5, -7, LAKE], [13.5, -7, CLAY]];
  const out: Spot[] = [];
  nodes.forEach(([x, y, color]) => quad(x, y, color, out));
  for (const [a, b] of [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]]) for (const t of [0.3, 0.5, 0.7]) out.push([nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t, nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t, 0, INK, 0.55]);
  while (out.length < N) out.push([0, 11, 0, CLAY, 0]);
  return out;
}

function learning() {
  return Array.from({ length: N }, (_, index): Spot => {
    const side = index % 2 ? 1 : -1, angle = rand(index) * Math.PI * 2, radius = 2 + rand(index + 99) * 6.5;
    return [side * 8 + Math.cos(angle) * radius, -side * 2 + Math.sin(angle) * radius * 0.9, (rand(index + 7) - 0.5) * 8, side < 0 ? CLAY : SKY, 1];
  });
}

function context() {
  const out: Spot[] = [];
  quad(0, 0, CLAY, out);
  for (let k = 0; k < 11; k += 1) { const angle = (k / 11) * Math.PI * 2 + 0.3; quad(Math.cos(angle) * 13, Math.sin(angle) * 10, [SKY, LAKE, PAPER][k % 3], out); }
  return out;
}

export function IdeaShapes() {
  const [step, setStep] = useState(0);
  const [touched, setTouched] = useState(false);
  const [on, setOn] = useState(false);
  const host = useRef<HTMLDivElement>(null);
  const stepRef = useRef(0);
  const { reduced } = useMotionPreference();

  useEffect(() => { stepRef.current = step; }, [step]);

  useEffect(() => {
    const element = host.current;
    if (touched || reduced || !element) return;
    let visible = false;
    const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
    seen.observe(element);
    const timer = window.setInterval(() => { if (visible) setStep((value) => (value + 1) % STEPS.length); }, 5200);
    return () => { window.clearInterval(timer); seen.disconnect(); };
  }, [touched, reduced]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch { return; }
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
      element.prepend(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 1, 300);
      camera.position.set(0, 0, 66);
      scene.add(new THREE.HemisphereLight("#ffffff", INK, 2.2));
      const sun = new THREE.DirectionalLight("#ffffff", 2.4);
      sun.position.set(-30, 40, 60);
      scene.add(sun);
      const group = new THREE.Group();
      scene.add(group);
      const shapes = [rules(), learning(), context()];
      const cube = new THREE.BoxGeometry(1.6, 1.6, 1.6);
      const flat = new THREE.PlaneGeometry(1.6, 1.6);
      const material = new THREE.MeshLambertMaterial({ color: "#ffffff" });
      const shade = new THREE.MeshBasicMaterial({ color: INK });
      const mesh = new THREE.InstancedMesh(cube, material, N);
      const shadow = new THREE.InstancedMesh(flat, shade, N);
      group.add(shadow, mesh);
      const bar = new THREE.BoxGeometry(0.35, 26, 0.35);
      const divider = new THREE.Mesh(bar, shade);
      divider.rotation.z = -0.245;
      divider.scale.y = 0.001;
      group.add(divider);
      const points: number[] = [];
      for (let k = 0; k < 11; k += 1) { const corner = shapes[2][4 + k * 4]; points.push(0, 0, -0.5, corner[0] + 0.9, corner[1] - 0.9, -0.5); }
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 });
      group.add(new THREE.LineSegments(lineGeometry, lineMaterial));
      const current = shapes[0].map(([x, y, z, color]) => ({ x, y, z, s: reduced ? 1 : 0, color: new THREE.Color(color) }));
      current.forEach((cell, index) => mesh.setColorAt(index, cell.color));
      const target = new THREE.Color();
      const dummy = new THREE.Object3D();
      let shown = -1;

      const size = () => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(1, height);
        camera.position.z = camera.aspect < 1.1 ? 66 * (1.1 / camera.aspect) : 66;
        camera.updateProjectionMatrix();
        shown = -1;
      };
      size();
      const resize = new ResizeObserver(size);
      resize.observe(element);

      const zone = element.closest(".idea-shapes") ?? element;
      let tx = 0, ty = 0, visible = true;
      const move = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = element.getBoundingClientRect();
        tx = Math.max(-1, Math.min(1, ((clientX - rect.left) / rect.width) * 2 - 1));
        ty = Math.max(-1, Math.min(1, -((clientY - rect.top) / rect.height) * 2 + 1));
      };
      const leave = () => { tx = ty = 0; };
      zone.addEventListener("pointermove", move);
      zone.addEventListener("pointerleave", leave);
      const seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
      seen.observe(element);

      let frame = 0;
      const loop = (now: number) => {
        frame = requestAnimationFrame(loop);
        const active = stepRef.current;
        if (!visible || (reduced && shown === active)) return;
        shown = active;
        const goal = shapes[active];
        const time = now / 1000;
        const k = reduced ? 1 : 0.075;
        group.rotation.y += ((reduced ? 0 : tx * 0.45 + Math.sin(time * 0.35) * 0.18) - group.rotation.y) * (reduced ? 1 : 0.05);
        group.rotation.x += ((reduced ? 0 : -ty * 0.25) - group.rotation.x) * (reduced ? 1 : 0.05);
        current.forEach((cell, index) => {
          const [x, y, z, color, scale] = goal[index];
          const lag = reduced ? 1 : Math.min(1, k * (1 + (index % 6) * 0.15));
          cell.x += (x - cell.x) * lag; cell.y += (y - cell.y) * lag; cell.z += (z - cell.z) * lag; cell.s += (scale - cell.s) * lag;
          cell.color.lerp(target.set(color), lag);
          const bob = reduced ? 0 : Math.sin(time * 1.4 + index * 0.7) * 0.25;
          dummy.position.set(cell.x, cell.y + bob, cell.z);
          dummy.scale.setScalar(Math.max(0.001, cell.s));
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
          mesh.setColorAt(index, cell.color);
          dummy.position.set(cell.x + 0.55, cell.y + bob - 0.55, cell.z - 1.2);
          dummy.updateMatrix();
          shadow.setMatrixAt(index, dummy.matrix);
        });
        mesh.instanceMatrix.needsUpdate = true;
        mesh.instanceColor!.needsUpdate = true;
        shadow.instanceMatrix.needsUpdate = true;
        divider.scale.y += ((active === 1 ? 1 : 0.001) - divider.scale.y) * k;
        lineMaterial.opacity += ((active === 2 ? 0.5 : 0) - lineMaterial.opacity) * k;
        renderer.render(scene, camera);
      };
      frame = requestAnimationFrame(loop);
      setOn(true);
      cleanup = () => {
        cancelAnimationFrame(frame);
        resize.disconnect();
        seen.disconnect();
        zone.removeEventListener("pointermove", move);
        zone.removeEventListener("pointerleave", leave);
        [cube, flat, bar, lineGeometry].forEach((geometry) => geometry.dispose());
        [material, shade, lineMaterial].forEach((item) => item.dispose());
        mesh.dispose();
        shadow.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });
    return () => { disposed = true; cleanup(); setOn(false); };
  }, [reduced]);

  const active = STEPS[step];
  return <section className="idea-shapes" aria-labelledby="idea-title" onPointerEnter={() => setTouched(true)} onFocus={() => setTouched(true)}>
    <div className="shell idea-inner">
      <div className="idea-copy">
        <p className="section-index">How a machine gets an idea</p>
        <h2 id="idea-title">One question.<br /><span>Three kinds of AI.</span></h2>
        <div className="idea-tabs" role="group" aria-label="Choose a kind of AI">{STEPS.map((item, index) => <button key={item.name} type="button" aria-pressed={index === step} onClick={() => { setTouched(true); setStep(index); }}><small>{pad(index + 1)}</small>{item.name}</button>)}</div>
        <div className="idea-panel" aria-live={touched ? "polite" : "off"}>
          <h3>{active.title}</h3>
          <p>{active.body}</p>
          <p className="idea-example"><b>Is this email spam?</b>{active.example}</p>
        </div>
      </div>
      <div ref={host} className="idea-stage" data-on={on} aria-hidden="true"><p className="idea-stage-label">{pad(step + 1)} / {active.name}</p><p className="idea-flat">{pad(step + 1)}</p></div>
    </div>
  </section>;
}
