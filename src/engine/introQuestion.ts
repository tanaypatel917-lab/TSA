import { modules } from "@/content";
import { galaxyClusters } from "@/content/galaxy";

export type GalaxyPoint = { word: string; cluster: string; x: number; y: number; z: number };
export type Landing = GalaxyPoint & { known: boolean; neighbors: string[] };

const STOP = new Set("a an and are as at be been but by can could did do does doing for from had has have how i if in into is it its just me my of on or our should so than that the their them then there these they this to too us was we were what when where which who why will with would you your about am any all get make more most much not now only some such very take use using used got go going someday ever really thing things like way lot still also actually even one".split(" "));
const ALIASES: Record<string, string> = { "a.i.": "ai", "a.i": "ai", gpt: "chatgpt", chatbots: "chatbot", jobs: "job" };

function hash(text: string, salt: number) {
  let value = 2166136261 ^ salt;
  for (const character of text) value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return value / 4294967296;
}

export const galaxy: GalaxyPoint[] = galaxyClusters.flatMap((cluster, index) => {
  const angle = (index / galaxyClusters.length) * Math.PI * 2 - Math.PI / 2;
  const cx = Math.cos(angle) * 0.64;
  const cy = Math.sin(angle) * 0.64;
  return cluster.words.map((word) => {
    const spin = hash(word, 3) * Math.PI * 2;
    const reach = 0.03 + Math.sqrt(hash(word, 5)) * 0.11;
    return { word, cluster: cluster.id, x: cx + Math.cos(spin) * reach, y: cy + Math.sin(spin) * reach, z: hash(word, 7) * 2 - 1 };
  });
});

const byWord = new Map(galaxy.map((point) => [point.word, point]));

export function contentWords(text: string, limit = 6) {
  const words = text.toLowerCase().replace(/chat\s+gpt/g, "chatgpt").match(/[a-z][a-z.']*/g) ?? [];
  const out: string[] = [];
  for (const raw of words) {
    const word = ALIASES[raw] ?? raw.replace(/['.]+$/g, "").replace(/'s$/, "");
    if (word.length < 2 && word !== "ai") continue;
    if (STOP.has(word) || out.includes(word)) continue;
    out.push(word);
    if (out.length === limit) break;
  }
  return out;
}

export function lookup(word: string) {
  const lower = ALIASES[word.toLowerCase()] ?? word.toLowerCase();
  const tries = [lower, lower.replace(/s$/, ""), lower.replace(/es$/, ""), lower.replace(/ing$/, ""), lower.replace(/ing$/, "e"), lower.replace(/ed$/, ""), lower.replace(/ed$/, "e"), lower.replace(/ly$/, "")];
  for (const attempt of tries) {
    const point = byWord.get(attempt);
    if (point) return point;
  }
  return undefined;
}

export function land(word: string, count = 3): Landing {
  const point = lookup(word);
  if (!point) {
    const angle = hash(word, 11) * Math.PI * 2;
    return { word, cluster: "new", x: Math.cos(angle) * 0.95, y: Math.sin(angle) * 0.95, z: hash(word, 13) * 2 - 1, known: false, neighbors: [] };
  }
  const neighbors = galaxy
    .filter((other) => other.word !== point.word)
    .map((other) => ({ word: other.word, gap: (other.x - point.x) ** 2 + (other.y - point.y) ** 2 + (other.cluster === point.cluster ? 0 : 1) }))
    .sort((a, b) => a.gap - b.gap || a.word.localeCompare(b.word))
    .slice(0, count)
    .map((other) => other.word);
  return { ...point, word: word.toLowerCase(), known: true, neighbors };
}

const RULES: [string[], string, string][] = [
  [["homework", "cheat", "essay", "assignment", "plagiar", "teacher", "school"], "ethics", "academic-integrity"],
  [["job", "career", "employ", "replace", "hire", "salary"], "real-world", "careers"],
  [["bias", "fair", "racis", "sexis", "discriminat", "equal"], "ethics", "fairness"],
  [["privacy", "private", "personal", "spy", "track", "safe"], "ethics", "privacy"],
  [["deepfake", "fake", "misinform", "news", "video", "photo", "image"], "ethics", "misinformation"],
  [["wrong", "true", "truth", "trust", "lie", "mistake", "hallucinat", "accurate", "error", "fact"], "foundations", "strengths-and-limits"],
  [["prompt", "ask better", "better answer"], "tools", "prompt-anatomy"],
  [["climate", "energy", "environment", "water", "planet", "electric"], "ethics", "impact"],
  [["art", "music", "draw", "creative", "song", "story", "poem"], "real-world", "creative-fields"],
  [["doctor", "health", "medic", "hospital", "sick", "disease"], "real-world", "medicine"],
  [["code", "coding", "program", "software"], "tools", "creative-and-coding-tools"],
  [["learn", "train", "know", "data", "chatgpt", "think", "understand", "language"], "foundations", "language-models"],
  [["smart", "conscious", "alive", "feel", "sentient", "robot", "danger", "take over"], "foundations", "what-is-ai"]
];

export function recommend(question: string) {
  const text = ` ${question.toLowerCase()} `;
  let best: [string, string] = ["foundations", "what-is-ai"];
  let top = 0;
  for (const [keys, moduleId, lessonId] of RULES) {
    const score = keys.filter((key) => text.includes(key)).length;
    if (score > top) { top = score; best = [moduleId, lessonId]; }
  }
  const chapter = modules.find((item) => item.id === best[0])!;
  const lesson = chapter.lessons.find((item) => item.id === best[1])!;
  return { href: `/modules/${chapter.slug}/lessons/${lesson.id}`, lesson: lesson.title, chapter: chapter.title, matched: top > 0 };
}
