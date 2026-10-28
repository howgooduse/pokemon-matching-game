import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  LINK_DIFFICULTY_SETTINGS,
  type LinkDifficulty,
  type LinkGameRecord,
  type LinkGameSettings,
} from '@/types/link';

const STORAGE_KEY = 'pokemon-match-link-game';
const MAX_HISTORY = 100;

const DEFAULT_SETTINGS: LinkGameSettings = {
  soundEnabled: true,
  musicEnabled: true,
  difficulty: 'normal',
  showTimer: true,
  autoSave: true,
};

interface StoredRecord extends Omit<LinkGameRecord, 'completedAt'> {
  completedAt: string;
}

interface StoredData {
  highScore?: number;
  totalGamesPlayed?: number;
  totalMatchesMade?: number;
  bestLevel?: number;
  bestCombo?: number;
  totalTimePlayedSeconds?: number;
  gameHistory?: StoredRecord[];
  settings?: Partial<LinkGameSettings>;
}

/** 連連看：紀錄、統計與設定（自動存取 localStorage） */
export const useLinkGameStore = defineStore('linkGame', () => {
  const highScore = ref(0);
  const totalGamesPlayed = ref(0);
  const totalMatchesMade = ref(0);
  const bestLevel = ref(1);
  const bestCombo = ref(0);
  const totalTimePlayedSeconds = ref(0);
  const gameHistory = ref<LinkGameRecord[]>([]);
  const settings = ref<LinkGameSettings>({ ...DEFAULT_SETTINGS });

  // ---------- getters ----------
  const difficultySettings = computed(() => LINK_DIFFICULTY_SETTINGS[settings.value.difficulty]);

  const stats = computed(() => {
    const history = gameHistory.value;
    const total = history.reduce((sum, r) => sum + r.score, 0);
    return {
      totalGames: totalGamesPlayed.value,
      totalMatches: totalMatchesMade.value,
      highScore: highScore.value,
      bestLevel: bestLevel.value,
      bestCombo: bestCombo.value,
      averageScore: history.length ? Math.round(total / history.length) : 0,
      totalPlayTime: totalTimePlayedSeconds.value,
      winRate: history.length
        ? Math.round((history.filter((r) => r.level > 1).length / history.length) * 100)
        : 0,
    };
  });

  /** 排行榜：分數高者優先，同分比關卡（不會改動原始紀錄順序） */
  const getLeaderboard = (limit = 10) =>
    [...gameHistory.value]
      .sort((a, b) => b.score - a.score || b.level - a.level)
      .slice(0, limit)
      .map((record, index) => ({ rank: index + 1, ...record }));

  // ---------- persistence ----------
  function saveToStorage() {
    try {
      const data: StoredData & { savedAt: string } = {
        highScore: highScore.value,
        totalGamesPlayed: totalGamesPlayed.value,
        totalMatchesMade: totalMatchesMade.value,
        bestLevel: bestLevel.value,
        bestCombo: bestCombo.value,
        totalTimePlayedSeconds: totalTimePlayedSeconds.value,
        gameHistory: gameHistory.value.map((r) => ({
          ...r,
          completedAt: r.completedAt.toISOString(),
        })),
        settings: settings.value,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('儲存遊戲資料失敗:', error);
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as StoredData;

      highScore.value = data.highScore ?? 0;
      totalGamesPlayed.value = data.totalGamesPlayed ?? 0;
      totalMatchesMade.value = data.totalMatchesMade ?? 0;
      bestLevel.value = data.bestLevel ?? 1;
      bestCombo.value = data.bestCombo ?? 0;
      totalTimePlayedSeconds.value = data.totalTimePlayedSeconds ?? 0;
      gameHistory.value = (data.gameHistory ?? []).map((r) => ({
        ...r,
        completedAt: new Date(r.completedAt),
      }));
      settings.value = { ...DEFAULT_SETTINGS, ...data.settings };
    } catch (error) {
      console.error('載入遊戲資料失敗:', error);
    }
  }

  // ---------- actions ----------
  function saveGameRecord(level: number, score: number, maxCombo: number, timeUsed: number) {
    gameHistory.value.push({ level, score, maxCombo, timeUsed, completedAt: new Date() });
    if (gameHistory.value.length > MAX_HISTORY) {
      gameHistory.value = gameHistory.value.slice(-MAX_HISTORY);
    }

    totalGamesPlayed.value++;
    totalTimePlayedSeconds.value += timeUsed;
    highScore.value = Math.max(highScore.value, score);
    bestLevel.value = Math.max(bestLevel.value, level);
    bestCombo.value = Math.max(bestCombo.value, maxCombo);

    if (settings.value.autoSave) saveToStorage();
  }

  function incrementMatches(count = 1) {
    totalMatchesMade.value += count;
  }

  function updateSettings(patch: Partial<LinkGameSettings>) {
    settings.value = { ...settings.value, ...patch };
    saveToStorage();
  }

  const setDifficulty = (difficulty: LinkDifficulty) => updateSettings({ difficulty });
  const toggleSetting = (key: 'soundEnabled' | 'musicEnabled' | 'showTimer' | 'autoSave') =>
    updateSettings({ [key]: !settings.value[key] });

  function resetAllData() {
    highScore.value = 0;
    totalGamesPlayed.value = 0;
    totalMatchesMade.value = 0;
    bestLevel.value = 1;
    bestCombo.value = 0;
    totalTimePlayedSeconds.value = 0;
    gameHistory.value = [];
    saveToStorage();
  }

  // store 建立時自動載入一次
  loadFromStorage();

  return {
    highScore,
    totalGamesPlayed,
    totalMatchesMade,
    bestLevel,
    bestCombo,
    totalTimePlayedSeconds,
    gameHistory,
    settings,
    difficultySettings,
    stats,
    getLeaderboard,
    saveGameRecord,
    incrementMatches,
    updateSettings,
    setDifficulty,
    toggleSetting,
    resetAllData,
    saveToStorage,
    loadFromStorage,
  };
});
