// stores/LinkMatchGameStore.ts
import { defineStore } from 'pinia';

export interface PokemonCard {
  id: number;
  pokemonId: number;
  pokemonName: string;
  isFlipped: boolean;
  isCorrect: boolean;
  isFloating: boolean;
}

interface GameState {
  cards: PokemonCard[];
  currentTargetName: string;
  currentCorrectId: number;
  correctCount: number;
  wrongCount: number;
  isGameActive: boolean;
  isChecking: boolean;
  isShowingCards: boolean;
  score: number;
  currentRound: number;
  maxRounds: number;
  timeRemaining: number;
  timeLimit: number;
  timerId: number | null;
  showScoreAnimation: boolean;
  animationType: 'correct' | 'wrong' | null;
}

// 寶可夢資料介面
interface PokemonData {
  id: string;
  name: string;
  image_file_name: string;
}

// 寶可夢資料暫存（避免重複讀取檔案）
let POKEMON_DATA_CACHE: PokemonData[] | null = null;

// 從 pokemon.json 讀取寶可夢資料
async function loadPokemonData(): Promise<PokemonData[]> {
  // 如果已經載入過，直接返回暫存
  if (POKEMON_DATA_CACHE) {
    console.log('使用暫存的寶可夢資料');
    return POKEMON_DATA_CACHE;
  }

  try {
    console.log('首次讀取寶可夢資料...');
    const response = await fetch('/assets/pokemon.json');
    const data: PokemonData[] = await response.json();
    
    POKEMON_DATA_CACHE = data;
    console.log(`成功載入 ${POKEMON_DATA_CACHE.length} 隻寶可夢資料`);
    
    return POKEMON_DATA_CACHE;
  } catch (error) {
    console.error('讀取 pokemon.json 失敗:', error);
    // 發生錯誤時返回空陣列
    POKEMON_DATA_CACHE = [];
    return POKEMON_DATA_CACHE;
  }
}

export const useGuessMatchGameStore = defineStore('guessMatchGame', {
  state: (): GameState => ({
    cards: [],
    currentTargetName: '',
    currentCorrectId: 0,
    correctCount: 0,
    wrongCount: 0,
    isGameActive: false,
    isChecking: false,
    isShowingCards: false,
    score: 0,
    currentRound: 0,
    maxRounds: 50,
    timeRemaining: 10,
    timeLimit: 10,
    timerId: null,
    showScoreAnimation: false,
    animationType: null,
  }),

  actions: {
    // 初始化遊戲
    async initializeGame() {
      this.correctCount = 0;
      this.wrongCount = 0;
      this.score = 0;
      this.currentRound = 0;
      this.isGameActive = false;
      this.isChecking = false;
      this.isShowingCards = false;
      this.timeRemaining = this.timeLimit;
      this.stopTimer();
      
      // 確保寶可夢資料已載入
      await loadPokemonData();
      
      this.generateNewRound();
    },

    // 開始計時
    startTimer() {
      this.stopTimer();
      this.timeRemaining = this.timeLimit;
      
      this.timerId = window.setInterval(() => {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
          // 時間到，算錯誤
          this.handleTimeout();
        }
      }, 1000);
    },

    // 停止計時
    stopTimer() {
      if (this.timerId) {
        clearInterval(this.timerId);
        this.timerId = null;
      }
    },

    // 時間到的處理
    handleTimeout() {
      this.stopTimer();
      this.wrongCount++;
      this.animationType = 'wrong';
      this.showScoreAnimation = true;
      
      // 找到正確的卡片並發光抖動
      const correctCard = this.cards.find(c => c.isCorrect);
      if (correctCard) {
        correctCard.isFloating = true;
      }
      
      setTimeout(() => {
        this.showScoreAnimation = false;
        this.nextRound();
      }, 1500);
    },

    // 開始遊戲
    startGame() {
      this.isGameActive = true;
      this.isShowingCards = true;
      this.currentRound = 1;
      
      // 洗牌動畫：翻到背面（1秒）
      this.cards.forEach(card => {
        card.isFlipped = false;
      });

      // 1秒後翻成正面，開始遊戲
      setTimeout(() => {
        this.cards.forEach(card => {
          card.isFlipped = true;
        });
        this.isShowingCards = false;
        this.startTimer(); // 開始計時
      }, 1000);
    },

    // 生成新回合
    generateNewRound() {
      if (!POKEMON_DATA_CACHE || POKEMON_DATA_CACHE.length === 0) {
        console.error('寶可夢資料尚未載入');
        return;
      }

      const selectedIds = new Set<number>();
      while (selectedIds.size < 5) {
        const randomIndex = Math.floor(Math.random() * POKEMON_DATA_CACHE.length);
        const pokemonData = POKEMON_DATA_CACHE[randomIndex];
        if (pokemonData) {
          const pokemonId = parseInt(pokemonData.id);
          selectedIds.add(pokemonId);
        }
      }

      const idsArray = Array.from(selectedIds);
      const correctIndex = Math.floor(Math.random() * 5);
      this.currentCorrectId = idsArray[correctIndex] || 0;
      
      const correctPokemon = POKEMON_DATA_CACHE.find(p => parseInt(p.id) === this.currentCorrectId);
      this.currentTargetName = correctPokemon?.name || '';

      this.cards = idsArray.map((pokemonId, index) => {
        const pokemon = POKEMON_DATA_CACHE?.find(p => parseInt(p.id) === pokemonId);
        return {
          id: index,
          pokemonId,
          pokemonName: pokemon?.name || '',
          isFlipped: false,
          isCorrect: pokemonId === this.currentCorrectId,
          isFloating: false,
        };
      });
    },

    // 下一回合
    nextRound() {
      if (this.currentRound >= this.maxRounds) {
        // 遊戲結束
        this.endGame();
        return;
      }

      this.currentRound++;
      
      // 翻到背面（洗牌）
      this.cards.forEach(c => {
        c.isFlipped = false;
        c.isFloating = false;
      });
      
      this.isShowingCards = true;
      this.generateNewRound();
      
      // 1秒洗牌後翻成正面
      setTimeout(() => {
        this.cards.forEach(c => {
          c.isFlipped = true;
        });
        this.isShowingCards = false;
        this.isChecking = false;
        this.startTimer(); // 重新開始計時
      }, 1000);
    },

    // 選擇卡片
    async selectCard(card: PokemonCard) {
      if (this.isChecking || !this.isGameActive || this.isShowingCards) return;

      this.isChecking = true;
      this.stopTimer(); // 停止計時

      const correctCard = this.cards.find(c => c.isCorrect);

      if (card.isCorrect) {
        // 選對了
        this.correctCount++;
        this.score += 10;
        this.animationType = 'correct';
        
        if (correctCard) {
          correctCard.isFloating = true;
        }
      } else {
        // 選錯了
        this.wrongCount++;
        this.animationType = 'wrong';
        
        if (correctCard) {
          correctCard.isFloating = true;
        }
      }

      // 觸發分數動畫
      this.showScoreAnimation = true;

      // 1.5秒後進入下一回合
      setTimeout(() => {
        this.showScoreAnimation = false;
        this.nextRound();
      }, 1500);
    },

    // 遊戲結束
    endGame() {
      this.isGameActive = false;
      this.stopTimer();
    },
  },
});