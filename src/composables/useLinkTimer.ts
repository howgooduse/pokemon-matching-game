import { onUnmounted, type Ref } from 'vue';
import { createTimerPool } from '@/utils/timers';

const COMBO_RESET_DELAY = 3000;

/** 連連看計時：遊戲倒數、連擊重置與一般延遲，元件卸載時自動清除 */
export function useLinkTimer() {
  const pool = createTimerPool();
  let comboTimer: number | null = null;

  const clearComboTimer = () => {
    if (comboTimer !== null) {
      clearTimeout(comboTimer);
      comboTimer = null;
    }
  };

  const startGameTimer = (
    isPaused: Ref<boolean>,
    timeLeft: Ref<number>,
    totalTimeUsed: Ref<number>,
    onTimeEnd: () => void,
  ) => {
    pool.startInterval(() => {
      if (isPaused.value) return;
      timeLeft.value = Math.max(0, timeLeft.value - 1);
      totalTimeUsed.value++;
      if (timeLeft.value === 0) {
        pool.stopInterval();
        onTimeEnd();
      }
    }, 1000);
  };

  const startComboTimer = (combo: Ref<number>, delay = COMBO_RESET_DELAY) => {
    clearComboTimer();
    comboTimer = window.setTimeout(() => {
      combo.value = 0;
      comboTimer = null;
    }, delay);
  };

  const stopAllTimers = () => {
    pool.clearAll();
    clearComboTimer();
  };

  onUnmounted(stopAllTimers);

  return {
    startGameTimer,
    startComboTimer,
    stopGameTimer: pool.stopInterval,
    stopAllTimers,
    delay: pool.delay,
    wait: pool.wait,
  };
}
