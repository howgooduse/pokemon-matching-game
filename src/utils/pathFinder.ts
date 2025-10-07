/**
 * 連連看路徑尋找算法
 * 規則：最多可以轉2次彎（即3條直線連接）
 */

export interface Position {
  row: number;
  col: number;
  index: number;
}

export interface PathSegment {
  from: Position;
  to: Position;
}

export interface PathResult {
  found: boolean;
  path: Position[];
  segments: PathSegment[];
}

export class PathFinder {
  private rows: number;
  private cols: number;
  private board: boolean[][]; // true = 有方塊, false = 空的

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.board = [];
  }

  /**
   * 更新棋盤狀態
   * @param occupiedIndices 被佔用的位置索引
   */
  updateBoard(occupiedIndices: Set<number>): void {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(false)
    );

    occupiedIndices.forEach(index => {
      const row = Math.floor(index / this.cols);
      const col = index % this.cols;
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        const boardRow = this.board[row];
        if (boardRow) {
          boardRow[col] = true;
        }
      }
    });
  }

  /**
   * 尋找兩點之間的連接路徑
   */
  findPath(startIndex: number, endIndex: number): PathResult {
    const start = this.indexToPosition(startIndex);
    const end = this.indexToPosition(endIndex);

    // 嘗試0轉彎（直線連接）
    const directPath = this.tryDirectPath(start, end);
    if (directPath.found) return directPath;

    // 嘗試1轉彎
    const oneCornerPath = this.tryOneCorner(start, end);
    if (oneCornerPath.found) return oneCornerPath;

    // 嘗試2轉彎
    const twoCornerPath = this.tryTwoCorners(start, end);
    if (twoCornerPath.found) return twoCornerPath;

    return { found: false, path: [], segments: [] };
  }

  /**
   * 嘗試直線連接（0轉彎）
   */
  private tryDirectPath(start: Position, end: Position): PathResult {
    // 同一行或同一列
    if (start.row === end.row || start.col === end.col) {
      if (this.isLinePathClear(start, end, false)) {
        return {
          found: true,
          path: [start, end],
          segments: [{ from: start, to: end }]
        };
      }
    }
    return { found: false, path: [], segments: [] };
  }

  /**
   * 嘗試一次轉彎
   */
  private tryOneCorner(start: Position, end: Position): PathResult {
    // 轉彎點1: (start.row, end.col)
    const corner1: Position = {
      row: start.row,
      col: end.col,
      index: this.positionToIndex(start.row, end.col)
    };

    if (this.isCornerValid(corner1, start, end)) {
      return {
        found: true,
        path: [start, corner1, end],
        segments: [
          { from: start, to: corner1 },
          { from: corner1, to: end }
        ]
      };
    }

    // 轉彎點2: (end.row, start.col)
    const corner2: Position = {
      row: end.row,
      col: start.col,
      index: this.positionToIndex(end.row, start.col)
    };

    if (this.isCornerValid(corner2, start, end)) {
      return {
        found: true,
        path: [start, corner2, end],
        segments: [
          { from: start, to: corner2 },
          { from: corner2, to: end }
        ]
      };
    }

    return { found: false, path: [], segments: [] };
  }

  /**
   * 嘗試兩次轉彎
   */
  private tryTwoCorners(start: Position, end: Position): PathResult {
    // 嘗試水平方向延伸
    for (let col = 0; col < this.cols; col++) {
      if (col === start.col || col === end.col) continue;

      const corner1: Position = {
        row: start.row,
        col: col,
        index: this.positionToIndex(start.row, col)
      };

      const corner2: Position = {
        row: end.row,
        col: col,
        index: this.positionToIndex(end.row, col)
      };

      if (this.isTwoCornerPathValid(start, corner1, corner2, end)) {
        return {
          found: true,
          path: [start, corner1, corner2, end],
          segments: [
            { from: start, to: corner1 },
            { from: corner1, to: corner2 },
            { from: corner2, to: end }
          ]
        };
      }
    }

    // 嘗試垂直方向延伸
    for (let row = 0; row < this.rows; row++) {
      if (row === start.row || row === end.row) continue;

      const corner1: Position = {
        row: row,
        col: start.col,
        index: this.positionToIndex(row, start.col)
      };

      const corner2: Position = {
        row: row,
        col: end.col,
        index: this.positionToIndex(row, end.col)
      };

      if (this.isTwoCornerPathValid(start, corner1, corner2, end)) {
        return {
          found: true,
          path: [start, corner1, corner2, end],
          segments: [
            { from: start, to: corner1 },
            { from: corner1, to: corner2 },
            { from: corner2, to: end }
          ]
        };
      }
    }

    return { found: false, path: [], segments: [] };
  }

  /**
   * 檢查一個轉彎點是否有效
   */
  private isCornerValid(corner: Position, start: Position, end: Position): boolean {
    // 轉彎點不能有方塊（除非是起點或終點）
    if (corner.index !== start.index && corner.index !== end.index) {
      const boardRow = this.board[corner.row];
      if (boardRow && boardRow[corner.col]) {
        return false;
      }
    }

    // 檢查 start -> corner 和 corner -> end 的路徑
    return (
      this.isLinePathClear(start, corner, true) &&
      this.isLinePathClear(corner, end, true)
    );
  }

  /**
   * 檢查兩個轉彎點的路徑是否有效
   */
  private isTwoCornerPathValid(
    start: Position,
    corner1: Position,
    corner2: Position,
    end: Position
  ): boolean {
    // 轉彎點不能有方塊
    const boardRow1 = this.board[corner1.row];
    const boardRow2 = this.board[corner2.row];
    
    if ((boardRow1 && boardRow1[corner1.col]) || (boardRow2 && boardRow2[corner2.col])) {
      return false;
    }

    // 檢查三段路徑
    return (
      this.isLinePathClear(start, corner1, true) &&
      this.isLinePathClear(corner1, corner2, true) &&
      this.isLinePathClear(corner2, end, true)
    );
  }

  /**
   * 檢查兩點之間的直線路徑是否暢通
   * @param allowEndpoint 是否允許終點有方塊
   */
  private isLinePathClear(from: Position, to: Position, allowEndpoint: boolean): boolean {
    if (from.row === to.row) {
      // 水平線
      const minCol = Math.min(from.col, to.col);
      const maxCol = Math.max(from.col, to.col);
      const boardRow = this.board[from.row];
      
      if (!boardRow) return false;
      
      for (let col = minCol; col <= maxCol; col++) {
        if (boardRow[col]) {
          // 起點和終點可以有方塊
          if (col === from.col || col === to.col) {
            if (!allowEndpoint && col !== from.col && col !== to.col) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    } else if (from.col === to.col) {
      // 垂直線
      const minRow = Math.min(from.row, to.row);
      const maxRow = Math.max(from.row, to.row);
      
      for (let row = minRow; row <= maxRow; row++) {
        const boardRow = this.board[row];
        if (!boardRow) return false;
        
        if (boardRow[from.col]) {
          if (row === from.row || row === to.row) {
            if (!allowEndpoint && row !== from.row && row !== to.row) {
              return false;
            }
          } else {
            return false;
          }
        }
      }
      return true;
    }
    
    return false;
  }

  /**
   * 將索引轉換為位置
   */
  private indexToPosition(index: number): Position {
    return {
      row: Math.floor(index / this.cols),
      col: index % this.cols,
      index: index
    };
  }

  /**
   * 將位置轉換為索引
   */
  private positionToIndex(row: number, col: number): number {
    return row * this.cols + col;
  }

  /**
   * 檢查是否還有可配對的方塊
   */
  hasAvailableMatches(tiles: Map<number, number>): boolean {
    const indices = Array.from(tiles.keys());
    
    for (let i = 0; i < indices.length; i++) {
      const idx1 = indices[i];
      if (idx1 === undefined) continue;
      
      for (let j = i + 1; j < indices.length; j++) {
        const idx2 = indices[j];
        if (idx2 === undefined) continue;
        
        const id1 = tiles.get(idx1);
        const id2 = tiles.get(idx2);
        
        if (id1 !== undefined && id2 !== undefined && id1 === id2) {
          const result = this.findPath(idx1, idx2);
          if (result.found) {
            return true;
          }
        }
      }
    }
    
    return false;
  }
}