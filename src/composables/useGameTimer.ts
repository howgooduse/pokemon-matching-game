import { ref } from 'vue';

export function useGameTimer() {
  let gameTimer: number | null = null;
  let comboTimer: number | null = null;

  const startGameTimer = (
    isPaused: { value: boolean },
    timeLeft: { value: number },
    totalTimeUsed: { value: number },
    onTimeEnd: () => void
  ) => {
    if (gameTimer) clearInterval(gameTimer);

    gameTimer = window.setInterval(() => {
      if (!isPaused.value) {
        timeLeft.value--;
        totalTimeUsed.value++;

        if (timeLeft.value <= 0) {
          onTimeEnd();
        }
      }
    }, 1000);
  };

  const startComboTimer = (combo: { value: number }, delay: number = 3000) => {
    if (comboTimer) clearTimeout(comboTimer);

    comboTimer = window.setTimeout(() => {
      combo.value = 0;
    }, delay);
  };

  const stopAllTimers = () => {
    if (gameTimer) clearInterval(gameTimer);
    if (comboTimer) clearTimeout(comboTimer);
  };

  return {
    startGameTimer,
    startComboTimer,
    stopAllTimers,
  };
}