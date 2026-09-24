export const SCORES_KEY = "wordplay:scores:v1";
export type ScoreEntry = { score: number; stars: number; day: string; at: number };
type Boards = Record<string, ScoreEntry[]>;
type Store = Pick<Storage, "getItem" | "setItem">;

const BOARD_SIZE = 5;

function read(storage: Store): Boards {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(SCORES_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Boards : {};
  } catch {
    return {};
  }
}

export function boardKey(moduleId: string, mode: string) {
  return `${moduleId}:${mode}`;
}

export function readBoard(key: string, storage: Store = window.localStorage) {
  const board = read(storage)[key];
  return Array.isArray(board) ? board.filter((entry) => typeof entry?.score === "number") : [];
}

export function recordScore(key: string, entry: ScoreEntry, storage: Store = window.localStorage) {
  const boards = read(storage);
  const board = [...(Array.isArray(boards[key]) ? boards[key] : []), entry].sort((a, b) => b.score - a.score || a.at - b.at).slice(0, BOARD_SIZE);
  const rank = board.indexOf(entry);
  try { storage.setItem(SCORES_KEY, JSON.stringify({ ...boards, [key]: board })); } catch {}
  return { board, rank: rank >= 0 ? rank + 1 : null };
}
