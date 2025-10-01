<script setup lang="ts">
import { onMounted, ref,computed } from 'vue';
import { useGameStore,type Card } from '../stores/gameStore';
import GameCard from '../components/GameCard.vue';
import { scoresApi } from '@/api';

const gameStore = useGameStore();
const deckSize = ref(16); // 預設 4x4 可以有 16 36 64 100 144
const initialTime = ref(60);

onMounted(() => {
  // 如果是第一次載入，可以自動初始化，或者等待用戶在 GameSetup 頁面點擊開始
  // gameStore.initializeGame(deckSize.value, initialTime.value);
});

// 模擬獲取寶可夢圖片的 URL
const getPokemonImageUrl = (id: number): string => {
  // **重要：替換為您的實際寶可夢圖片路徑**
  // 假設您的圖片檔名是 /public/assets/pokemon/1.png, 2.png, ...
  return `/assets/pokemon/${id}.png`; 
};

const gameoverAlert = computed(() =>{
    return !gameStore.isGameActive && !gameStore.isChecking && gameStore.cards.length > 0;
})

const timePercentage = computed(() => {
    // 確保 initialTime.value 大於 0 避免除以零
    if (initialTime.value > 0) {
        // 計算剩餘時間佔總時間的百分比
        return (gameStore.timeRemaining / initialTime.value) * 100;
    }
    return 0; // 遊戲未開始或時間為 0
});

// 計算進度條顏色
const timerBarColor = computed(() => {
    // 遊戲結束或時間用完時，顯示深灰色
    if (timePercentage.value <= 0) {
        // Vuetify 的顏色名稱：'grey'
        return 'grey'; 
    } 
    // 剩餘 10 秒及以下時為紅色
    else if (gameStore.timeRemaining <= 10) {
        return 'red-accent-3'; 
    } 
    // 預設為藍色
    else {
        return 'blue-accent-3'; 
    }
});

// 檢查遊戲是否結束，用於控制動畫效果
const isTimeUp = computed(() => timePercentage.value <= 0);

// 處理遊戲結束後的分數提交流程
const handleGameEnd = async () => {
    // 這裡調用您在 gameStore.ts 中設置的 endGame()
    // 我們需要在 gameStore 中確保 endGame 邏輯已經運行
    
    // 計算花費的時間
    const timeTakenSeconds = initialTime.value - gameStore.timeRemaining;
    
    try {
        const isGuest = !localStorage.getItem('jwtToken'); // 簡單判斷是否為訪客
        
        await scoresApi.submitScore({
            score: gameStore.score,
            timeTakenSeconds: timeTakenSeconds,
            deckSize: deckSize.value
        }, isGuest);
        
        console.log("Score submitted successfully!");
        alert(`遊戲結束！得分：${gameStore.score}，成績已記錄。`);

    } catch (error) {
        console.error("Score submission failed:", error);
        alert("分數提交失敗。");
    }
}
</script>

<template>
  <div class="game-container">
    <h1 class="text-3xl font-bold mb-4">寶可夢翻牌配對</h1>
<!--
    <div class="info-panel">
      <div>分數: {{ gameStore.score }}</div>
      <div>時間: {{ gameStore.timeRemaining }}s</div>
      <div>求助: {{ gameStore.helpsRemaining }} 次</div>
    </div>
    -->
    <div class="controls-panel">
        <v-btn density="default"
            color="blue-darken-2"
            @click="gameStore.initializeGame(deckSize, initialTime)" 
            :disabled="gameStore.isGameActive"> {{ gameStore.isGameActive ? '遊戲進行中' : '開始新遊戲' }}</v-btn>
      <!--
        <button 
                @click="gameStore.useHelp('time')" 
                :disabled="gameStore.helpsRemaining <= 0 || !gameStore.isGameActive"
                class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-2"
            >
                +5秒 ({{ gameStore.helpsRemaining }})
            </button>
        <button 
            @click="gameStore.useHelp('match')" 
            :disabled="gameStore.helpsRemaining <= 0 || !gameStore.isGameActive"
            class="bg-yellow-500 hover:bg-yellow-700 text-black font-bold py-2 px-4 rounded ml-2"
        >
            自動配對
        </button>
        -->
    </div>
<v-card 
        class="time-progress-card" 
        flat
        v-if="gameStore.isGameActive || gameStore.cards.length > 0">
        <div class="timer-bar-wrapper">
            <v-progress-linear
                :model-value="timePercentage"
                :color="timerBarColor"
                bg-color="grey-lighten-2"
                height="15"
                rounded="lg"
                :stream="!isTimeUp"
                :striped="!isTimeUp"
            ></v-progress-linear>
            
            <span class="timer-text">
                {{ gameStore.timeRemaining }}s
            </span>
        </div>
    </v-card>
    <div class="game-board" :style="{'grid-template-columns': `repeat(${Math.sqrt(deckSize)}, 1fr)`}">
      <GameCard
        v-for="card in gameStore.cards"
        :key="card.id"
        :card="card"
        :getPokemonImageUrl="getPokemonImageUrl"
      />
    </div>
    <v-dialog 
        v-model="gameoverAlert"
        width="auto">
        <div class="game-over-message">
            <div style="text-align: center;">使用時間 : {{ initialTime - gameStore.timeRemaining }} s</div>
            <!--關閉視窗-->
            <!--
            <v-btn density="default"
            color="blue-darken-2" class="ms-auto"
            text="Ok"
            @click="gameStore.isGameActive = false"
          ></v-btn>-->
          <!--再玩一次按鈕-->
          <v-btn density="default"
             class="ms-auto"
            color="blue-darken-2"
            @click="gameStore.initializeGame(deckSize, initialTime)">
             {{ '再玩一次' }}</v-btn>
        </div>
    </v-dialog>
    

  </div>
</template>

<style scoped>
.game-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
}

/* 限制計時器卡片的寬度，與遊戲版面保持一致 */
.time-progress-card {
    width: 100%;
    max-width: 600px; 
    margin-bottom: 20px;
}

/* 確保進度條的容器是相對定位，以便內部文字可以絕對定位 */
.timer-bar-wrapper {
    position: relative;
}

/* 將秒數文字疊加在進度條正中央 */
.timer-text {
    position: absolute;
    top: 50%; /* 垂直居中 */
    left: 50%; /* 水平居中 */
    transform: translate(-50%, -50%); /* 精確居中 */
    color: white; /* **白色顯示** */
    font-weight: bold;
    font-size: 0.8rem; /* 調整字體大小以適應高度 15px 的進度條 */
    z-index: 10; /* 確保文字在進度條上方 */
    /* 增加陰影讓文字在淺色背景上也能看得清楚 */
    text-shadow: 0 0 3px rgba(0, 0, 0, 0.7); 
}

.game-board {
    display: grid;
    /* 這裡使用 CSS Grid 佈局 */
    gap: 8px; /* 卡牌間距 */
    width: 100%;
    max-width: 600px; /* 限制最大寬度，適合手機 */
    aspect-ratio: 1 / 1; /* 保持正方形 */
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 10px;
}
.info-panel, .controls-panel {
    margin-bottom: 20px;
    text-align: center;
}
.game-over-message {
    margin-top: 20px;
    padding: 15px;
    border: 2px solid green;
    border-radius: 5px;
    background-color: #f0f0f0;
    opacity: 0.9;
}

</style>