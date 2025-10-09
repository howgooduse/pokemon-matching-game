// src/types/game.ts

export interface Tile {
  id: string;           // 新增：唯一識別碼
  pokemonId: number;
  isMatched: boolean;
  isEmpty: boolean;
  isSelected?: boolean; // 新增：是否被選中
  isHint?: boolean;     // 新增：是否為提示狀態
}

export interface GameState {
  currentLevel: number;
  score: number;
  combo: number;
  maxCombo: number;
  timeLeft: number;
  hints: number;
  shuffles: number;
  bombs: number;
  totalTimeUsed: number;
  timeBonus: number;
  isNewRecord: boolean;
}

export interface UIState {
  isPaused: boolean;
  gameOver: boolean;
  isVictory: boolean;
  isProcessing: boolean;
  showComboPopup: boolean;
  lastComboBonus: number;
  showWelcome: boolean;
  showInstructions: boolean;
}

// 新增：難度配置
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface DifficultyConfig {
  name: string;
  icon: string;
  description: string;
  gridSize: number;     // 網格大小 (4, 6, 8)
  pairs: number;        // 配對數量
  timeLimit: number;    // 時間限制（秒）
  baseScore: number;    // 基礎分數
  comboMultiplier: number; // 連擊倍數
  stars: {
    gold: number;       // 金牌時間標準（秒）
    silver: number;     // 銀牌時間標準（秒）
    bronze: number;     // 銅牌時間標準（秒）
  };
  color: string;        // 主題顏色
}

export const DIFFICULTY_CONFIG: Record<Difficulty, DifficultyConfig> = {
  easy: {
    name: '簡單',
    icon: '🌱',
    description: '4×4 網格，適合新手',
    gridSize: 4,
    pairs: 8,
    timeLimit: 90,
    baseScore: 100,
    comboMultiplier: 1.2,
    stars: { gold: 45, silver: 60, bronze: 75 },
    color: '#4ade80'
  },
  medium: {
    name: '中等',
    icon: '🔥',
    description: '6×6 網格，有挑戰性',
    gridSize: 6,
    pairs: 18,
    timeLimit: 150,
    baseScore: 150,
    comboMultiplier: 1.5,
    stars: { gold: 90, silver: 120, bronze: 140 },
    color: '#f59e0b'
  },
  hard: {
    name: '困難',
    icon: '⚡',
    description: '8×8 網格，高手挑戰',
    gridSize: 8,
    pairs: 32,
    timeLimit: 240,
    baseScore: 200,
    comboMultiplier: 2.0,
    stars: { gold: 150, silver: 200, bronze: 230 },
    color: '#ef4444'
  }
};

// 新增：關卡配置
export interface LevelConfig {
  level: number;
  difficulty: Difficulty;
  requiredScore?: number;
}

// 新增：遊戲結果
export interface GameResult {
  isWin: boolean;
  stars: number;
  score: number;
  timeTaken: number;
  maxCombo: number;
  totalMoves: number;
  accuracy: number;
}

// 新增：連擊配置
export const COMBO_BONUS = {
  threshold: 3,          // 連擊起始數
  baseBonus: 50,         // 基礎連擊獎勵
  multiplier: 1.5        // 連擊倍數增長
};

// 新增：道具配置
export const POWER_UPS = {
  hint: {
    name: '提示',
    icon: '💡',
    description: '顯示一對可配對的方塊',
    initialCount: 3,
    scoreDeduction: 50
  },
  shuffle: {
    name: '重排',
    icon: '🔄',
    description: '重新排列未配對的方塊',
    initialCount: 2,
    scoreDeduction: 100
  },
  bomb: {
    name: '炸彈',
    icon: '💣',
    description: '自動消除一對方塊',
    initialCount: 1,
    scoreDeduction: 150
  }
};