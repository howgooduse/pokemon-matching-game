export interface Tile {
  pokemonId: number;
  isMatched: boolean;
  isEmpty: boolean;
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