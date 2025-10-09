import { defineStore } from 'pinia';

export interface MatchGameRecord {
  level: number;
  score: number;
  maxCombo: number;
  timeUsed: number;
  completedAt: Date;
}

export interface MatchGameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  difficulty: 'easy' | 'normal' | 'hard';
  showTimer: boolean;
  autoSave: boolean;
}

export interface MatchGameState {
  // 統計數據
  highScore: number;
  totalGamesPlayed: number;
  totalMatchesMade: number;
  bestLevel: number;
  bestCombo: number;
  totalTimePlayedSeconds: number;
  
  // 遊戲記錄
  gameHistory: MatchGameRecord[];
  
  // 設定
  settings: MatchGameSettings;
  
  // 當前遊戲狀態（用於暫存）
  currentGameState: {
    level: number;
    score: number;
    timeLeft: number;
    boardState: any[];
    hintsLeft: number;
    shufflesLeft: number;
    bombsLeft: number;
  } | null;
}

export const useMatchGameStore = defineStore('matchGame', {
  state: (): MatchGameState => ({
    highScore: 0,
    totalGamesPlayed: 0,
    totalMatchesMade: 0,
    bestLevel: 1,
    bestCombo: 0,
    totalTimePlayedSeconds: 0,
    gameHistory: [],
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      difficulty: 'normal',
      showTimer: true,
      autoSave: true,
    },
    currentGameState: null,
  }),

  getters: {
    // 獲取最高分數
    getHighScore: (state) => state.highScore,

    // 獲取平均分數
    getAverageScore: (state) => {
      if (state.gameHistory.length === 0) return 0;
      const total = state.gameHistory.reduce((sum, record) => sum + record.score, 0);
      return Math.round(total / state.gameHistory.length);
    },

    // 獲取最佳成績
    getBestCombo: (state) => state.bestCombo,

    // 獲取總遊戲時間（格式化）
    getFormattedPlayTime: (state) => {
      const hours = Math.floor(state.totalTimePlayedSeconds / 3600);
      const minutes = Math.floor((state.totalTimePlayedSeconds % 3600) / 60);
      const seconds = state.totalTimePlayedSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
    },

    // 獲取最近遊戲記錄
    getRecentGames: (state) => (limit: number = 10) => {
      return state.gameHistory
        .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
        .slice(0, limit);
    },

    // 獲取排行榜
    getLeaderboard: (state) => (limit: number = 10) => {
      return state.gameHistory
        .sort((a, b) => {
          // 先按分數排序，分數相同則按關卡排序
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return b.level - a.level;
        })
        .slice(0, limit)
        .map((record, index) => ({
          rank: index + 1,
          ...record,
        }));
    },

    // 獲取難度相關設定
    getDifficultySettings: (state) => {
      const difficulty = state.settings.difficulty;
      return {
        easy: {
          baseTime: 240, // 4分鐘
          hints: 5,
          shuffles: 3,
          bombs: 2,
          scoreMultiplier: 0.8,
        },
        normal: {
          //baseTime: 180, // 3分鐘
          baseTime: 300, // 5分鐘
          hints: 3,
          shuffles: 2,
          bombs: 1,
          scoreMultiplier: 1.0,
        },
        hard: {
          baseTime: 120, // 2分鐘
          hints: 2,
          shuffles: 1,
          bombs: 1,
          scoreMultiplier: 1.5,
        },
      }[difficulty];
    },

    // 統計資料
    getStats: (state) => ({
      totalGames: state.totalGamesPlayed,
      totalMatches: state.totalMatchesMade,
      highScore: state.highScore,
      bestLevel: state.bestLevel,
      bestCombo: state.bestCombo,
      averageScore: state.gameHistory.length > 0
        ? Math.round(state.gameHistory.reduce((sum, r) => sum + r.score, 0) / state.gameHistory.length)
        : 0,
      totalPlayTime: state.totalTimePlayedSeconds,
      winRate: state.gameHistory.length > 0
        ? Math.round((state.gameHistory.filter(r => r.level > 1).length / state.gameHistory.length) * 100)
        : 0,
    }),
  },

  actions: {
    // 保存遊戲記錄
    saveGameRecord(level: number, score: number, maxCombo: number, timeUsed: number) {
      const record: MatchGameRecord = {
        level,
        score,
        maxCombo,
        timeUsed,
        completedAt: new Date(),
      };

      this.gameHistory.push(record);
      this.totalGamesPlayed++;
      this.totalTimePlayedSeconds += timeUsed;

      // 更新最高分數
      if (score > this.highScore) {
        this.highScore = score;
      }

      // 更新最高關卡
      if (level > this.bestLevel) {
        this.bestLevel = level;
      }

      // 更新最高連擊
      if (maxCombo > this.bestCombo) {
        this.bestCombo = maxCombo;
      }

      // 限制歷史記錄數量（保留最近 100 筆）
      if (this.gameHistory.length > 100) {
        this.gameHistory = this.gameHistory.slice(-100);
      }

      // 清除暫存的遊戲狀態
      this.currentGameState = null;

      if (this.settings.autoSave) {
        this.saveToStorage();
      }
    },

    // 增加配對次數
    incrementMatches(count: number = 1) {
      this.totalMatchesMade += count;
    },

    // 保存當前遊戲狀態
    saveCurrentGame(gameState: any) {
      this.currentGameState = gameState;
      if (this.settings.autoSave) {
        this.saveToStorage();
      }
    },

    // 載入當前遊戲狀態
    loadCurrentGame() {
      return this.currentGameState;
    },

    // 清除當前遊戲狀態
    clearCurrentGame() {
      this.currentGameState = null;
      this.saveToStorage();
    },

    // 更新設定
    updateSettings(newSettings: Partial<MatchGameSettings>) {
      this.settings = { ...this.settings, ...newSettings };
      this.saveToStorage();
    },

    // 切換音效
    toggleSound() {
      this.settings.soundEnabled = !this.settings.soundEnabled;
      this.saveToStorage();
    },

    // 切換音樂
    toggleMusic() {
      this.settings.musicEnabled = !this.settings.musicEnabled;
      this.saveToStorage();
    },

    // 設定難度
    setDifficulty(difficulty: 'easy' | 'normal' | 'hard') {
      this.settings.difficulty = difficulty;
      this.saveToStorage();
    },

    // 重置所有數據
    resetAllData() {
      this.highScore = 0;
      this.totalGamesPlayed = 0;
      this.totalMatchesMade = 0;
      this.bestLevel = 1;
      this.bestCombo = 0;
      this.totalTimePlayedSeconds = 0;
      this.gameHistory = [];
      this.currentGameState = null;
      this.saveToStorage();
    },

    // 保存到 localStorage
    saveToStorage() {
      try {
        const data = {
          highScore: this.highScore,
          totalGamesPlayed: this.totalGamesPlayed,
          totalMatchesMade: this.totalMatchesMade,
          bestLevel: this.bestLevel,
          bestCombo: this.bestCombo,
          totalTimePlayedSeconds: this.totalTimePlayedSeconds,
          gameHistory: this.gameHistory,
          settings: this.settings,
          currentGameState: this.currentGameState,
          savedAt: new Date().toISOString(),
        };
        localStorage.setItem('pokemon-match-link-game', JSON.stringify(data));
      } catch (error) {
        console.error('儲存遊戲資料失敗:', error);
      }
    },

    // 從 localStorage 載入
    loadFromStorage() {
      try {
        const data = localStorage.getItem('pokemon-match-link-game');
        if (data) {
          const parsed = JSON.parse(data);
          
          this.highScore = parsed.highScore || 0;
          this.totalGamesPlayed = parsed.totalGamesPlayed || 0;
          this.totalMatchesMade = parsed.totalMatchesMade || 0;
          this.bestLevel = parsed.bestLevel || 1;
          this.bestCombo = parsed.bestCombo || 0;
          this.totalTimePlayedSeconds = parsed.totalTimePlayedSeconds || 0;
          
          this.gameHistory = (parsed.gameHistory || []).map((record: any) => ({
            ...record,
            completedAt: new Date(record.completedAt),
          }));
          
          this.settings = {
            ...this.settings,
            ...parsed.settings,
          };
          
          this.currentGameState = parsed.currentGameState || null;
          
          console.log('遊戲資料載入成功');
        }
      } catch (error) {
        console.error('載入遊戲資料失敗:', error);
      }
    },

    // 匯出遊戲資料（用於備份）
    exportData(): string {
      const data = {
        highScore: this.highScore,
        totalGamesPlayed: this.totalGamesPlayed,
        totalMatchesMade: this.totalMatchesMade,
        bestLevel: this.bestLevel,
        bestCombo: this.bestCombo,
        totalTimePlayedSeconds: this.totalTimePlayedSeconds,
        gameHistory: this.gameHistory,
        settings: this.settings,
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    },

    // 匯入遊戲資料
    importData(jsonString: string): boolean {
      try {
        const data = JSON.parse(jsonString);
        
        this.highScore = data.highScore || 0;
        this.totalGamesPlayed = data.totalGamesPlayed || 0;
        this.totalMatchesMade = data.totalMatchesMade || 0;
        this.bestLevel = data.bestLevel || 1;
        this.bestCombo = data.bestCombo || 0;
        this.totalTimePlayedSeconds = data.totalTimePlayedSeconds || 0;
        
        this.gameHistory = (data.gameHistory || []).map((record: any) => ({
          ...record,
          completedAt: new Date(record.completedAt),
        }));
        
        if (data.settings) {
          this.settings = { ...this.settings, ...data.settings };
        }
        
        this.saveToStorage();
        return true;
      } catch (error) {
        console.error('匯入資料失敗:', error);
        return false;
      }
    },
  },
});
