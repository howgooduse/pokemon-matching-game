import { ref, computed, type Ref, type ComputedRef } from 'vue';
import { useMatchGameStore } from '@/stores/LinkMatchGameStore';

export function useMatchGame() {
  const gameStore = useMatchGameStore();

  // 遊戲狀態
  const currentLevel = ref<number>(1);
  const score = ref<number>(0);
  const combo = ref<number>(0);
  const maxCombo = ref<number>(0);
  const timeLeft = ref<number>(180);
  const hints = ref<number>(3);
  const shuffles = ref<number>(2);
  const bombs = ref<number>(1);
  const totalTimeUsed = ref<number>(0);
  const timeBonus = ref<number>(0);
  const isNewRecord = ref<boolean>(false);

  // UI 狀態
  const isPaused = ref<boolean>(false);
  const gameOver = ref<boolean>(false);
  const isVictory = ref<boolean>(false);
  const isProcessing = ref<boolean>(false);
  const showComboPopup = ref<boolean>(false);
  const lastComboBonus = ref<number>(0);
  const showInstructions = ref<boolean>(false);
  const gameStarted = ref<boolean>(false);  // ← 這行必須存在

  // 計算棋盤大小
  const rows = computed<number>(() => {
    const width = window.innerWidth;
    if (width < 600) {
      return Math.min(6 + Math.floor((currentLevel.value - 1) / 3), 6);
    } else if (width < 1024) {
      return Math.min(6 + Math.floor((currentLevel.value - 1) / 3), 8);
    } else {
      return Math.min(6 + Math.floor((currentLevel.value - 1) / 2), 10);
    }
  });

  const cols = computed<number>(() => {
    const width = window.innerWidth;
    if (width < 600) {
      return Math.min(6 + Math.floor((currentLevel.value - 1) / 3), 8);
    } else if (width < 1024) {
      return Math.min(8 + Math.floor((currentLevel.value - 1) / 3), 10);
    } else {
      return Math.min(8 + Math.floor((currentLevel.value - 1) / 2), 14);
    }
  });

  // 初始化遊戲數據
  const initGameData = (): void => {
    const diffSettings = gameStore.getDifficultySettings;
    timeLeft.value = diffSettings.baseTime - (currentLevel.value - 1) * 5;
    hints.value = diffSettings.hints;
    shuffles.value = diffSettings.shuffles;
    bombs.value = diffSettings.bombs;
  };

  // 重置遊戲
  const resetGame = (): void => {
    score.value = 0;
    combo.value = 0;
    maxCombo.value = 0;
    totalTimeUsed.value = 0;
    currentLevel.value = 1;
    isPaused.value = false;
    gameOver.value = false;
    gameStarted.value = false;  // ← 這行必須存在
  };

  // 開始遊戲（按下開始按鈕）
  const startPlaying = (): void => {  // ← 這個函數必須存在
    gameStarted.value = true;
    isProcessing.value = false;
  };

  // 下一關
  const nextLevel = (): void => {
    currentLevel.value++;
    combo.value = 0;
    totalTimeUsed.value = 0;
    gameStarted.value = false;  // ← 這行必須存在
  };

  // 計算分數
  const calculateScore = (comboValue: number): number => {
    const baseScore = 100;
    const comboBonus = (comboValue - 1) * 50;
    const difficultyMultiplier = gameStore.getDifficultySettings.scoreMultiplier;
    return Math.round((baseScore + comboBonus) * difficultyMultiplier);
  };

  // 格式化時間
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 暫停/繼續
  const pauseGame = (): void => {
    isPaused.value = true;
  };

  const resumeGame = (): void => {
    isPaused.value = false;
  };

  // 結束遊戲
  const endGame = (victory: boolean): void => {
    gameOver.value = true;
    isVictory.value = victory;

    if (victory) {
      timeBonus.value = timeLeft.value * 10;
      score.value += timeBonus.value;
    }

    isNewRecord.value = score.value > gameStore.getHighScore;

    gameStore.saveGameRecord(
      currentLevel.value,
      score.value,
      maxCombo.value,
      totalTimeUsed.value
    );
  };

  return {
    // 遊戲狀態
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
    // UI 狀態
    isPaused,
    gameOver,
    isVictory,
    isProcessing,
    showComboPopup,
    lastComboBonus,
    showInstructions,
    gameStarted,  // ← 必須在 return 中
    // 計算屬性
    rows,
    cols,
    // 方法
    initGameData,
    resetGame,
    nextLevel,
    calculateScore,
    formatTime,
    pauseGame,
    resumeGame,
    endGame,
    startPlaying,  // ← 必須在 return 中
  };
}