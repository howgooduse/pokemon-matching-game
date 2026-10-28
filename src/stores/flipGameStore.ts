import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { shuffle } from '@/utils/array';
import { pickRandomPokemonIds } from '@/utils/pokemon';
import { createTimerPool } from '@/utils/timers';

export interface FlipCard {
  id: number;
  pokemonId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

/** idle：等待開始 / preview：開局預覽 / playing：進行中 / paused：暫停 / finished：結束 */
export type FlipGameStatus = 'idle' | 'preview' | 'playing' | 'paused' | 'finished';

export const FLIP_DEFAULT_DECK_SIZE = 16;
export const FLIP_DEFAULT_TIME_LIMIT = 60;

const PREVIEW_DURATION = 1000; // 開局預覽時間 (ms)
const CHECK_DELAY = 1000; // 翻開兩張後等待多久判定 (ms)
const FLIP_BACK_DELAY = 100; // 配對失敗後翻回的延遲 (ms)
const FINISH_DELAY = 700; // 全部配對後延遲顯示結果 (ms)
const SCORE_PER_MATCH = 10;

export const useFlipGameStore = defineStore('flipGame', () => {
  const timers = createTimerPool();

  const cards = ref<FlipCard[]>([]);
  const score = ref(0);
  const timeLimit = ref(FLIP_DEFAULT_TIME_LIMIT);
  const timeRemaining = ref(FLIP_DEFAULT_TIME_LIMIT);
  const status = ref<FlipGameStatus>('idle');
  const isChecking = ref(false);
  const flippedCards = ref<FlipCard[]>([]);

  const matchedCount = computed(() => cards.value.filter((c) => c.isMatched).length);
  const isVictory = computed(
    () => cards.value.length > 0 && matchedCount.value === cards.value.length,
  );
  const timeTaken = computed(() => timeLimit.value - timeRemaining.value);
  const canFlip = computed(() => status.value === 'playing' && !isChecking.value);

  function initializeGame(deckSize = FLIP_DEFAULT_DECK_SIZE, limit = FLIP_DEFAULT_TIME_LIMIT) {
    timers.clearAll();

    score.value = 0;
    timeLimit.value = limit;
    timeRemaining.value = limit;
    status.value = 'idle';
    isChecking.value = false;
    flippedCards.value = [];

    let nextId = 0;
    const pairs = pickRandomPokemonIds(deckSize / 2).flatMap((pokemonId) => [
      { id: nextId++, pokemonId, isFlipped: false, isMatched: false },
      { id: nextId++, pokemonId, isFlipped: false, isMatched: false },
    ]);
    cards.value = shuffle(pairs);
  }

  function startGame() {
    if (status.value !== 'idle') return;

    // 預覽：先全部翻開，再蓋回並開始計時
    status.value = 'preview';
    cards.value.forEach((card) => (card.isFlipped = true));

    timers.delay(() => {
      cards.value.forEach((card) => (card.isFlipped = false));
      status.value = 'playing';
      startTimer();
    }, PREVIEW_DURATION);
  }

  function startTimer() {
    timers.startInterval(() => {
      if (status.value !== 'playing') return;
      timeRemaining.value = Math.max(0, timeRemaining.value - 1);
      if (timeRemaining.value === 0) endGame();
    }, 1000);
  }

  function pauseGame() {
    if (status.value !== 'playing') return;
    status.value = 'paused';
    timers.stopInterval();
  }

  function resumeGame() {
    if (status.value !== 'paused') return;
    status.value = 'playing';
    startTimer();
  }

  function flipCard(card: FlipCard) {
    if (!canFlip.value || card.isFlipped || card.isMatched || flippedCards.value.length >= 2) {
      return;
    }

    card.isFlipped = true;
    flippedCards.value.push(card);

    if (flippedCards.value.length === 2) {
      isChecking.value = true;
      timers.delay(checkMatch, CHECK_DELAY);
    }
  }

  function checkMatch() {
    const [first, second] = flippedCards.value;
    flippedCards.value = [];
    isChecking.value = false;
    if (!first || !second) return;

    if (first.pokemonId === second.pokemonId) {
      first.isMatched = true;
      second.isMatched = true;
      score.value += SCORE_PER_MATCH;

      if (isVictory.value) {
        timers.stopInterval();
        timers.delay(endGame, FINISH_DELAY);
      }
    } else {
      timers.delay(() => {
        first.isFlipped = false;
        second.isFlipped = false;
      }, FLIP_BACK_DELAY);
    }
  }

  function endGame() {
    timers.clearAll();
    isChecking.value = false;
    status.value = 'finished';
  }

  /** 離開頁面時呼叫，清除所有計時器 */
  function dispose() {
    timers.clearAll();
  }

  return {
    cards,
    score,
    timeLimit,
    timeRemaining,
    status,
    isChecking,
    matchedCount,
    isVictory,
    timeTaken,
    canFlip,
    initializeGame,
    startGame,
    pauseGame,
    resumeGame,
    flipCard,
    endGame,
    dispose,
  };
});
