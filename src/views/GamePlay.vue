<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useGameStore, type Card } from '@/stores/gameStore';
import GameCard from '@/components/GameCard.vue';
import { scoresApi } from '@/api';

const gameStore = useGameStore();
const deckSize = ref(16); // 預設 4x4
const initialTime = ref(60);

onMounted(() => {
     // *** 修正：第一次載入時必須初始化牌組，但不啟動計時器 (false) ***
    gameStore.initializeGame(deckSize.value, initialTime.value, false); 
});

// 新增：一個計算屬性，用於控制 GameCard 是否可被點擊
const isCardClickable = computed(() => {
    // 只有在遊戲進行中(isGameActive) 且 不在檢查配對中(isChecking) 時才能點擊
    return gameStore.isGameActive ;
});

// 模擬獲取寶可夢圖片的 URL
const getPokemonImageUrl = (id: number): string => {
    return `/assets/pokemon/${id}.png`; 
};

// 遊戲結束彈窗邏輯
const gameoverAlert = computed(() => {
    // 遊戲結束必須滿足以下兩個條件之一：
    // 1. 遊戲非進行中 (isGameActive=false)
    // 2. 牌組已經生成 (cards.length > 0)
    // 3. 排除首次載入時的誤判：檢查 timeRemaining 是否不等於 initialTime
    //    或者檢查是否所有卡牌都匹配。
    
    // 最可靠的方式：檢查遊戲是否被主動停止，並且牌組已完成。
    const gameFinished = gameStore.cards.length > 0 && 
                         (gameStore.cards.every(c => c.isMatched) || gameStore.timeRemaining <= 0);

    // 只有在遊戲狀態被設為非活動，並且遊戲確實結束 (時間到/完成配對) 時才顯示
    return !gameStore.isGameActive && gameFinished;
});

const timePercentage = computed(() => {
    if (initialTime.value > 0) {
        return (gameStore.timeRemaining / initialTime.value) * 100;
    }
    return 0;
});


const timerBarColor = computed(() => {
    if (timePercentage.value <= 0) {
        return 'grey'; 
    } 
    else if (gameStore.timeRemaining <= 10) {
        return 'red-accent-3'; 
    } 
    else {
        return 'blue-accent-3'; 
    }
});

// *** 關鍵修正：處理點擊開始遊戲按鈕的邏輯 ***
const startGame = () => {
    // 重新初始化遊戲 (會重新洗牌並啟動計時器)
    gameStore.initializeGame(deckSize.value, initialTime.value,true); 
};

// 處理再玩一次按鈕的邏輯
const onGameoverAlertClick = () => {
    // 這裡只需要初始化牌組，但**不啟動**計時器，讓使用者點擊「開始新遊戲」
    gameStore.initializeGame(deckSize.value, initialTime.value, false);
};

const isTimeUp = computed(() => timePercentage.value <= 0);

// 處理遊戲結束後的分數提交流程 (保持不變)
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
    <h1 class="text-2xl font-bold mb-4">Play 一對!</h1>
    <div class="controls-panel">
        <v-btn density="default" color="blue-darken-2" @click="startGame" 
            :disabled="gameStore.isGameActive"> {{ gameStore.isGameActive ? '遊戲中' : '開始遊戲' }}</v-btn>
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
       :getPokemonImageUrl="getPokemonImageUrl" :is-clickable="isCardClickable"
       :class="{'is-disabled': !isCardClickable}"/>
    </div>
    
    <v-dialog 
        v-model="gameoverAlert"
        width="auto">
        <div class="game-over-message">
            <div style="text-align: center;">使用時間 : {{ initialTime - gameStore.timeRemaining }} s</div>
          <v-btn density="default"
                class="ms-auto"
                color="blue-darken-2"
                @click="onGameoverAlertClick"> {{ '再玩一次' }}</v-btn>
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

.game-board > .is-disabled {
    /* 顏色變化：降低透明度，讓卡牌看起來像是「鎖住」或「變灰」 */
    opacity: 0.5; 
    
    /* 鼠標變化：顯示禁止符號，明確告知玩家無法點擊 */
    cursor: not-allowed; 
    
    /* (可選) 增加過渡效果，讓狀態變化更平滑 */
    transition: opacity 0.3s ease;
    pointer-events: none;
}

/* 如果您希望在滑鼠懸停時也保持禁止狀態 */
.game-board > .is-disabled:hover {
    /* 移除懸停時可能帶來的提升效果 (例如 scale 或 shadow) */
    transform: none; 
    box-shadow: none;
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