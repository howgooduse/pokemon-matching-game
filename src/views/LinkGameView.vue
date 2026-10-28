<template>
  <div class="game-page link-page">
    <LinkInstructionsModal :show="showInstructions" @close="showInstructions = false" />

    <GameHeader title="連連看" subtitle="找出兩隻相同的寶可夢，連線最多只能轉兩個彎。">
      <template #stats>
        <StatItem label="關卡" :value="currentLevel" />
        <StatItem label="分數" :value="score" tone="yellow" />
        <StatItem label="連擊" :value="`${combo}×`" :tone="combo >= 3 ? 'green' : 'default'" />
        <StatItem label="時間" :value="formatTime(timeLeft)" :tone="timeLeft <= 30 ? 'tomato' : 'default'" />
      </template>

      <template #actions>
        <button type="button" class="ui-btn ui-btn--soft" @click="showInstructions = true">
          <v-icon icon="mdi-help-circle-outline" size="18" />
          玩法
        </button>
        <button
          type="button"
          class="ui-btn ui-btn--soft"
          :disabled="!gameStarted || gameOver"
          @click="pauseGame"
        >
          <v-icon icon="mdi-pause" size="18" />
          暫停
        </button>

        <div class="tools">
          <button
            type="button"
            class="ui-btn ui-btn--soft tool-btn"
            :disabled="!gameStarted || hints <= 0 || isProcessing || isPaused"
            title="顯示一組可配對的方塊（扣 50 分）"
            @click="handleUseHint"
          >
            <v-icon icon="mdi-lightbulb-on-outline" size="18" />
            提示
            <span class="tool-count">{{ hints }}</span>
          </button>
          <button
            type="button"
            class="ui-btn ui-btn--soft tool-btn"
            :disabled="!gameStarted || shuffles <= 0 || isProcessing || isPaused"
            title="重新排列方塊（扣 100 分）"
            @click="handleUseShuffle"
          >
            <v-icon icon="mdi-shuffle-variant" size="18" />
            重排
            <span class="tool-count">{{ shuffles }}</span>
          </button>
          <button
            type="button"
            class="ui-btn ui-btn--soft tool-btn"
            :disabled="!gameStarted || bombs <= 0 || isProcessing || isPaused"
            title="自動消除一組方塊"
            @click="handleUseBomb"
          >
            <v-icon icon="mdi-bomb" size="18" />
            炸彈
            <span class="tool-count">{{ bombs }}</span>
          </button>
        </div>
      </template>
    </GameHeader>

    <div class="board-well">
      <div
        class="board-grid"
        :style="{ ...boardGridStyle, '--cols': cols, '--rows': rows }"
      >
        <LinkTile
          v-for="(tile, index) in tiles"
          :key="index"
          :pokemon-id="tile.pokemonId"
          :is-selected="selectedIndices.includes(index)"
          :is-matched="tile.isMatched"
          :is-hint="hintIndices.includes(index)"
          :is-empty="tile.isEmpty"
          :disabled="!gameStarted || isProcessing"
          @click="handleTileClick(index)"
        />

        <!-- 連線 -->
        <svg
          v-if="connectionPath.length > 0"
          class="connection-overlay"
          :viewBox="`0 0 ${boardWidth} ${boardHeight}`"
          preserveAspectRatio="none"
        >
          <polyline
            :points="connectionPath"
            class="connection-line"
            fill="none"
            stroke="#ee5b36"
            stroke-width="6"
            stroke-linecap="round"
            stroke-linejoin="round"
            vector-effect="non-scaling-stroke"
          />
          <circle
            v-for="(point, i) in connectionPoints"
            :key="i"
            :cx="point.x"
            :cy="point.y"
            r="7"
            fill="#f8e27c"
            stroke="#ee5b36"
            stroke-width="3"
          />
        </svg>
      </div>

      <StartGameButton v-if="!gameStarted" @click="handleStartPlaying" />
    </div>

    <!-- 連擊 -->
    <transition name="combo-popup">
      <div v-if="showComboPopup" class="combo-popup" aria-live="polite">
        <span class="combo-text">{{ combo }} 連擊</span>
        <span class="combo-score">+{{ lastComboBonus }}</span>
      </div>
    </transition>

    <!-- 暫停 -->
    <transition name="modal">
      <div v-if="isPaused" class="ui-scrim" @click.self="resumeGame">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">已暫停</h2>
          <dl class="result-list">
            <div><dt>關卡</dt><dd>{{ currentLevel }}</dd></div>
            <div><dt>分數</dt><dd>{{ score }}</dd></div>
            <div><dt>剩餘時間</dt><dd>{{ formatTime(timeLeft) }}</dd></div>
          </dl>
          <div class="ui-panel__actions">
            <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="resumeGame">
              繼續遊戲
            </button>
            <button type="button" class="ui-btn ui-btn--outline ui-btn--lg ui-btn--block" @click="handleRestart">
              從第 1 關重新開始
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 結算 -->
    <transition name="modal">
      <div v-if="gameOver" class="ui-scrim">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <p class="result-kicker">第 {{ currentLevel }} 關</p>
          <h2 class="ui-panel__title">{{ isVictory ? '過關！' : '時間到' }}</h2>
          <p class="result-score">{{ score }}</p>
          <p v-if="isNewRecord" class="new-record">
            <v-icon icon="mdi-trophy-outline" size="18" />
            新的最高分
          </p>
          <dl class="result-list">
            <div><dt>最高連擊</dt><dd>{{ maxCombo }}×</dd></div>
            <div><dt>使用時間</dt><dd>{{ formatTime(totalTimeUsed) }}</dd></div>
            <div v-if="isVictory"><dt>時間獎勵</dt><dd class="is-bonus">+{{ timeBonus }}</dd></div>
          </dl>
          <div class="ui-panel__actions">
            <button
              v-if="isVictory"
              type="button"
              class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block"
              @click="handleNextLevel"
            >
              下一關
            </button>
            <button type="button" class="ui-btn ui-btn--outline ui-btn--lg ui-btn--block" @click="handleRestart">
              從第 1 關重新開始
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useLinkGame } from '@/composables/useLinkGame';
import { useLinkBoard } from '@/composables/useLinkBoard';
import { useLinkTimer } from '@/composables/useLinkTimer';
import { LINK_SCORING } from '@/types/link';
import { formatTime } from '@/utils/format';
import type { Position } from '@/utils/pathFinder';
import LinkTile from '@/components/link/LinkTile.vue';
import LinkInstructionsModal from '@/components/link/LinkInstructionsModal.vue';
import StartGameButton from '@/components/common/StartGameButton.vue';
import GameHeader from '@/components/common/GameHeader.vue';
import StatItem from '@/components/common/StatItem.vue';

