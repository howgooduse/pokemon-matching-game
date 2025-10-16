<template>
  <div class="game-container">
    <div class="game-playing">
      
      <!-- 遊戲標題區 -->
      <div class="game-header">
        <h1 class="game-title">寶可夢配對挑戰</h1>
        <div class="score-board">
          <div class="score-item correct" :class="{ 'animate-border': gameStore.showScoreAnimation && gameStore.animationType === 'correct' }">
            <div class="score-icon">✓</div>
            <div class="score-content">
              <div class="score-label">答對</div>
              <div class="score-value">{{ gameStore.correctCount }}</div>
            </div>
          </div>
          <div class="score-item wrong" :class="{ 'animate-border': gameStore.showScoreAnimation && gameStore.animationType === 'wrong' }">
            <div class="score-icon">✗</div>
            <div class="score-content">
              <div class="score-label">答錯</div>
              <div class="score-value">{{ gameStore.wrongCount }}</div>
            </div>
          </div>
          <button 
            v-if="gameStore.isGameActive" 
            @click="handleEndGame" 
            class="btn-end-game"
          >
            結束遊戲
          </button>
        </div>
      </div>

      <!-- 目標名字區域（正面朝上時顯示）-->
      <div class="target-section" v-if="gameStore.isGameActive && !gameStore.isShowingCards">
        <div class="target-info">
          <div class="target-label">找出這隻寶可夢</div>
          <div class="target-name">{{ gameStore.currentTargetName }}</div>
        </div>
        <div class="game-info">
          <div class="round-info">第 {{ gameStore.currentRound }} / {{ gameStore.maxRounds }} 局</div>
          <div class="timer-info" :class="{ 'warning': gameStore.timeRemaining <= 3 }">
            ⏱️ {{ gameStore.timeRemaining }}s
          </div>
        </div>
      </div>

      <!-- 洗牌提示（反面朝上時顯示）-->
      <div class="target-section shuffle-hint" v-if="gameStore.isShowingCards">
        <div class="target-label">🎴 洗牌中</div>
        <div class="target-hint">請稍候...</div>
      </div>

      <!-- 卡牌區域 -->
      <div class="game-board">
        <GuessMatchGameCard
          v-for="card in gameStore.cards"
          :key="card.id"
          :card="card"
          :get-pokemon-image-url="getPokemonImageUrl"
          :is-clickable="!gameStore.isChecking && gameStore.isGameActive && !gameStore.isShowingCards"
        />
      </div>

      <!-- 開始遊戲覆蓋層 -->
      <div v-if="!gameStore.isGameActive && gameStore.currentRound === 0" class="start-game-overlay">
        <div class="overlay-content">
          <div class="menu-title">🎮 寶可夢配對挑戰</div>
          <div class="menu-subtitle">找出正確的寶可夢卡片</div>
          <button @click="handleStartGame" class="btn-start-main">
            <span class="start-btn-text">開始遊戲</span>
            <span class="start-btn-icon">🎮</span>
          </button>
          <div class="game-rules">
            <p>📜 遊戲規則：</p>
            <p>⏱️ 每回合 10 秒限時</p>
            <p>🎯 共 50 回合挑戰</p>
            <p>🏆 挑戰你的記憶力！</p>
          </div>
        </div>
      </div>

      <!-- 遊戲結束視窗 -->
      <div v-if="!gameStore.isGameActive && gameStore.currentRound > 0" class="game-result-overlay">
        <div class="result-content">
          <div class="result-title">🎉 遊戲結束！</div>
          <div class="result-stats">
            <div class="stat-item total-stat">
              <div class="stat-label">總回合</div>
              <div class="stat-value">{{ gameStore.currentRound - 1 }}</div>
            </div>
            <div class="stat-item correct-stat">
              <div class="stat-label">✓ 答對</div>
              <div class="stat-value">{{ gameStore.correctCount }}</div>
            </div>
            <div class="stat-item wrong-stat">
              <div class="stat-label">✗ 答錯</div>
              <div class="stat-value">{{ gameStore.wrongCount }}</div>
            </div>
            <div class="stat-item score-stat">
              <div class="stat-label">📊 正確率</div>
              <div class="stat-value">
                {{ gameStore.correctCount + gameStore.wrongCount > 0 
                   ? Math.round((gameStore.correctCount / (gameStore.correctCount + gameStore.wrongCount)) * 100) 
                   : 0 }}%
              </div>
            </div>
          </div>
          <div class="result-ratio">
            <div class="ratio-bar">
              <div 
                class="ratio-correct" 
                :style="{ 
                  width: gameStore.correctCount + gameStore.wrongCount > 0 
                    ? `${(gameStore.correctCount / (gameStore.correctCount + gameStore.wrongCount)) * 100}%` 
                    : '0%' 
                }"
              ></div>
            </div>
            <div class="ratio-text">
              答對 {{ gameStore.correctCount }} / 總共 {{ gameStore.correctCount + gameStore.wrongCount }} 題
            </div>
          </div>
          <button @click="handleRestart" class="btn-restart">
            <span>🔄 再玩一次</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useGuessMatchGameStore } from '@/stores/GuessMatchGameStore';
