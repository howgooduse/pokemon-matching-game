<template>
  <div class="game-container">
    
    <div class="game-playing"> 
      
      <!--<GameHeader
        :score="gameStore.score"
        :matched-count="matchedCount"
        :total-cards="gameStore.cards.length"
        :helps-remaining="gameStore.helpsRemaining"
      />-->

      <GameTimer
        :time-remaining="gameStore.timeRemaining"
        :time-limit="gameStore.timeLimit"
      />

      <div 
        class="game-board"
        :style="{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)` 
        }"
      >
        <GameCard
          v-for="card in gameStore.cards"
          :key="card.id"
          :card="card"
          :get-pokemon-image-url="getPokemonImageUrl" 
          :is-clickable="!gameStore.isChecking && gameStore.isGameActive"
          />
      </div>

      <div class="tools-bar">
        <!--<v-btn
          class="tool-button"
          :disabled="gameStore.helpsRemaining <= 0 || !gameStore.isGameActive"
          @click="gameStore.useHelp('match')"
        >
          <v-icon left>mdi-lightbulb-on</v-icon>
          提示 ({{ gameStore.helpsRemaining }})
        </v-btn>
        -->
        <v-btn
          class="tool-button danger"
          v-if="gameStore.isGameActive" @click="handlePause"
        >
          <v-icon left>mdi-pause</v-icon>
          暫停
        </v-btn>
      </div>

      <!-- 開始遊戲按鈕區（遊戲未開始時顯示） -->
    <div v-if="!gameStore.isGameActive && !showGameResult" class="start-game-overlay">
      <button @click="handleStartGame" class="btn-start-main">
        <span class="start-btn-text">開始遊戲</span>
        <span class="start-btn-icon">🎮</span>
      </button>
    </div>
     
    </div> <GameResult
      v-if="showGameResult"
      :is-win="isVictory"
      :score="gameStore.score"
      :time-taken="timeTaken"
      :matched-count="matchedCount"
      @restart="handleRestart"
      @back-to-menu="handleBackToMenu"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useGameStore } from '@/stores/FlipMatchGameStore';
import GameTimer from '@/components/game/FlipMatchGame/GameTimer.vue';
import GameResult from '@/components/game/FlipMatchGame/GameResult.vue';
import GameCard from '@/components/FlipMatchGameCard.vue';

const gameStore = useGameStore();

// 初始化遊戲
onMounted(() => {
  // 這樣 isGameActive 才會是 false，進而顯示主選單。
  gameStore.initializeGame(16, 60); 
});

// 清理
onUnmounted(() => {
  gameStore.stopTimer();
});

// 計算屬性
const gridSize = computed(() => {
  // 根據卡片數量計算網格大小（假設是正方形）
  return Math.sqrt(gameStore.cards.length);
});

const matchedCount = computed(() => {
  return gameStore.cards.filter(c => c.isMatched).length;
});

const isVictory = computed(() => {
  return gameStore.cards.length > 0 && gameStore.cards.every(c => c.isMatched);
});

const timeTaken = computed(() => {
  // 計算已用時間 (總時限 - 剩餘時間)
  return gameStore.timeLimit - gameStore.timeRemaining;
});

const showGameResult = computed(() => {
  // 【修正 1-2】：只有在遊戲不活動 (`!gameStore.isGameActive`) 且滿足以下任一條件時才顯示結果：
  // 1. 玩家勝利 (`isVictory`)
  // 2. 時間已耗盡 (`gameStore.timeRemaining <= 0`)
  //
  // 這樣可以防止在 `handleBackToMenu` (將 `isGameActive` 設為 `false`) 或
  // `handlePause` 時結果畫面立即跳出，除非遊戲真的結束。
  return !gameStore.isGameActive && gameStore.cards.length > 0 && (isVictory.value || gameStore.timeRemaining <= 0);
});

// 方法
const getPokemonImageUrl = (id:number) => {
  return `/assets/pokemon/${id}.png`;
};

