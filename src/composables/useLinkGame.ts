import { computed, ref } from 'vue';
import { useLinkGameStore } from '@/stores/linkGameStore';
import { LINK_SCORING } from '@/types/link';

/** 依螢幕寬度與關卡計算棋盤大小 */
function getBoardSize(level: number): { rows: number; cols: number } {
  const width = window.innerWidth;
  if (width < 600) {
    const step = Math.floor((level - 1) / 3);
    return { rows: 6, cols: Math.min(6 + step, 8) };
  }
  if (width < 1024) {
    const step = Math.floor((level - 1) / 3);
    return { rows: Math.min(6 + step, 8), cols: Math.min(8 + step, 10) };
  }
  const step = Math.floor((level - 1) / 2);
  return { rows: Math.min(6 + step, 10), cols: Math.min(8 + step, 14) };
}

/** 連連看：關卡、分數、連擊、道具與 UI 狀態 */
export function useLinkGame() {
  const store = useLinkGameStore();

  // 遊戲數據
  const currentLevel = ref(1);
  const score = ref(0);
  const combo = ref(0);
  const maxCombo = ref(0);
  const timeLeft = ref(0);
  const hints = ref(0);
  const shuffles = ref(0);
  const bombs = ref(0);
  const totalTimeUsed = ref(0);
  const timeBonus = ref(0);
  const isNewRecord = ref(false);

  // UI 狀態
  const gameStarted = ref(false);
  const isPaused = ref(false);
  const gameOver = ref(false);
  const isVictory = ref(false);
  const isProcessing = ref(false);
  const showComboPopup = ref(false);
  const lastComboBonus = ref(0);
  const showInstructions = ref(false);

  // 棋盤尺寸在每關開始時決定（避免遊戲中因視窗大小變動而錯位）
  const boardSize = ref(getBoardSize(1));
  const rows = computed(() => boardSize.value.rows);
  const cols = computed(() => boardSize.value.cols);

  /** 準備一關（尚未開始計時） */
  const prepareLevel = (): void => {
    const diff = store.difficultySettings;
    boardSize.value = getBoardSize(currentLevel.value);
    timeLeft.value = Math.max(
      LINK_SCORING.minLevelTime,
      diff.baseTime - (currentLevel.value - 1) * LINK_SCORING.timeDecreasePerLevel,
    );
    hints.value = diff.hints;
    shuffles.value = diff.shuffles;
    bombs.value = diff.bombs;
    combo.value = 0;
    totalTimeUsed.value = 0;
    timeBonus.value = 0;
    isNewRecord.value = false;
    gameStarted.value = false;
    isPaused.value = false;
    gameOver.value = false;
    isVictory.value = false;
    isProcessing.value = true; // 按下開始前不可點擊
  };

  const resetGame = (): void => {
    currentLevel.value = 1;
    score.value = 0;
    maxCombo.value = 0;
  };

  const nextLevel = (): void => {
    currentLevel.value++;
  };

  const startPlaying = (): void => {
    gameStarted.value = true;
    isProcessing.value = false;
  };

  /** 依連擊數計算本次配對得分 */
  const calculateScore = (comboValue: number): number => {
    const comboBonus = (comboValue - 1) * LINK_SCORING.comboBonus;
    return Math.round(
      (LINK_SCORING.basePerMatch + comboBonus) * store.difficultySettings.scoreMultiplier,
    );
  };

  const pauseGame = (): void => {
    if (gameStarted.value && !gameOver.value) isPaused.value = true;
  };

  const resumeGame = (): void => {
    isPaused.value = false;
  };

  const endGame = (victory: boolean): void => {
    if (gameOver.value) return;
    gameOver.value = true;
    isVictory.value = victory;
    isProcessing.value = true;

    if (victory) {
      timeBonus.value = timeLeft.value * LINK_SCORING.timeBonusPerSecond;
      score.value += timeBonus.value;
    }

    isNewRecord.value = score.value > store.highScore;
    store.saveGameRecord(currentLevel.value, score.value, maxCombo.value, totalTimeUsed.value);
  };

  return {
    currentLevel,
    score,
    combo,
    maxCombo,
    timeLeft,
    hints,
    shuffles,
    bombs,
    totalTimeUsed,
    timeBonus,
    isNewRecord,
    gameStarted,
    isPaused,
    gameOver,
    isVictory,
    isProcessing,
    showComboPopup,
    lastComboBonus,
    showInstructions,
    rows,
    cols,
    prepareLevel,
    resetGame,
    nextLevel,
    startPlaying,
    calculateScore,
    pauseGame,
    resumeGame,
    endGame,
    incrementMatches: store.incrementMatches,
  };
}