const {
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
  incrementMatches,
} = useLinkGame();

const {
  tiles,
  selectedIndices,
  hintIndices,
  connectionPath,
  connectionPoints,
  boardWidth,
  boardHeight,
  boardGridStyle,
  initBoard,
  updatePathFinder,
  findPath,
  findMatchablePair,
  hasAvailableMatches,
  hasRemainingTiles,
  shuffleTiles,
  drawConnectionPath,
  clearConnection,
} = useLinkBoard(rows, cols);

const { startGameTimer, stopGameTimer, startComboTimer, stopAllTimers, delay, wait } =
  useLinkTimer();

const MATCH_ANIMATION_MS = 400;
const MISMATCH_DELAY_MS = 300;
const COMBO_POPUP_MS = 1500;
const HINT_DURATION_MS = 2000;

/** 準備新的一關（尚未開始計時） */
const initGame = () => {
  stopAllTimers();
  prepareLevel();
  initBoard();
};

const handleStartPlaying = () => {
  startPlaying();
  startGameTimer(isPaused, timeLeft, totalTimeUsed, () => endGame(false));
};

const handleTileClick = (index: number) => {
  const tile = tiles.value[index];
  if (!gameStarted.value || isProcessing.value || !tile || tile.isMatched) return;

  hintIndices.value = [];

  if (selectedIndices.value.includes(index)) {
    selectedIndices.value = selectedIndices.value.filter((i) => i !== index);
    return;
  }

  selectedIndices.value = [...selectedIndices.value, index].slice(-2);
  if (selectedIndices.value.length === 2) void checkMatch();
};

const onMatchSuccess = async (idx1: number, idx2: number, path: Position[]) => {
  drawConnectionPath(path);
  await wait(MATCH_ANIMATION_MS);

  tiles.value[idx1]!.isMatched = true;
  tiles.value[idx2]!.isMatched = true;

  combo.value++;
  maxCombo.value = Math.max(maxCombo.value, combo.value);
  score.value += calculateScore(combo.value);
  lastComboBonus.value = (combo.value - 1) * LINK_SCORING.comboBonus;

  if (combo.value >= LINK_SCORING.comboPopupThreshold) {
    showComboPopup.value = true;
    delay(() => (showComboPopup.value = false), COMBO_POPUP_MS);
  }

  incrementMatches();
  startComboTimer(combo);
  updatePathFinder();

  if (!hasRemainingTiles()) {
    stopGameTimer();
    delay(() => endGame(true), 500);
  } else if (!hasAvailableMatches()) {
    shuffleTiles();
  }
};

const checkMatch = async () => {
  const [idx1, idx2] = selectedIndices.value;
  if (idx1 === undefined || idx2 === undefined) return;

  const tile1 = tiles.value[idx1];
  const tile2 = tiles.value[idx2];
  if (!tile1 || !tile2) return;

  isProcessing.value = true;

  const result = tile1.pokemonId === tile2.pokemonId ? findPath(idx1, idx2) : null;
  if (result?.found) {
    await onMatchSuccess(idx1, idx2, result.path);
  } else {
    await wait(MISMATCH_DELAY_MS);
    combo.value = 0;
  }

  selectedIndices.value = [];
  clearConnection();
  if (!gameOver.value) isProcessing.value = false;
};

// ---------- 道具 ----------
const canUseTool = (count: number) => count > 0 && !isProcessing.value && !isPaused.value;

const handleUseHint = () => {
  if (!canUseTool(hints.value)) return;

  hints.value--;
  score.value = Math.max(0, score.value - LINK_SCORING.hintCost);

  const pair = findMatchablePair();
  if (pair) {
    hintIndices.value = pair;
    delay(() => (hintIndices.value = []), HINT_DURATION_MS);
  }
};

const handleUseShuffle = () => {
  if (!canUseTool(shuffles.value)) return;

  shuffles.value--;
  score.value = Math.max(0, score.value - LINK_SCORING.shuffleCost);
  hintIndices.value = [];
  shuffleTiles();
};

const handleUseBomb = () => {
  if (!canUseTool(bombs.value)) return;

  const pair = findMatchablePair();
  if (!pair) return;

  bombs.value--;
  hintIndices.value = [];
  selectedIndices.value = pair;
  isProcessing.value = true;
  delay(() => void checkMatch(), MISMATCH_DELAY_MS);
};

// ---------- 流程 ----------
const handleNextLevel = () => {
  nextLevel();
  initGame();
};

const handleRestart = () => {
  resetGame();
  initGame();
};

onMounted(initGame);
</script>

<style scoped src="@/styles/link-game.css"></style>
