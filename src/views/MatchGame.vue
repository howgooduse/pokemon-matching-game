<template>
  <div class="match-game-container">
    <!-- 玩法說明彈窗 -->
    <InstructionsModal
      :show="showInstructions"
      @close="showInstructions = false"
    />

    <!-- 整合的遊戲頂部列 -->
    <div class="game-top-bar">
      <!-- 左側：說明按鈕 -->
      <div class="top-bar-left">
        <button @click="showInstructions = true" class="btn-help">
          ❓ 說明
        </button>
        <button v-if="gameStarted" @click="pauseGame" class="btn-pause">
          ⏸️ 暫停
        </button>
      </div>

      <!-- 中間：遊戲資訊 -->
      <div class="top-bar-center">
        <div class="info-item">
          <span class="info-label">關卡</span>
          <span class="info-value">{{ currentLevel }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">分數</span>
          <span class="info-value score">{{ score }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">連擊</span>
          <span class="info-value combo" :class="{ 'high-combo': combo >= 5 }">
            {{ combo }}x
          </span>
        </div>
        <div class="info-item">
          <span class="info-label">時間</span>
          <span class="info-value time" :class="{ 'time-warning': timeLeft <= 30 }">
            {{ formatTime(timeLeft) }}
          </span>
        </div>
      </div>

      <!-- 右側：道具按鈕（遊戲開始後才顯示） -->
      <div class="top-bar-right">
        <button
          v-if="gameStarted"
          @click="handleUseHint"
          :disabled="hints <= 0 || isProcessing"
          class="tool-btn-compact"
          title="提示"
        >
          <span class="tool-icon">💡</span>
          <!--<span class="tool-label">提示</span>-->
          <span class="tool-num">{{ hints }}</span>
        </button>
        <button
          v-if="gameStarted"
          @click="handleUseShuffle"
          :disabled="shuffles <= 0 || isProcessing"
          class="tool-btn-compact"
          title="重排"
        >
          <span class="tool-icon">🔄</span>
          <!--<span class="tool-label">重排</span>-->
          <span class="tool-num">{{ shuffles }}</span>
        </button>
        <button
          v-if="gameStarted"
          @click="handleUseBomb"
          :disabled="bombs <= 0 || isProcessing"
          class="tool-btn-compact"
          title="炸彈"
        >
          <span class="tool-icon">💣</span>
          <!--<span class="tool-label">炸彈</span>-->
          <span class="tool-num">{{ bombs }}</span>
        </button>
      </div>
    </div>

    <!-- 開始遊戲按鈕區（遊戲未開始時顯示） -->
    <div v-if="!gameStarted" class="start-game-overlay">
      <button @click="handleStartPlaying" class="btn-start-main">
        <span class="start-btn-text">開始遊戲</span>
        <span class="start-btn-icon">🎮</span>
      </button>
    </div>

    <!-- 遊戲棋盤 -->
    <div class="game-board-wrapper">
      <div class="game-board" :style="boardGridStyle" ref="boardRef">
        <PokemonTile
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
      </div>

      <!-- SVG 連線路徑 -->
      <svg
        v-if="connectionPath.length > 0"
        class="connection-overlay"
        :viewBox="`0 0 ${boardWidth} ${boardHeight}`"
      >
        <polyline
          :points="connectionPath"
          class="connection-line"
          fill="none"
          stroke="#4CAF50"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="(point, i) in connectionPoints"
          :key="i"
          :cx="point.x"
          :cy="point.y"
          r="8"
          fill="#4CAF50"
          class="connection-dot"
        />
      </svg>
    </div>

    <!-- 連擊彈出效果 -->
    <transition name="combo-popup">
      <div v-if="showComboPopup" class="combo-popup">
        <span class="combo-text">{{ combo }}x COMBO!</span>
        <span class="combo-score">+{{ lastComboBonus }}</span>
      </div>
    </transition>

    <!-- 暫停選單 -->
    <transition name="modal">
      <div v-if="isPaused" class="modal-overlay" @click.self="resumeGame">
        <div class="modal pause-modal">
          <h2>⏸️ 遊戲暫停</h2>
          <div class="pause-stats">
            <p>當前關卡：{{ currentLevel }}</p>
            <p>當前分數：{{ score }}</p>
            <p>剩餘時間：{{ formatTime(timeLeft) }}</p>
          </div>
          <div class="modal-buttons">
            <button @click="resumeGame" class="btn-primary">繼續遊戲</button>
            <button @click="handleRestartLevel" class="btn-secondary">
              重新開始
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 遊戲結束彈窗 -->
    <transition name="modal">
      <div v-if="gameOver" class="modal-overlay">
        <div class="modal game-over-modal">
          <h2>{{ isVictory ? '🎉 恭喜過關！' : '⏰ 時間到！' }}</h2>

          <div class="game-over-stats">
            <div class="stat-row">
              <span class="label">關卡：</span>
              <span class="value">{{ currentLevel }}</span>
            </div>
            <div class="stat-row">
              <span class="label">最終分數：</span>
              <span class="value highlight">{{ score }}</span>
            </div>
            <div class="stat-row">
              <span class="label">最高連擊：</span>
              <span class="value">{{ maxCombo }}x</span>
            </div>
            <div class="stat-row">
              <span class="label">使用時間：</span>
              <span class="value">{{ formatTime(totalTimeUsed) }}</span>
            </div>
            <div v-if="isVictory" class="stat-row">
              <span class="label">時間獎勵：</span>
              <span class="value bonus">+{{ timeBonus }}</span>
            </div>
          </div>

          <div v-if="isNewRecord" class="new-record">🏆 新紀錄！</div>

          <div class="modal-buttons">
            <button v-if="isVictory" @click="handleNextLevel" class="btn-primary">
              下一關 ▶️
            </button>
            <button @click="handleRestartLevel" class="btn-secondary">
              重新開始 🔄
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useMatchGameStore } from '@/stores/matchGameStore';
import { useMatchGame } from '@/composables/useMatchGame';
import { useGameTimer } from '@/composables/useGameTimer';
import { useGameBoard } from '@/composables/useGameBoard';

import InstructionsModal from '@/components/ui/InstructionsModal.vue';
import PokemonTile from '@/components/PokemonTile.vue';

const gameStore = useMatchGameStore();

// 使用 composables
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
  isPaused,
  gameOver,
  isVictory,
  isProcessing,
  showComboPopup,
  lastComboBonus,
  showInstructions,
  gameStarted,  // ← 確保這一行存在！
  rows,
  cols,
  initGameData,
  resetGame,
  nextLevel,
  calculateScore,
  formatTime,
  pauseGame,
  resumeGame,
  endGame,
  startPlaying,  // ← 確保這一行存在！
} = useMatchGame();

