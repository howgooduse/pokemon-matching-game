import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { Tile } from '@/types/game.types';
import { PathFinder } from '@/utils/pathFinder';

interface UseGameBoardReturn {
  tiles: Ref<Tile[]>;
  selectedIndices: Ref<number[]>;
  hintIndices: Ref<number[]>;
  connectionPath: Ref<string>;
  connectionPoints: Ref<{ x: number; y: number }[]>;
  boardRef: Ref<HTMLElement | null>;
  boardWidth: ComputedRef<number>;
  boardHeight: ComputedRef<number>;
  boardGridStyle: ComputedRef<{
    gridTemplateColumns: string;
    gridTemplateRows: string;
  }>;
  initBoard: () => void;
  updatePathFinder: () => void;
  drawConnectionPath: (path: any[]) => void;
  hasAvailableMatches: () => boolean;
  shuffleTiles: () => Promise<void>;
  findMatchablePair: () => [number, number] | null;
  getPathFinder: () => PathFinder;
}

export function useGameBoard(
  rows: ComputedRef<number>,
  cols: ComputedRef<number>
): UseGameBoardReturn {
  const tiles = ref<Tile[]>([]);
  const selectedIndices = ref<number[]>([]);
  const hintIndices = ref<number[]>([]);
  const connectionPath = ref<string>('');
  const connectionPoints = ref<{ x: number; y: number }[]>([]);
  const boardRef = ref<HTMLElement | null>(null);

  let pathFinder: PathFinder;

  const boardWidth = computed<number>(() => cols.value * 80);
  const boardHeight = computed<number>(() => rows.value * 80);

  const boardGridStyle = computed(() => ({
    gridTemplateColumns: `repeat(${cols.value}, 1fr)`,
    gridTemplateRows: `repeat(${rows.value}, 1fr)`,
  }));

  // 初始化棋盤
  const initBoard = (): void => {
    const totalTiles = rows.value * cols.value;
    const pairsNeeded = totalTiles / 2;

    const availablePokemon = Array.from({ length: 150 }, (_, i) => i + 1);
    const selectedPokemon = availablePokemon
      .sort(() => Math.random() - 0.5)
      .slice(0, pairsNeeded);

    const newTiles: Tile[] = [];
    selectedPokemon.forEach((id: number) => {
      newTiles.push({ pokemonId: id, isMatched: false, isEmpty: false });
      newTiles.push({ pokemonId: id, isMatched: false, isEmpty: false });
    });

    tiles.value = newTiles.sort(() => Math.random() - 0.5);

    pathFinder = new PathFinder(rows.value, cols.value);
    updatePathFinder();

    selectedIndices.value = [];
    hintIndices.value = [];
    connectionPath.value = '';
    connectionPoints.value = [];
  };

  // 更新路徑尋找器
  const updatePathFinder = (): void => {
    const occupiedIndices = new Set<number>();
    tiles.value.forEach((tile: Tile, index: number) => {
      if (!tile.isEmpty && !tile.isMatched) {
        occupiedIndices.add(index);
      }
    });
    pathFinder.updateBoard(occupiedIndices);
  };

  // 繪製連接路徑
  const drawConnectionPath = (path: any[]): void => {
    if (!boardRef.value) return;

    const tileWidth = boardWidth.value / cols.value;
    const tileHeight = boardHeight.value / rows.value;

    const points: string[] = [];
    const dots: { x: number; y: number }[] = [];

    path.forEach((pos: any) => {
      const x = (pos.col + 0.5) * tileWidth;
      const y = (pos.row + 0.5) * tileHeight;
      points.push(`${x},${y}`);
      dots.push({ x, y });
    });

    connectionPath.value = points.join(' ');
    connectionPoints.value = dots;
  };

  // 檢查是否還有可配對的方塊
  const hasAvailableMatches = (): boolean => {
    const tilesMap = new Map<number, number>();
    tiles.value.forEach((tile: Tile, index: number) => {
      if (!tile.isMatched && !tile.isEmpty) {
        tilesMap.set(index, tile.pokemonId);
      }
    });

    return pathFinder.hasAvailableMatches(tilesMap);
  };

  // 重新排列方塊
  const shuffleTiles = async (): Promise<void> => {
    const unmatchedTiles = tiles.value
      .filter((tile: Tile) => !tile.isMatched && !tile.isEmpty)
      .map((tile: Tile) => ({ ...tile }));

    const shuffled = unmatchedTiles.sort(() => Math.random() - 0.5);

    let shuffleIdx = 0;
    tiles.value = tiles.value.map((tile: Tile) => {
      if (!tile.isMatched && !tile.isEmpty) {
        const shuffledTile = shuffled[shuffleIdx++];
        return shuffledTile || tile;
      }
      return tile;
    });

    updatePathFinder();
    selectedIndices.value = [];
  };

  // 尋找可配對的方塊對
  const findMatchablePair = (): [number, number] | null => {
    interface TileWithIndex {
      tile: Tile;
      index: number;
    }

    const indices: TileWithIndex[] = tiles.value
      .map((tile: Tile, index: number) => ({ tile, index }))
      .filter(({ tile }: TileWithIndex) => !tile.isMatched && !tile.isEmpty);

    for (let i = 0; i < indices.length; i++) {
      const item1 = indices[i];
      if (!item1) continue;

      for (let j = i + 1; j < indices.length; j++) {
        const item2 = indices[j];
        if (!item2) continue;

        const { tile: tile1, index: idx1 } = item1;
        const { tile: tile2, index: idx2 } = item2;

        if (tile1.pokemonId === tile2.pokemonId) {
          const result = pathFinder.findPath(idx1, idx2);
          if (result.found) {
            return [idx1, idx2];
          }
        }
      }
    }
    return null;
  };

  return {
    // 狀態
    tiles,
    selectedIndices,
    hintIndices,
    connectionPath,
    connectionPoints,
    boardRef,
    // 計算屬性
    boardWidth,
    boardHeight,
    boardGridStyle,
    // 方法
    initBoard,
    updatePathFinder,
    drawConnectionPath,
    hasAvailableMatches,
    shuffleTiles,
    findMatchablePair,
    // 暴露 PathFinder
    getPathFinder: () => pathFinder,
  };
}