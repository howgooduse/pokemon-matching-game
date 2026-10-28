/**
 * 統一管理 setTimeout / setInterval，離開頁面或重新開始時可一次清除，
 * 避免舊的計時器在新一局中觸發。
 */
export function createTimerPool() {
  const timeouts = new Set<number>();
  let intervalId: number | null = null;

  const delay = (fn: () => void, ms: number): void => {
    const id = window.setTimeout(() => {
      timeouts.delete(id);
      fn();
    }, ms);
    timeouts.add(id);
  };

  const wait = (ms: number): Promise<void> => new Promise((resolve) => delay(resolve, ms));

  const startInterval = (fn: () => void, ms: number): void => {
    stopInterval();
    intervalId = window.setInterval(fn, ms);
  };

  const stopInterval = (): void => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  const clearAll = (): void => {
    timeouts.forEach((id) => clearTimeout(id));
    timeouts.clear();
    stopInterval();
  };

  return { delay, wait, startInterval, stopInterval, clearAll };
}

export type TimerPool = ReturnType<typeof createTimerPool>;
