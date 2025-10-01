import { defineStore } from 'pinia';
import { ref } from 'vue';

interface Card {
  id: number;
  pokemonId: number; // 用於判斷配對
  isFlipped: boolean;
  isMatched: boolean;
}

export const useGameStore = defineStore('game', () => {
  const cards = ref<Card[]>([]);
  const score = ref(0);
  const timeRemaining = ref(0);
  const helpsRemaining = ref(3);
  const flippedCards = ref<Card[]>([]);

  // **1. 初始化卡組**
  function initializeGame(deckSize: number) {
    // 根據 deckSize (例如 16/2=8 對) 生成一組寶可夢 ID
    const numPairs = deckSize / 2;
    // ... 邏輯：生成 ID 列表，打亂，創建 Card 對象
  }

  // **2. 處理翻牌**
  function flipCard(cardId: number) {
    const card = cards.value.find(c => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.value.length === 2) {
      return;
    }

    card.isFlipped = true;
    flippedCards.value.push(card);

    if (flippedCards.value.length === 2) {
      setTimeout(checkMatch, 1000); // 1秒後檢查是否配對
    }
  }

  // **3. 檢查配對邏輯**
// gameStore.ts 中的 checkMatch() 函數

function checkMatch() {
    const [card1, card2] = flippedCards.value;

    // 重要的檢查：確認卡牌數組有兩個元素
    if (!card1 || !card2) return;

    if (card1.pokemonId === card2.pokemonId) {
        // 配對成功：直接修改其引用，Pinia 會追蹤到
        card1.isMatched = true;
        card2.isMatched = true;
        score.value += 10;
        
    } else {
        // 配對失敗：
        // 為了避免 const 的問題，並且保證 UI 有時間顯示錯誤
        // 我們通常需要延遲執行翻回操作
        setTimeout(() => {
            // **核心修正：找到主數組中對應的卡牌並修改其 isFlipped 屬性**
            // 雖然 card1/card2 已經是引用，但這個方法更安全
            
            // 如果 card1 和 card2 是從 cards.value 取得的引用，這裡的修改應有效：
            card1.isFlipped = false; 
            card2.isFlipped = false; 
            
            // **如果上述仍無效，請使用 ID 查找 (最穩妥)**
            // 找到主 cards.value 陣列中的對象
            // const target1 = cards.value.find(c => c.id === card1.id);
            // const target2 = cards.value.find(c => c.id === card2.id);
            // if (target1) target1.isFlipped = false;
            // if (target2) target2.isFlipped = false;

            // 清空已翻轉列表
            flippedCards.value = [];
        }, 1000); // 延遲 1 秒，讓玩家看到翻錯了
        
        // 注意：如果使用 setTimeout，您需要將 flippedCards.value = [] 放到 setTimeout 內部
        return; // 配對失敗，等待計時器
    }
    
    // 配對成功，直接清空
    flippedCards.value = [];

    // ... 檢查遊戲是否結束 ...
}

  // **4. 幫助功能**
  function useHelp(type: 'match' | 'time') {
    if (helpsRemaining.value <= 0) return;

    if (type === 'match') {
      // 邏輯：找到一對未匹配的卡牌，暫時翻開並消除
    } else if (type === 'time') {
      timeRemaining.value += 5; // 延長 5 秒
    }

    helpsRemaining.value--;
  }
  
  return { cards, score, timeRemaining, helpsRemaining, initializeGame, flipCard, useHelp };
});