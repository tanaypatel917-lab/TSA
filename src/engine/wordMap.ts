import { WORD_MAP_GROUPS, WORD_MAP_GROUP_CENTERS, type WordMapGroupId } from "@/content/wordMap";

export type WordMapPoint = { term: string; group: WordMapGroupId; x: number; y: number; z: number };

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function layoutWordMap(): WordMapPoint[] {
  return WORD_MAP_GROUPS.flatMap((group) => {
    const count = group.terms.length;
    const radius = 0.55 + 0.08 * count;
    const [centerX, centerY, centerZ] = WORD_MAP_GROUP_CENTERS[group.id];

    return group.terms.map((term, index) => {
      const y = 1 - 2 * (index + 0.5) / count;
      const horizontal = Math.sqrt(1 - y * y);
      const angle = index * GOLDEN_ANGLE;

      return {
        term,
        group: group.id,
        x: centerX + Math.cos(angle) * horizontal * radius,
        y: centerY + y * radius,
        z: centerZ + Math.sin(angle) * horizontal * radius
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