import GuessMatchGameCard from '@/components/game/GuessMatchGame/GuessMatchGameCard.vue';

const gameStore = useGuessMatchGameStore();

// 初始化遊戲
onMounted(() => {
  gameStore.initializeGame();
});

// 清理計時器
onUnmounted(() => {
  gameStore.stopTimer();
});

// 方法
const getPokemonImageUrl = (id: number) => {
  return `/assets/pokemon/${id}.png`;
};

const handleStartGame = () => {
  gameStore.startGame();
};

const handleRestart = () => {
  gameStore.initializeGame();
  gameStore.startGame();
};

const handleEndGame = () => {
  gameStore.endGame();
};
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.game-playing {
  position: relative;
  max-width: 900px;
  width: 100%;
}

/* 遊戲標題 */
.game-header {
  margin-bottom: 20px;
}

.game-title {
  text-align: center;
  font-size: 42px;
  font-weight: 800;
  color: white;
  margin: 0 0 20px 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* 分數板 */
.score-board {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.3s;
  border: 3px solid transparent;
}

.score-item:hover {
  transform: translateY(-2px);
}

.score-item.correct {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  border-color: #22c55e;
}

.score-item.wrong {
  background: linear-gradient(135deg, #f87171, #ef4444);
  border-color: #ef4444;
}

.score-icon {
  font-size: 32px;
  font-weight: bold;
  color: white;
}

.score-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
  line-height: 1;
}

/* 結束遊戲按鈕 */
.btn-end-game {
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  transition: all 0.3s;
}

.btn-end-game:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* 邊框亮燈動畫 */
@keyframes border-glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 
                0 0 60px rgba(255, 255, 255, 0.6), 
                0 4px 15px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
  }
}

.score-item.animate-border {
  animation: border-glow 0.5s ease-in-out 2;
}

/* 目標區域 */
.target-section {
  text-align: center;
  margin-bottom: 25px;
  padding: 25px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.target-info {
  margin-bottom: 15px;
}

.target-label {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  font-weight: 500;
}

.target-name {
  font-size: 56px;
  color: white;
  font-weight: 900;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
  margin-bottom: 5px;
}

.target-hint {
  font-size: 16px;
  color: #fde047;
  font-weight: 600;
  animation: pulse-hint 1.5s ease-in-out infinite;
}

.game-info {
  display: flex;
  justify-content: center;
  gap: 30px;
  font-size: 18px;
  color: white;
  font-weight: 600;
}

.timer-info {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  transition: all 0.3s;
}

.timer-info.warning {
  background: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  animation: pulse-warning 0.5s ease-in-out infinite;
}

@keyframes pulse-warning {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.round-info {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
}

.shuffle-hint {
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.5);
}

.shuffle-hint .target-label {
  font-size: 24px;
  color: #c4b5fd;
}

.shuffle-hint .target-hint {
  color: #c4b5fd;
}

@keyframes pulse-hint {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 卡牌區域 */
.game-board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  margin-bottom: 20px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.1);
}

