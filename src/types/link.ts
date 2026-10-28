/** 連連看棋盤上的一格 */
export interface BoardTile {
  pokemonId: number;
  isMatched: boolean;
  /** 空格（格子數為奇數時補位用） */
  isEmpty: boolean;
}

export type LinkDifficulty = 'easy' | 'normal' | 'hard';

export interface LinkDifficultySettings {
  /** 第 1 關的時間（秒），之後每關減 5 秒 */
  baseTime: number;
  hints: number;
  shuffles: number;
  bombs: number;
  scoreMultiplier: number;
}

export const LINK_DIFFICULTY_SETTINGS: Record<LinkDifficulty, LinkDifficultySettings> = {
  easy: { baseTime: 240, hints: 5, shuffles: 3, bombs: 2, scoreMultiplier: 0.8 },
  normal: { baseTime: 300, hints: 3, shuffles: 2, bombs: 1, scoreMultiplier: 1.0 },
  hard: { baseTime: 120, hints: 2, shuffles: 1, bombs: 1, scoreMultiplier: 1.5 },
};

/** 計分規則 */
export const LINK_SCORING = {
  basePerMatch: 100,
  comboBonus: 50,
  comboPopupThreshold: 3,
  timeBonusPerSecond: 10,
  hintCost: 50,
  shuffleCost: 100,
  /** 每關減少的秒數 */
  timeDecreasePerLevel: 5,
  /** 每關最少秒數 */
  minLevelTime: 30,
} as const;

export interface LinkGameRecord {
  level: number;
  score: number;
  maxCombo: number;
  timeUsed: number;
  completedAt: Date;
}

export interface LinkGameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: LinkDifficulty;
  showTimer: boolean;
  autoSave: boolean;
}
