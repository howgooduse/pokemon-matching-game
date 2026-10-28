import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { shuffle } from '@/utils/array';
import { loadPokemonList, type PokemonInfo } from '@/utils/pokemon';
import { createTimerPool } from '@/utils/timers';

export interface GuessCard {
  id: number;
  pokemonId: number;
  pokemonName: string;
  isFlipped: boolean;
  isCorrect: boolean;
  isHighlighted: boolean;
}

/** idle：等待開始 / shuffling：洗牌中 / answering：作答中 / revealing：顯示答案 / finished：結束 */
export type GuessGameStatus = 'idle' | 'shuffling' | 'answering' | 'revealing' | 'finished';

export const GUESS_CARDS_PER_ROUND = 5;
export const GUESS_MAX_ROUNDS = 50;
export const GUESS_TIME_LIMIT = 10;

const SHUFFLE_DURATION = 1000; // 洗牌動畫 (ms)
const REVEAL_DURATION = 1500; // 顯示答案後進入下一回合 (ms)
const SCORE_PER_CORRECT = 10;

export const useGuessGameStore = defineStore('guessGame', () => {
  const timers = createTimerPool();
  let pokemonList: PokemonInfo[] = [];

  const cards = ref<GuessCard[]>([]);
  const status = ref<GuessGameStatus>('idle');
  const currentTargetName = ref('');
  const correctCount = ref(0);
  const wrongCount = ref(0);
  const score = ref(0);
  const currentRound = ref(0);
  const timeRemaining = ref(GUESS_TIME_LIMIT);
  const lastAnswer = ref<'correct' | 'wrong' | null>(null);

  const answeredCount = computed(() => correctCount.value + wrongCount.value);
  const accuracy = computed(() =>
    answeredCount.value > 0 ? Math.round((correctCount.value / answeredCount.value) * 100) : 0,
  );
  const isActive = computed(() => status.value !== 'idle' && status.value !== 'finished');
  const canSelect = computed(() => status.value === 'answering');

  async function initializeGame() {
    timers.clearAll();
    status.value = 'idle';
    correctCount.value = 0;
    wrongCount.value = 0;
    score.value = 0;
    currentRound.value = 0;
    timeRemaining.value = GUESS_TIME_LIMIT;
    lastAnswer.value = null;

    pokemonList = await loadPokemonList();
    generateRound();
  }

  function generateRound() {
    if (pokemonList.length < GUESS_CARDS_PER_ROUND) {
      console.error('寶可夢資料尚未載入或數量不足');
      return;
    }

    const picked = shuffle(pokemonList).slice(0, GUESS_CARDS_PER_ROUND);
    const answer = picked[Math.floor(Math.random() * picked.length)]!;

    currentTargetName.value = answer.name;
    cards.value = picked.map((pokemon, index) => ({
      id: index,
      pokemonId: pokemon.id,
      pokemonName: pokemon.name,
      isFlipped: false,
      isCorrect: pokemon.id === answer.id,
      isHighlighted: false,
    }));
  }

  /** 播放洗牌動畫後翻開卡牌並開始計時 */
  function revealCardsAndStartTimer() {
    status.value = 'shuffling';
    timers.delay(() => {
      cards.value.forEach((card) => (card.isFlipped = true));
      status.value = 'answering';
      startTimer();
    }, SHUFFLE_DURATION);
  }

  function startTimer() {
    timeRemaining.value = GUESS_TIME_LIMIT;
    timers.startInterval(() => {
      timeRemaining.value--;
      if (timeRemaining.value <= 0) resolveRound(false);
    }, 1000);
  }

  function startGame() {
    if (status.value !== 'idle' || cards.value.length === 0) return;
    currentRound.value = 1;
    revealCardsAndStartTimer();
  }

  function selectCard(card: GuessCard) {
    if (!canSelect.value) return;
    resolveRound(card.isCorrect);
  }

  /** 結算本回合（選擇或逾時），顯示正確答案後進入下一回合 */
  function resolveRound(isCorrect: boolean) {
    timers.stopInterval();
    status.value = 'revealing';
    lastAnswer.value = isCorrect ? 'correct' : 'wrong';

    if (isCorrect) {
      correctCount.value++;
      score.value += SCORE_PER_CORRECT;
    } else {
      wrongCount.value++;
    }

    const correctCard = cards.value.find((c) => c.isCorrect);
    if (correctCard) correctCard.isHighlighted = true;

    timers.delay(() => {
      lastAnswer.value = null;
      nextRound();
    }, REVEAL_DURATION);
  }

  function nextRound() {
    if (currentRound.value >= GUESS_MAX_ROUNDS) {
      endGame();
      return;
    }
    currentRound.value++;
    generateRound();
    revealCardsAndStartTimer();
  }

  function endGame() {
    timers.clearAll();
    lastAnswer.value = null;
    status.value = 'finished';
  }

  async function restart() {
    await initializeGame();
    startGame();
  }

  function dispose() {
    timers.clearAll();
  }

  return {
    cards,
    status,
    currentTargetName,
    correctCount,
    wrongCount,
    score,
    currentRound,
    timeRemaining,
    lastAnswer,
    answeredCount,
    accuracy,
    isActive,
    canSelect,
    initializeGame,
    startGame,
    selectCard,
    endGame,
    restart,
    dispose,
  };
});