/* 開始遊戲覆蓋層 */
.start-game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-radius: 20px;
}

.overlay-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.menu-title {
  font-size: 48px;
  font-weight: 800;
  color: white;
  margin-bottom: 10px;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
}

.menu-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-weight: 500;
}

.btn-start-main {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 20px 60px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
  transition: all 0.3s;
  animation: pulse-big 2s ease-in-out infinite;
  margin-bottom: 30px;
}

.btn-start-main:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(34, 197, 94, 0.7);
}

.start-btn-text {
  white-space: nowrap;
}

.start-btn-icon {
  font-size: 32px;
}

@keyframes pulse-big {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.game-rules {
  text-align: left;
  color: white;
  font-size: 16px;
  line-height: 1.8;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  max-width: 300px;
  margin: 0 auto;
}

.game-rules p {
  margin: 5px 0;
}

.game-rules p:first-child {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 18px;
}

/* 遊戲結束視窗 */
.game-result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.result-content {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 500px;
  animation: scaleIn 0.4s ease-out;
}

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.result-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 30px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.stat-item.total-stat {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
  border-color: #a78bfa;
}

.stat-item.correct-stat {
  background: linear-gradient(135deg, rgba(74, 222, 128, 0.3), rgba(34, 197, 94, 0.3));
  border-color: #4ade80;
}

.stat-item.wrong-stat {
  background: linear-gradient(135deg, rgba(248, 113, 113, 0.3), rgba(239, 68, 68, 0.3));
  border-color: #f87171;
}

.stat-item.score-stat {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
  border-color: #fbbf24;
}

.stat-label {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  font-weight: 600;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 比率視覺化 */
.result-ratio {
  margin: 30px 0;
}

.ratio-bar {
  width: 100%;
  height: 30px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 15px;
  box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2);
}

.ratio-correct {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transition: width 1s ease-out;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.5);
}

.ratio-text {
  font-size: 18px;
  color: white;
  font-weight: 600;
  text-align: center;
}

.btn-restart {
  padding: 18px 50px;
  border: none;
  border-radius: 50px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.5);
  transition: all 0.3s;
}

.btn-restart:hover {
  transform: scale(1.05);
  box-shadow: 0 15px 40px rgba(34, 197, 94, 0.7);
}

/* 響應式設計 - 平板 */
@media (max-width: 768px) {
  .game-container {
    padding: 12px;
  }

  .game-title {
    font-size: 32px;
  }

  .game-board {
    gap: 10px;
    padding: 16px;
  }

  .target-name {
    font-size: 42px;
  }

  .score-board {
    gap: 15px;
  }

  .score-item {
    padding: 12px 24px;
  }

  .score-value {
    font-size: 28px;
  }

  .menu-title {
    font-size: 36px;
  }

  .menu-subtitle {
    font-size: 18px;
  }
}

/* 響應式設計 - 手機 */
@media (max-width: 480px) {
  .game-title {
    font-size: 24px;
    margin-bottom: 15px;
  }

  .game-board {
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    padding: 12px;
  }

  .target-section {
    padding: 15px;
  }

  .target-name {
    font-size: 32px;
  }

  .target-label {
    font-size: 14px;
  }

  .score-board {
    gap: 10px;
    flex-wrap: wrap;
  }

  .score-item {
    padding: 10px 20px;
    gap: 8px;
  }

  .score-icon {
    font-size: 24px;
  }

  .score-value {
    font-size: 24px;
  }

  .score-label {
    font-size: 12px;
  }

  .btn-start-main {
    padding: 15px 40px;
    font-size: 22px;
  }

  .start-btn-icon {
    font-size: 26px;
  }

  .menu-title {
    font-size: 28px;
  }

  .menu-subtitle {
    font-size: 16px;
  }

  .overlay-content {
    padding: 25px 20px;
  }

  .game-rules {
    font-size: 14px;
    padding: 15px;
  }

  .btn-end-game {
    width: 100%;
    margin-top: 10px;
  }
}
</style>