const {
  tiles,
  selectedIndices,
  hintIndices,
  connectionPath,
  connectionPoints,
  boardRef,
  boardWidth,
  boardHeight,
  boardGridStyle,
  initBoard,
  updatePathFinder,
  drawConnectionPath,
  hasAvailableMatches,
  shuffleTiles,
  findMatchablePair,
  getPathFinder,
} = useGameBoard(rows, cols);

const { startGameTimer, startComboTimer, stopAllTimers } = useGameTimer();

// 遊戲初始化（但不開始計時）
const initGame = () => {
  initBoard();
  initGameData();
  gameOver.value = false;
  isVictory.value = false;
  isProcessing.value = true;  // 設為 true 讓方塊無法點擊
};

// 開始遊戲（按下開始按鈕後才計時）
const handleStartPlaying = () => {
  startPlaying();
  startGameTimer(isPaused, timeLeft, totalTimeUsed, () => endGame(false));
};

// 監聽 gameStarted，開始後才能操作
watch(gameStarted, (started) => {
  if (started) {
    isProcessing.value = false;
  }
});

// 方塊點擊處理
const handleTileClick = (index: number) => {
  if (!gameStarted.value) return;  // 遊戲未開始時無法點擊
  
  const tile = tiles.value[index];
  if (!tile || isProcessing.value || tile.isMatched) return;

  hintIndices.value = [];

  if (selectedIndices.value.includes(index)) {
    selectedIndices.value = selectedIndices.value.filter((i) => i !== index);
    return;
  }

  if (selectedIndices.value.length >= 2) {
    selectedIndices.value = [];
  }

  selectedIndices.value.push(index);

  if (selectedIndices.value.length === 2) {
    checkMatch();
  }
};