// 【新增方法】：用於點擊「開始遊戲」按鈕
const handleStartGame = () => {
  // 【修正 2】：呼叫新的 startGame 邏輯
  gameStore.startGame(); 
};

const handlePause = () => {
  gameStore.stopTimer();
  gameStore.isGameActive = false; // 暫停時 isGameActive 設為 false
};

const handleRestart = () => {
  // 重新初始化數據，然後啟動遊戲
  gameStore.initializeGame(16, 60);
  gameStore.startGame();
};

const handleBackToMenu = () => {
  // 重新初始化數據，回到未開始狀態
  gameStore.initializeGame(16, 60);
};
</script>

<style scoped>

.game-playing {
  /* 【關鍵修正】：必須設定 position: relative 才能讓 overlay 絕對定位在其上方 */
  position: relative; 
  max-width: 900px;
  margin: 0 auto;
}

/* 遊戲選單/等待開始的 Overlay 樣式 */
.game-menu-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  
  /* 讓 overlay 覆蓋在 Header/Timer/Board/ToolsBar 上方 */
  z-index: 10; 
  
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  
  /* 透明磨砂背景，讓後面的牌組和計時器可見 */
  background: rgba(0, 0, 0, 0.1); 
  backdrop-filter: blur(2px);
  border-radius: 20px;
  
  color: white;
  text-align: center;
  padding: 20px;
}

/* ========== 開始遊戲按鈕 ========== */
.start-game-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 500;
}

.btn-start-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 15px;
  padding: 25px 70px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.5);
  transition: all 0.3s;
  animation: pulse-big 2s ease-in-out infinite;
}

.start-btn-text {
  font-size: 32px;
  font-weight: bold;
  white-space: nowrap;
}

.start-btn-icon {
  font-size: 36px;
}

.menu-title {
  font-size: 42px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 4px 6px rgba(0, 0, 0, 0.4);
}

.menu-subtitle {
  font-size: 18px;
  margin-bottom: 30px;
}

.start-button {
  /* 保持您提供的樣式 */
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%) !important;
  color: white !important;
  font-weight: bold;
}

/* Overlay 轉場效果 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.game-container {
  min-height: 100vh;
  /* 確保背景填滿整個畫面 */
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.game-playing {
  /* 限制最大寬度，避免在超大螢幕上卡牌過大 */
  max-width: 900px;
  margin: 0 auto;
}

.game-board {
  display: grid;
  /* 修正 Grid Gap：大螢幕 10px，小螢幕 8px */
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(10px);
  
  /* 【重要】：確保 .game-board 在沒有手動高度時能被內容撐開 (GameCard 的 aspect-ratio 會解決高度問題) */
  height: auto; 
}

.tools-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

/* --- 主選單樣式 (為手機優化) --- */
.game-menu-screen {
  max-width: 600px;
  margin: 15vh auto 0;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  text-align: center;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
}

.menu-title {
  font-size: 36px;
  margin-bottom: 8px;
  color: white;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.menu-subtitle {
  font-size: 16px;
  margin-bottom: 24px;
  color: #e0e0e0;
}

.start-button {
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%) !important;
  color: white !important;
  font-weight: bold;
  letter-spacing: 1px;
  transition: transform 0.2s ease;
}

.start-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 15px rgba(34, 197, 94, 0.6);
}

/* --- 響應式優化 (Media Queries) --- */

/* 平板/中等螢幕 (768px 以下) */
@media (max-width: 768px) {
  .game-container {
    padding: 12px;
  }

  .game-board {
    gap: 8px; /* 縮小卡牌間距 */
    padding: 16px;
  }

  .tools-bar {
    gap: 8px;
  }
}

/* 手機/小型螢幕 (480px 以下) */
@media (max-width: 480px) {
  .game-board {
    gap: 6px; /* 進一步縮小間距 */
    padding: 12px;
  }
  
  .game-menu-screen {
    padding: 20px;
    margin-top: 10vh;
  }
  
  .menu-title {
    font-size: 28px;
  }
  
  .menu-subtitle {
    font-size: 14px;
  }
}
</style>