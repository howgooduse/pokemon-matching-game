import { computed, ref, type ComputedRef } from 'vue';
import type { BoardTile } from '@/types/link';
import { shuffle } from '@/utils/array';
import { pickRandomPokemonIds } from '@/utils/pokemon';
import { PathFinder, type PathResult, type Position } from '@/utils/pathFinder';

/** SVG 連線座標系中每格的大小 */
const CELL_SIZE = 80;
/** 重排時最多嘗試幾次以確保有可配對的組合 */
const MAX_SHUFFLE_ATTEMPTS = 20;

const isActiveTile = (tile: BoardTile) => !tile.isMatched && !tile.isEmpty;

/** 連連看棋盤：方塊、選取、提示、連線與路徑判斷 */
export function useLinkBoard(rows: ComputedRef<number>, cols: ComputedRef<number>) {
  const tiles = ref<BoardTile[]>([]);
  const selectedIndices = ref<number[]>([]);
  const hintIndices = ref<number[]>([]);
  const connectionPath = ref('');
  const connectionPoints = ref<{ x: number; y: number }[]>([]);

  let pathFinder = new PathFinder(rows.value, cols.value);

  const boardWidth = computed(() => cols.value * CELL_SIZE);
  const boardHeight = computed(() => rows.value * CELL_SIZE);
  const boardGridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
    gridTemplateRows: `repeat(${rows.value}, 1fr)`,
  }));

  const updatePathFinder = (): void => {
    const occupied = new Set<number>();
    tiles.value.forEach((tile, index) => {
      if (isActiveTile(tile)) occupied.add(index);
    });
    pathFinder.updateBoard(occupied);
  };

  const findPath = (from: number, to: number): PathResult => pathFinder.findPath(from, to);

  /** 找出一組目前可連線的方塊；沒有則回傳 null */
  const findMatchablePair = (): [number, number] | null => {
    const groups = new Map<number, number[]>();
    tiles.value.forEach((tile, index) => {
      if (!isActiveTile(tile)) return;
      const group = groups.get(tile.pokemonId);
      if (group) group.push(index);
      else groups.set(tile.pokemonId, [index]);
    });

    for (const indices of groups.values()) {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          const a = indices[i]!;
          const b = indices[j]!;
          if (pathFinder.findPath(a, b).found) return [a, b];
        }
      }
    }
    return null;
  };

  const hasAvailableMatches = (): boolean => findMatchablePair() !== null;
  const hasRemainingTiles = (): boolean => tiles.value.some(isActiveTile);

  const clearConnection = (): void => {
    connectionPath.value = '';
    connectionPoints.value = [];
  };

  /** 重新排列未配對的方塊，並盡量確保排列後仍有可配對組合 */
  const shuffleTiles = (): void => {
    const positions: number[] = [];
    const active: BoardTile[] = [];
    tiles.value.forEach((tile, index) => {
      if (isActiveTile(tile)) {
        positions.push(index);
        active.push(tile);
      }
    });
    if (active.length === 0) return;

    for (let attempt = 0; attempt < MAX_SHUFFLE_ATTEMPTS; attempt++) {
      const shuffled = shuffle(active);
      const next = [...tiles.value];
      positions.forEach((pos, i) => (next[pos] = { ...shuffled[i]! }));
      tiles.value = next;
      updatePathFinder();
      if (hasAvailableMatches()) break;
    }

    selectedIndices.value = [];
  };

  const initBoard = (): void => {
    const totalCells = rows.value * cols.value;
    const pairs = Math.floor(totalCells / 2);

    const newTiles: BoardTile[] = pickRandomPokemonIds(pairs).flatMap((pokemonId) => [
      { pokemonId, isMatched: false, isEmpty: false },
      { pokemonId, isMatched: false, isEmpty: false },
    ]);
    // 格子數為奇數時補一個空格
    while (newTiles.length < totalCells) {
      newTiles.push({ pokemonId: 0, isMatched: false, isEmpty: true });
    }

    tiles.value = shuffle(newTiles);
    pathFinder = new PathFinder(rows.value, cols.value);
    updatePathFinder();
    if (!hasAvailableMatches()) shuffleTiles();

    selectedIndices.value = [];
    hintIndices.value = [];
    clearConnection();
  };

  const drawConnectionPath = (path: Position[]): void => {
    const points = path.map((pos) => ({
      x: (pos.col + 0.5) * CELL_SIZE,
      y: (pos.row + 0.5) * CELL_SIZE,
    }));
    connectionPath.value = points.map(({ x, y }) => `${x},${y}`).join(' ');
    connectionPoints.value = points;
  };

  return {
    tiles,
    selectedIndices,
    hintIndices,
    connectionPath,
    connectionPoints,
    boardWidth,
    boardHeight,
    boardGridStyle,
    initBoard,
    updatePathFinder,
    findPath,
    findMatchablePair,
    hasAvailableMatches,
    hasRemainingTiles,
    shuffleTiles,
    drawConnectionPath,
    clearConnection,
  };
}
