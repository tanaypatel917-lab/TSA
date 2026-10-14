import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapGroupId } from "@/content/wordMap";
import { random } from "@/engine/labs";

export type WordMapPoint = { term: string; group: WordMapGroupId; x: number; y: number; z: number };

export function layoutWordMap(): WordMapPoint[] {
  const next = random(4);
  const jitter = (amount: number) => (next() * 2 - 1) * amount;

  return WORD_MAP_GROUPS.flatMap((group) => {
    const count = group.terms.length;
    const [centerX, centerY, centerZ] = WORD_MAP_GROUP_CENTERS[group.id];
    const columns = 2;
    const rows = Math.ceil(count / columns);

    return group.terms.map((term, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);

      return {
        term,
        group: group.id,
        x: centerX + (column - (columns - 1) / 2) * 1.25 + (row % 2 ? 0.15 : 0) + jitter(0.06),
        y: centerY + ((rows - 1) / 2 - row) * 0.38 + jitter(0.06),
        z: centerZ + jitter(0.4)
      };
    });
  });
}

export function nearest(points: WordMapPoint[], term: string, k = 3): WordMapPoint[] {
  const selected = points.find((point) => point.term === term);
  if (!selected || k <= 0) return [];

  return points
    .filter((point) => point.term !== term)
    .map((point) => ({
      point,
      distance: Math.hypot(point.x - selected.x, point.y - selected.y, point.z - selected.z)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, k)
    .map(({ point }) => point);
}
