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
    // 不管遊戲是否啟動，都可以重新初始化牌組 (例如：在 onMounted 時)
    stopTimer(); // 確保重新開始前停止計時器
    
    score.value = 0;
    timeLimit.value = initialTime;
    timeRemaining.value = initialTime;
    helpsRemaining.value = 3;
    flippedCards.value = [];
    isGameActive.value = false; // 根據參數設定遊戲狀態
    
    const allPokemonIds = Array.from({ length: 150 }, (_, i) => i + 1);
    const numPairs = deckSize / 2;
    const selectedIds = shuffleArray(allPokemonIds).slice(0, numPairs);
    
    const cardPairs: Card[] = [];
    let uniqueCardId = 0;
    
    selectedIds.forEach((id) => {
        // 第一張卡
        cardPairs.push({ 
            id: uniqueCardId++,
            pokemonId: id, 
            isFlipped: false, // 確保所有牌都是反面
            isMatched: false 
        });
        
        // 第二張卡
        cardPairs.push({ 
            id: uniqueCardId++,
            pokemonId: id, 
            isFlipped: false, // 確保所有牌都是反面
            isMatched: false 
        });
    });

    // 打亂最終卡牌列表
    cards.value = shuffleArray(cardPairs);

    cards.value = shuffleArray(cardPairs);
    cards.value.forEach(card => card.isFlipped = false); 
    
    
  }
  
  // ----------------- 計時器邏輯 -----------------
  const PREVIEW_DURATION = 1000; // 預覽時間 (毫秒)

  function startGame() {
    if (isGameActive.value) return; // 避免重複啟動

    // 1. 預覽：所有卡牌翻面 (isFlipped: true)
    cards.value.forEach(card => card.isFlipped = true);

    // 設定遊戲為活動狀態並啟動計時
    isGameActive.value = true; 

    // 2. 設置定時器：預覽結束後，正式開始遊戲
    setTimeout(() => {
        // 翻回：所有卡牌蓋回 (isFlipped: false)
        cards.value.forEach(card => card.isFlipped = false);
        startTimer();
    }, PREVIEW_DURATION);
  }

  function startTimer() {
    if (gameTimer.value !== null) clearInterval(gameTimer.value);

      gameTimer.value = window.setInterval(() => {
          if (timeRemaining.value > 0 && isGameActive.value) {
              timeRemaining.value--;
          } else {
              clearInterval(gameTimer.value!);
              if (isGameActive.value) {
                  endGame();
              }
          }
      // 【修正 2】：startTimer 應該只在 isGameActive.value = true 時才運行計數
      // 在 initializeGame 中我們已經設定了 isGameActive.value，所以這裡無需額外處理。
      }, 1000) as unknown as number; 
  }

  function stopTimer() {
   if (gameTimer.value !== null) clearInterval(gameTimer.value);
    gameTimer.value = null;
  }


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

  // 確認是否匹配
  function checkMatch() {
    const [card1, card2] = flippedCards.value;

    isChecking.value = false; // 檢查完成，設回 false

    if (!card1 || !card2) {
        flippedCards.value = [];
        return; 
    }

    if (card1.pokemonId === card2.pokemonId) {
      // **配對成功**
      // 【關鍵變更點】：在成功路徑中，我們不改變 isFlipped。
      // 它保持為 true，並由 isMatched 狀態在 GameCard.vue 中鎖定畫面。
      card1.isFlipped = true; // 鎖定狀態
      card2.isFlipped = true; // 鎖定狀態
      card1.isMatched = true; // 鎖定狀態
      card2.isMatched = true; // 鎖定狀態
           
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
    // *** 修正：確保在設置 isGameActive = false 之前，先檢查是否所有卡牌都匹配或時間耗盡 ***
    const isGameCompleted = cards.value.length > 0 && cards.value.every(c => c.isMatched);
    const isTimeExpired = timeRemaining.value <= 0;

    if (isGameCompleted || isTimeExpired) {
        isGameActive.value = false;
    }
    // **觸發分數提交流程**
    // 這裡應該調用一個 API 服務來提交 score.value 和 timeRemaining.value
    // 例如: submitScore(score.value, timeLimit.value - timeRemaining.value);
    console.log("Game Over! Final Score:", score.value);
  }

  return { 
    cards, score, timeLimit, timeRemaining, helpsRemaining, isGameActive, isChecking,
    initializeGame, flipCard, useHelp, endGame , startTimer, stopTimer,startGame
  };
});