// 檢查配對
const checkMatch = async () => {
  isProcessing.value = true;

  const idx1 = selectedIndices.value[0];
  const idx2 = selectedIndices.value[1];

  if (idx1 === undefined || idx2 === undefined) {
    isProcessing.value = false;
    return;
  }

  const tile1 = tiles.value[idx1];
  const tile2 = tiles.value[idx2];

  if (!tile1 || !tile2) {
    isProcessing.value = false;
    return;
  }

  if (tile1.pokemonId === tile2.pokemonId) {
    const pathFinder = getPathFinder();
    const result = pathFinder.findPath(idx1, idx2);

    if (result.found) {
      drawConnectionPath(result.path);

      await new Promise((resolve) => setTimeout(resolve, 400));

      tile1.isMatched = true;
      tile2.isMatched = true;

      combo.value++;
      maxCombo.value = Math.max(maxCombo.value, combo.value);

      const totalPoints = calculateScore(combo.value);
      score.value += totalPoints;
      lastComboBonus.value = (combo.value - 1) * 50;

      if (combo.value >= 3) {
        showComboPopup.value = true;
        setTimeout(() => {
          showComboPopup.value = false;
        }, 1500);
      }

      gameStore.incrementMatches();

      startComboTimer(combo);

      updatePathFinder();

      if (tiles.value.every((t) => t.isMatched || t.isEmpty)) {
        setTimeout(() => endGame(true), 500);
      } else {
        if (!hasAvailableMatches()) {
          await shuffleTiles();
        }
      }
    } else {
      await new Promise((resolve) => setTimeout(resolve, 300));
      combo.value = 0;
    }
  } else {
    await new Promise((resolve) => setTimeout(resolve, 300));
    combo.value = 0;
  }

  selectedIndices.value = [];
  connectionPath.value = '';
  connectionPoints.value = [];
  isProcessing.value = false;
};

// 使用道具
const handleUseHint = () => {
  if (hints.value <= 0 || isProcessing.value) return;

  hints.value--;
  score.value = Math.max(0, score.value - 50);

  const pair = findMatchablePair();
  if (pair) {
    hintIndices.value = pair;
    setTimeout(() => {
      hintIndices.value = [];
    }, 2000);
  }
};

const handleUseShuffle = async () => {
  if (shuffles.value <= 0 || isProcessing.value) return;

  shuffles.value--;
  score.value = Math.max(0, score.value - 100);
  isProcessing.value = true;

  await shuffleTiles();

  isProcessing.value = false;
};

const handleUseBomb = () => {
  if (bombs.value <= 0 || isProcessing.value) return;

  bombs.value--;
  isProcessing.value = true;

  const pair = findMatchablePair();
  if (pair) {
    selectedIndices.value = pair;
    setTimeout(() => {
      checkMatch();
    }, 300);
  } else {
    isProcessing.value = false;
  }
};

// 遊戲流程控制
const handleNextLevel = () => {
  nextLevel();
  stopAllTimers();
  initGame();
};

const handleRestartLevel = () => {
  resetGame();
  stopAllTimers();
  initGame();
};

// 生命週期
onMounted(() => {
  gameStore.loadFromStorage();
  initGame();
});

onUnmounted(() => {
  stopAllTimers();
});
</script>

<style scoped src="@/styles/match-game.css"></style>
