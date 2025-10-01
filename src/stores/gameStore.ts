// src/stores/gameStore.ts

import { defineStore } from 'pinia';
import { ref } from 'vue';

// ----------------------------------------------------
// 1. 類型定義 (Interfaces)
// ----------------------------------------------------

// 卡牌數據結構
export interface Card {
  id: number;          // 唯一實例 ID (UUID)
  pokemonId: number;   // 配對 ID (例如：1-151)
  isFlipped: boolean;  // 是否面朝上
  isMatched: boolean;  // 是否已配對消除
}

// ----------------------------------------------------
// 2. 輔助函數 (Utility)
// ----------------------------------------------------

// Fisher-Yates 洗牌算法
function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      
      // **核心修正：使用非空斷言 (!) 告訴 TypeScript 索引是有效的**
      [array[i], array[j]] = [array[j]!, array[i]!]; 
    }
    return array;
  }

// ----------------------------------------------------
// 3. Pinia Store 定義
// ----------------------------------------------------

export const useGameStore = defineStore('game', () => {
  const cards = ref<Card[]>([]);
  const score = ref(0);
  const timeLimit = ref(60); // 默認 60 秒
  const timeRemaining = ref(60);
  const helpsRemaining = ref(3);
  const flippedCards = ref<Card[]>([]);
  const isGameActive = ref(false);
  const isChecking = ref(false); 
  const gameTimer = ref<number | null>(null);

  // ----------------- 遊戲初始化 -----------------
  function initializeGame(deckSize: number, initialTime: number) {
    if (isGameActive.value) return;

    score.value = 0;
    timeLimit.value = initialTime;
    timeRemaining.value = initialTime;
    helpsRemaining.value = 3;
    isGameActive.value = true;
    flippedCards.value = [];
    
    // 假設我們有 151 個寶可夢 ID 可選
    const allPokemonIds = Array.from({ length: 150 }, (_, i) => i + 1);
    
    // 確定需要多少對卡牌 (例如 4x4=16 張, 需要 8 對)
    const numPairs = deckSize / 2;
    
    // 隨機選取 numPairs 個寶可夢 ID
    const selectedIds = shuffleArray(allPokemonIds).slice(0, numPairs);
    
    const cardPairs: Card[] = [];
    let uniqueCardId = 0; // 【修正點：使用獨立計數器】
    
    selectedIds.forEach((id) => { // 不再使用 index 進行 ID 計算
        // 第一張卡
        cardPairs.push({ 
            id: uniqueCardId++, // 自動遞增
            pokemonId: id, 
            isFlipped: false, 
            isMatched: false 
        });
        
        // 第二張卡
        cardPairs.push({ 
            id: uniqueCardId++, // 自動遞增
            pokemonId: id, 
            isFlipped: false, 
            isMatched: false 
        });
    });

    // 打亂最終卡牌列表
    cards.value = shuffleArray(cardPairs);
    
    // 啟動計時器
    startTimer();
  }
  
  // ----------------- 計時器邏輯 -----------------
  function startTimer() {
    if (gameTimer.value !== null) clearInterval(gameTimer.value);

    // 關鍵修正：直接使用 window.setInterval，並用 <number> 斷言
    gameTimer.value = window.setInterval(() => {
      if (timeRemaining.value > 0 && isGameActive.value) {
        timeRemaining.value--;
      } else {
        // 使用非空斷言 (!) 告訴 TypeScript gameTimer.value 此時非空
        clearInterval(gameTimer.value!);
        // 檢查是否是時間耗盡導致遊戲結束
        if (isGameActive.value) {
          endGame();
        }
      }
    }, 1000) as unknown as number; // 您的寫法雖然較為繁瑣，但理應有效
    
    // **替代的、更清晰的寫法：**
    // gameTimer.value = window.setInterval(...) as number;
    // 因為在瀏覽器環境中，setInterval 的回傳值就是 number
  }

  function stopTimer() {
    if (gameTimer.value !== null) clearInterval(gameTimer.value);
    gameTimer.value = null;
  }

  // ----------------- 遊戲核心邏輯 -----------------
  
  // src/stores/gameStore.ts (部分修改)

// ... (省略前面的程式碼)

// ----------------- 遊戲核心邏輯 -----------------
  
  function flipCard(card: Card) {
    // 這裡已經確保了已配對的 (card.isMatched) 不能再點擊
    if (!isGameActive.value || card.isFlipped || card.isMatched || flippedCards.value.length === 2) {
      return;
    }

    card.isFlipped = true;
    flippedCards.value.push(card);

    if (flippedCards.value.length === 2) {
      // 暫停點擊，等待檢查
     isChecking.value = true;
      setTimeout(checkMatch, 1000); 
    }
  }

// src/stores/gameStore.ts (找到 checkMatch 函式)

 // src/stores/gameStore.ts (checkMatch 函式)

  function checkMatch() {
    const [card1, card2] = flippedCards.value;

    isChecking.value = false; // 檢查完成，設回 false

    if (!card1 || !card2) {
        flippedCards.value = [];
        return; 
    }

    if (card1.pokemonId === card2.pokemonId) {
      // **配對成功**
      card1.isFlipped = true; // 鎖定狀態
      card2.isFlipped = true; // 鎖定狀態
      card1.isMatched = true; // 鎖定狀態
      card2.isMatched = true; // 鎖定狀態
        
      // 【關鍵變更點】：在成功路徑中，我們不改變 isFlipped。
      // 它保持為 true，並由 isMatched 狀態在 GameCard.vue 中鎖定畫面。

      score.value += 10;
      flippedCards.value = [];
      
      // 檢查是否所有卡牌都匹配 (保留延遲 endGame)
      if (cards.value.length > 0 && cards.value.every(c => c.isMatched)) {
        setTimeout(endGame, 700); 
      } 
    } else {
      // **配對失敗：延遲翻回**
      setTimeout(() => {
        card1.isFlipped = false; // 【關鍵】只在失敗時才設為 false
        card2.isFlipped = false; 
      }, 100); 
      
      flippedCards.value = [];
    }
  }
  
  // ----------------- 幫助功能 -----------------
  function useHelp(type: 'match' | 'time') {
    if (helpsRemaining.value <= 0 || !isGameActive.value) return;

    if (type === 'time') {
      timeRemaining.value = Math.min(timeLimit.value, timeRemaining.value + 5); // 延長 5 秒
    } else if (type === 'match') {
      // 實現自動配對邏輯 (較複雜，這裡留作挑戰)
      // 簡化: 暫時將兩張未配對的卡翻開，等待 1 秒後消除
    }

    helpsRemaining.value--;
  }

  // ----------------- 遊戲結束 -----------------
  function endGame() {
    stopTimer();
    isGameActive.value = false;
    
    // **觸發分數提交流程**
    // 這裡應該調用一個 API 服務來提交 score.value 和 timeRemaining.value
    // 例如: submitScore(score.value, timeLimit.value - timeRemaining.value);
    console.log("Game Over! Final Score:", score.value);
  }

  return { 
    cards, score, timeLimit, timeRemaining, helpsRemaining, isGameActive, isChecking,
    initializeGame, flipCard, useHelp, endGame 
  };
});