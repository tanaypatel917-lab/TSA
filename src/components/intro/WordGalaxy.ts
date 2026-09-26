import { introPalette } from "@/content/intro";
import { galaxyClusters } from "@/content/galaxy";
import { galaxy, type Landing } from "@/engine/introQuestion";
import { clamp, easeOutCubic, lerp } from "@/engine/introStory";

type Placed = { word: string; x: number; y: number; z: number };
type Visitor = Landing & { at: number };

const { ink, clay, paper, sky } = introPalette;
const FOCAL = 2.4;
const DEPTH = 0.28;
const centroids = galaxyClusters.map((cluster) => {
  const points = galaxy.filter((point) => point.cluster === cluster.id);
  return { label: cluster.label, x: points.reduce((sum, point) => sum + point.x, 0) / points.length, y: points.reduce((sum, point) => sum + point.y, 0) / points.length };
});

export class WordGalaxy {
  private readonly context: CanvasRenderingContext2D | null;
  private visitors: Visitor[] = [];
  private width = 0;
  private height = 0;
  private scale = 1;
  private cleared = true;
  private family = "sans-serif";
  private launchAt = -1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.context = canvas.getContext("2d");
  }

  resize() {
    const box = this.canvas.getBoundingClientRect();
    this.scale = Math.min(2, window.devicePixelRatio || 1);
    this.width = box.width;
    this.height = box.height;
    this.canvas.width = Math.round(box.width * this.scale);
    this.canvas.height = Math.round(box.height * this.scale);
    this.family = getComputedStyle(this.canvas).getPropertyValue("--galaxy-font").trim() || "sans-serif";
    this.cleared = false;
  }

  setWords(landings: readonly Landing[], now: number) {
    this.visitors = landings.map((landing) => this.visitors.find((item) => item.word === landing.word) ?? { ...landing, at: now });
  }

  render(dive: number, time: number, reduced: boolean, step = 3) {
    const context = this.context;
    if (!context) return;
    if (!this.width) this.resize();
    if (dive <= 0.001) {
      if (!this.cleared) { context.clearRect(0, 0, this.canvas.width, this.canvas.height); this.cleared = true; }
      return;
    }
    this.cleared = false;
    const { width: w, height: h } = this;
    context.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    context.clearRect(0, 0, w, h);
    const compact = w < 1024 || w / h < 1.15;
    const cx = compact ? w / 2 : w * 0.66;
    const cy = compact ? h * 0.29 : h * 0.52;
    const radius = compact ? Math.min(w * 0.46, h * 0.25) : Math.min(w * 0.33, h * 0.45);
    const fly = reduced ? 1 : easeOutCubic(dive);
    const zoom = lerp(0.18, 1, fly);
    const angle = reduced ? 0 : Math.sin(time * 0.18) * 0.22 + (1 - fly) * 1.4;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const project = (x: number, y: number, z: number) => {
      const rx = x * cos - z * DEPTH * sin;
      const rz = x * sin + z * DEPTH * cos;
      const k = FOCAL / (FOCAL + rz);
      return { x: cx + rx * radius * zoom * k, y: cy + y * radius * zoom * k, k, depth: rz };
    };
    context.globalAlpha = dive;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = `700 ${compact ? 9 : 11}px ${this.family}`;
    if (step < 2) this.launchAt = -1;
    else if (this.launchAt < 0) this.launchAt = time;
    const faint = step === 0 ? 0.22 : 1;
    const taken: [number, number, number, number][] = [];
    if (step >= 1) for (const centroid of centroids) {
      const spot = project(centroid.x * 1.32, centroid.y * 1.32, 0);
      const half = context.measureText(centroid.label.toUpperCase()).width / 2 + 6;
      taken.push([spot.x - half, spot.y - 10, spot.x + half, spot.y + 10]);
      context.fillStyle = `rgba(175, 203, 227, ${(step === 1 ? 1 : 0.75) * dive})`;
      context.fillText(centroid.label.toUpperCase(), spot.x, spot.y);
    }
    const placed: Placed[] = galaxy.map((point) => ({ word: point.word, x: point.x, y: point.y, z: point.z }));
    const landed = step < 2 ? [] : this.visitors.map((visitor) => {
      const progress = reduced ? 1 : clamp((time - Math.max(visitor.at, this.launchAt)) / 1.4);
      const ease = 1 - Math.pow(1 - progress, 3);
      return { visitor, progress, x: lerp(-1.6, visitor.x, ease), y: lerp(-1.2, visitor.y, ease), z: lerp(-0.9, visitor.z, ease) };
    });
    const spots = placed.map((item) => ({ item, ...project(item.x, item.y, item.z) })).sort((a, b) => b.depth - a.depth);
    const find = (word: string) => spots.find((spot) => spot.item.word === word);
    context.lineWidth = 1.5;
    context.setLineDash([4, 5]);
    for (const { visitor, progress, x, y, z } of landed) {
      if (progress < 0.85) continue;
      const from = project(x, y, z);
      for (const neighbor of visitor.neighbors) {
        const to = find(neighbor);
        if (!to) continue;
        context.strokeStyle = sky;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.stroke();
      }
    }
    context.setLineDash([]);
    const highlighted = new Set(landed.flatMap(({ visitor, progress }) => (progress >= 0.85 ? visitor.neighbors : [])));
    const labelled = new Set<string>();
    if (step >= 1) for (const spot of [...spots].reverse()) {
      if (highlighted.has(spot.item.word)) continue;
      const size = (compact ? 9 : 11) * (0.8 + clamp((spot.k - 0.8) * 2.2, 0, 1) * 0.35);
      context.font = `500 ${size.toFixed(1)}px ${this.family}`;
      const box: [number, number, number, number] = [spot.x - 3, spot.y - size * 0.7, spot.x + 7 + context.measureText(spot.item.word).width, spot.y + size * 0.7];
      if (taken.some((other) => box[0] < other[2] && box[2] > other[0] && box[1] < other[3] && box[3] > other[1])) continue;
      taken.push(box);
      labelled.add(spot.item.word);
    }
    for (const spot of spots) {
      if (highlighted.has(spot.item.word)) continue;
      this.star(labelled.has(spot.item.word) ? spot.item.word : "", spot.x, spot.y, spot.k, compact, dive * faint);
    }
    for (const spot of spots) if (highlighted.has(spot.item.word)) this.tag(spot.item.word, spot.x, spot.y, spot.k, compact, "near", dive);
    for (const { visitor, progress, x, y, z } of landed) {
      const spot = project(x, y, z);
      const pulse = reduced ? 0 : Math.sin(time * 3) * 0.04;
      this.tag(visitor.word, spot.x, spot.y, spot.k * (1.35 + pulse) * lerp(1.6, 1, progress), compact, visitor.known ? "user" : "new", dive);
    }
    if (step === 0) this.card(cx, cy, compact, dive);
    context.globalAlpha = 1;
  }

  private card(x: number, y: number, compact: boolean, dive: number) {
    const context = this.context!;
    const featured = this.visitors.find((visitor) => visitor.known) ?? this.visitors[0];
    if (!featured) return;
    const size = compact ? 22 : 34;
    const numbers = `[ ${featured.x.toFixed(2)}, ${(-featured.y).toFixed(2)}, … ]`;
    context.font = `700 ${size}px ${this.family}`;
    const wordWidth = context.measureText(featured.word).width;
    context.font = `600 ${size * 0.5}px ${this.family}`;
    const numberWidth = context.measureText(numbers).width;
    const width = Math.max(wordWidth, numberWidth) + size * 1.4;
    const height = size * 2.6;
    context.globalAlpha = dive;
    context.fillStyle = "rgba(28, 42, 67, 0.3)";
    context.fillRect(x - width / 2 + 6, y - height / 2 + 6, width, height);
    context.fillStyle = clay;
    context.fillRect(x - width / 2, y - height / 2, width, height);
    context.strokeStyle = ink;
    context.lineWidth = 2;
    context.strokeRect(x - width / 2, y - height / 2, width, height);
    context.fillStyle = ink;
    context.font = `700 ${size}px ${this.family}`;
    context.fillText(featured.word, x, y - size * 0.42);
    context.font = `600 ${size * 0.5}px ${this.family}`;
    context.fillText(numbers, x, y + size * 0.62);
  }

  private star(word: string, x: number, y: number, k: number, compact: boolean, dive: number) {
    const context = this.context!;
    const near = clamp((k - 0.8) * 2.2, 0, 1);
    context.globalAlpha = (0.3 + near * 0.6) * dive;
    context.fillStyle = paper;
    context.beginPath();
    context.arc(x, y, 1.6 + near * 1.4, 0, Math.PI * 2);
    context.fill();
    if (!word) { context.globalAlpha = dive; return; }
    const size = (compact ? 9 : 11) * (0.8 + near * 0.35);
    context.font = `500 ${size.toFixed(1)}px ${this.family}`;
    context.textAlign = "left";
    context.fillText(word, x + 5, y);
    context.textAlign = "center";
    context.globalAlpha = dive;
  }

  private tag(word: string, x: number, y: number, k: number, compact: boolean, style: "near" | "user" | "new", dive: number) {
    const context = this.context!;
    const size = (compact ? 10 : 12.5) * k;
    context.font = `700 ${size.toFixed(1)}px ${this.family}`;
    const text = style === "new" ? `${word} ?` : word;
    const padX = size * 0.55;
    const width = context.measureText(text).width + padX * 2;
    const height = size * 1.75;
    context.globalAlpha = dive;
    context.fillStyle = "rgba(28, 42, 67, 0.28)";
    context.fillRect(x - width / 2 + 2, y - height / 2 + 2, width, height);
    context.fillStyle = style === "user" ? clay : style === "near" ? sky : paper;
    context.fillRect(x - width / 2, y - height / 2, width, height);
    if (style === "user" || style === "new") {
      context.strokeStyle = ink;
      context.lineWidth = 1.5;
      context.strokeRect(x - width / 2, y - height / 2, width, height);
    }
    context.beginPath();
    context.moveTo(x + width / 2 - height * 0.42, y - height / 2);
    context.lineTo(x + width / 2, y - height / 2 + height * 0.42);
    context.lineTo(x + width / 2, y - height / 2);
    context.closePath();
    context.fillStyle = "rgba(74, 104, 146, 0.9)";
    context.fill();
    context.fillStyle = ink;
    context.fillText(text, x, y + size * 0.04);
    context.globalAlpha = dive;
  }
}
