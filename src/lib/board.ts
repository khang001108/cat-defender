import { TileType } from "./types";

export const BOARD_SIZE = 6;
export const TILE_TYPES: TileType[] = ["attack", "defense", "mana", "heal", "gold"];

export type Board = TileType[][];

export function randomTile(): TileType {
  return TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
}

export function createBoard(): Board {
  let board: Board;
  do {
    board = Array.from({ length: BOARD_SIZE }, () =>
      Array.from({ length: BOARD_SIZE }, () => randomTile())
    );
  } while (findMatches(board).length > 0 || !hasPossibleMove(board));
  return board;
}

export interface MatchGroup {
  cells: [number, number][];
  type: TileType;
}

export function findMatches(board: Board): MatchGroup[] {
  const matches: MatchGroup[] = [];
  const size = board.length;

  // Horizontal
  for (let r = 0; r < size; r++) {
    let runStart = 0;
    for (let c = 1; c <= size; c++) {
      const prev = board[r][c - 1];
      const cur = c < size ? board[r][c] : null;
      if (cur !== prev) {
        const runLen = c - runStart;
        if (runLen >= 3) {
          const cells: [number, number][] = [];
          for (let k = runStart; k < c; k++) cells.push([r, k]);
          matches.push({ cells, type: prev });
        }
        runStart = c;
      }
    }
  }

  // Vertical
  for (let c = 0; c < size; c++) {
    let runStart = 0;
    for (let r = 1; r <= size; r++) {
      const prev = board[r - 1][c];
      const cur = r < size ? board[r][c] : null;
      if (cur !== prev) {
        const runLen = r - runStart;
        if (runLen >= 3) {
          const cells: [number, number][] = [];
          for (let k = runStart; k < r; k++) cells.push([k, c]);
          matches.push({ cells, type: prev });
        }
        runStart = r;
      }
    }
  }

  return matches;
}

export function hasPossibleMove(board: Board): boolean {
  const size = board.length;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (c < size - 1) {
        const swapped = cloneBoard(board);
        swapCells(swapped, r, c, r, c + 1);
        if (findMatches(swapped).length > 0) return true;
      }
      if (r < size - 1) {
        const swapped = cloneBoard(board);
        swapCells(swapped, r, c, r + 1, c);
        if (findMatches(swapped).length > 0) return true;
      }
    }
  }
  return false;
}

export function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

export function swapCells(board: Board, r1: number, c1: number, r2: number, c2: number) {
  const tmp = board[r1][c1];
  board[r1][c1] = board[r2][c2];
  board[r2][c2] = tmp;
}

export function areAdjacent(r1: number, c1: number, r2: number, c2: number): boolean {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;
}

// Remove matched cells, drop tiles down, refill from top. Returns new board + count per type removed
// + the exact cells that were cleared (for impact-effect rendering).
export function resolveMatches(
  board: Board
): { board: Board; counts: Record<TileType, number>; clearedCells: { r: number; c: number; type: TileType }[] } {
  const size = board.length;
  const counts: Record<TileType, number> = { attack: 0, defense: 0, mana: 0, heal: 0, gold: 0 };
  const matches = findMatches(board);
  if (matches.length === 0) return { board, counts, clearedCells: [] };

  const toRemove = new Set<string>();
  const clearedCells: { r: number; c: number; type: TileType }[] = [];
  for (const m of matches) {
    for (const [r, c] of m.cells) {
      const key = `${r},${c}`;
      if (!toRemove.has(key)) {
        toRemove.add(key);
        counts[board[r][c]]++;
        clearedCells.push({ r, c, type: board[r][c] });
      }
    }
  }

  const newBoard = cloneBoard(board);
  for (const key of toRemove) {
    const [r, c] = key.split(",").map(Number);
    // mark as removed with null sentinel via empty string cast; we'll drop below
    (newBoard[r][c] as unknown) = null;
  }

  // Drop down per column
  for (let c = 0; c < size; c++) {
    const col: (TileType | null)[] = [];
    for (let r = 0; r < size; r++) col.push(newBoard[r][c] as TileType | null);
    const remaining = col.filter((v) => v !== null) as TileType[];
    const missing = size - remaining.length;
    const filled = Array.from({ length: missing }, () => randomTile()).concat(remaining);
    for (let r = 0; r < size; r++) newBoard[r][c] = filled[r];
  }

  return { board: newBoard, counts, clearedCells };
}
