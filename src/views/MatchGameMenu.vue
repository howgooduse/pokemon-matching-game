<template>
  <div class="menu-container">
    <!-- 遊戲標題 -->
    <div class="game-title">
      <h1>🔗 寶可夢連連看</h1>
      <p class="subtitle">Pokemon Match Link Game</p>
    </div>

    <!-- 主選單 -->
    <div class="main-menu">
      <button @click="startNewGame" class="menu-btn primary">
        <span class="btn-icon">🎮</span>
        <span class="btn-text">開始遊戲</span>
      </button>

      <button @click="continueSavedGame" class="menu-btn" :disabled="!hasSavedGame">
        <span class="btn-icon">▶️</span>
        <span class="btn-text">繼續遊戲</span>
      </button>

      <button @click="showStats = true" class="menu-btn">
        <span class="btn-icon">📊</span>
        <span class="btn-text">統計資料</span>
      </button>

      <button @click="showLeaderboard = true" class="menu-btn">
        <span class="btn-icon">🏆</span>
        <span class="btn-text">排行榜</span>
      </button>

      <button @click="showSettings = true" class="menu-btn">
        <span class="btn-icon">⚙️</span>
        <span class="btn-text">遊戲設定</span>
      </button>

      <button @click="showHowToPlay = true" class="menu-btn">
        <span class="btn-icon">❓</span>
        <span class="btn-text">遊戲說明</span>
      </button>
    </div>

    <!-- 快速統計 -->
    <div class="quick-stats">
      <div class="quick-stat-item">
        <span class="stat-icon">🎯</span>
        <div class="stat-content">
          <span class="stat-value">{{ gameStore.getHighScore }}</span>
          <span class="stat-label">最高分數</span>
        </div>
      </div>
      <div class="quick-stat-item">
        <span class="stat-icon">🏅</span>
        <div class="stat-content">
          <span class="stat-value">{{ gameStore.bestLevel }}</span>
          <span class="stat-label">最高關卡</span>
        </div>
      </div>
      <div class="quick-stat-item">
        <span class="stat-icon">🔥</span>
        <div class="stat-content">
          <span class="stat-value">{{ gameStore.bestCombo }}x</span>
          <span class="stat-label">最高連擊</span>
        </div>
      </div>
    </div>

    <!-- 統計資料彈窗 -->
    <transition name="modal">
      <div v-if="showStats" class="modal-overlay" @click.self="showStats = false">
        <div class="modal stats-modal">
          <h2>📊 統計資料</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-card-icon">🎮</div>
              <div class="stat-card-value">{{ stats.totalGames }}</div>
              <div class="stat-card-label">遊戲總場次</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">✨</div>
              <div class="stat-card-value">{{ stats.totalMatches }}</div>
              <div class="stat-card-label">總配對數</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">🎯</div>
              <div class="stat-card-value">{{ stats.highScore }}</div>
              <div class="stat-card-label">最高分數</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">🏅</div>
              <div class="stat-card-value">{{ stats.bestLevel }}</div>
              <div class="stat-card-label">最高關卡</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">🔥</div>
              <div class="stat-card-value">{{ stats.bestCombo }}x</div>
              <div class="stat-card-label">最高連擊</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">📈</div>
              <div class="stat-card-value">{{ stats.averageScore }}</div>
              <div class="stat-card-label">平均分數</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">⏱️</div>
              <div class="stat-card-value">{{ formatPlayTime(stats.totalPlayTime) }}</div>
              <div class="stat-card-label">總遊戲時間</div>
            </div>
            <div class="stat-card">
              <div class="stat-card-icon">💯</div>
              <div class="stat-card-value">{{ stats.winRate }}%</div>
              <div class="stat-card-label">過關率</div>
            </div>
          </div>
          <button @click="showStats = false" class="btn-close">關閉</button>
        </div>
      </div>
    </transition>

    <!-- 排行榜彈窗 -->
    <transition name="modal">
      <div v-if="showLeaderboard" class="modal-overlay" @click.self="showLeaderboard = false">
        <div class="modal leaderboard-modal">
          <h2>🏆 排行榜</h2>
          <div class="leaderboard-list">
            <div v-if="leaderboard.length === 0" class="empty-message">
              尚無遊戲記錄
            </div>
            <div
              v-for="record in leaderboard"
              :key="record.rank"
              class="leaderboard-item"
              :class="{ 'top-three': record.rank <= 3 }"
            >
              <div class="rank">
                <span v-if="record.rank === 1">🥇</span>
                <span v-else-if="record.rank === 2">🥈</span>
                <span v-else-if="record.rank === 3">🥉</span>
                <span v-else>{{ record.rank }}</span>
              </div>
              <div class="record-info">
                <div class="record-score">{{ record.score }} 分</div>
                <div class="record-details">
                  關卡 {{ record.level }} · 連擊 {{ record.maxCombo }}x
                </div>
              </div>
              <div class="record-date">
                {{ formatDate(record.completedAt) }}
              </div>
            </div>
          </div>
          <button @click="showLeaderboard = false" class="btn-close">關閉</button>
        </div>
      </div>
    </transition>

    <!-- 遊戲設定彈窗 -->
    <transition name="modal">
      <div v-if="showSettings" class="modal-overlay" @click.self="showSettings = false">
        <div class="modal settings-modal">
          <h2>⚙️ 遊戲設定</h2>
          
          <div class="settings-section">
            <h3>難度選擇</h3>
            <div class="difficulty-buttons">
              <button
                v-for="diff in difficulties"
                :key="diff.value"
                @click="setDifficulty(diff.value)"
                class="difficulty-btn"
                :class="{ active: settings.difficulty === diff.value }"
              >
                <span class="difficulty-icon">{{ diff.icon }}</span>
                <span class="difficulty-name">{{ diff.name }}</span>
                <span class="difficulty-desc">{{ diff.description }}</span>
              </button>
            </div>
          </div>

          <div class="settings-section">
            <h3>音效設定</h3>
            <div class="toggle-row">
              <span class="toggle-label">🔊 音效</span>
              <button
                @click="gameStore.toggleSound()"
                class="toggle-btn"
                :class="{ active: settings.soundEnabled }"
              >
                <span class="toggle-indicator"></span>
              </button>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">🎵 背景音樂</span>
              <button
                @click="gameStore.toggleMusic()"
                class="toggle-btn"
                :class="{ active: settings.musicEnabled }"
              >
                <span class="toggle-indicator"></span>
              </button>
            </div>
          </div>

          <div class="settings-section">
            <h3>其他設定</h3>
            <div class="toggle-row">
              <span class="toggle-label">⏰ 顯示計時器</span>
              <button
                @click="toggleShowTimer"
                class="toggle-btn"
                :class="{ active: settings.showTimer }"
              >
                <span class="toggle-indicator"></span>
              </button>
            </div>
            <div class="toggle-row">
              <span class="toggle-label">💾 自動儲存</span>
              <button
                @click="toggleAutoSave"
                class="toggle-btn"
                :class="{ active: settings.autoSave }"
              >
                <span class="toggle-indicator"></span>
              </button>
            </div>
          </div>

          <div class="settings-section danger-zone">
            <h3>危險區域</h3>
            <button @click="confirmReset" class="btn-danger">
              🗑️ 清除所有資料
            </button>
          </div>

          <button @click="showSettings = false" class="btn-close">關閉</button>
        </div>
      </div>
    </transition>

    <!-- 遊戲說明彈窗 -->
    <transition name="modal">
      <div v-if="showHowToPlay" class="modal-overlay" @click.self="showHowToPlay = false">
        <div class="modal how-to-play-modal">
          <h2>❓ 遊戲說明</h2>
          
          <div class="instruction-section">
            <h3>🎯 遊戲目標</h3>
            <p>在時間內消除所有相同的寶可夢配對即可過關！</p>
          </div>

          <div class="instruction-section">
            <h3>🎮 遊戲規則</h3>
            <ul>
              <li>點擊兩個相同的寶可夢進行配對</li>
              <li>兩個方塊之間的連線<strong>最多只能轉2次彎</strong></li>
              <li>連線路徑上<strong>不能有其他方塊阻擋</strong></li>
              <li>連續快速配對可以獲得<strong>連擊獎勵</strong></li>
            </ul>
          </div>

          <div class="instruction-section">
            <h3>🛠️ 道具說明</h3>
            <div class="tool-explanation">
              <div class="tool-item">
                <span class="tool-emoji">💡</span>
                <div class="tool-desc">
                  <strong>提示</strong>
                  <p>顯示一對可配對的方塊（扣 50 分）</p>
                </div>
              </div>
              <div class="tool-item">
                <span class="tool-emoji">🔄</span>
                <div class="tool-desc">
                  <strong>重排</strong>
                  <p>重新排列所有未配對的方塊（扣 100 分）</p>
                </div>
              </div>
              <div class="tool-item">
                <span class="tool-emoji">💣</span>
                <div class="tool-desc">
                  <strong>炸彈</strong>
                  <p>自動消除一對方塊（得 50 分）</p>
                </div>
              </div>
            </div>
          </div>

          <div class="instruction-section">
            <h3>💯 計分方式</h3>
            <ul>
              <li>每次配對：<strong>100 分</strong></li>
              <li>連擊加成：<strong>(連擊數 - 1) × 50 分</strong></li>
              <li>時間獎勵：<strong>剩餘秒數 × 10 分</strong></li>
              <li>難度倍率：簡單 0.8x / 普通 1.0x / 困難 1.5x</li>
            </ul>
          </div>

          <button @click="showHowToPlay = false" class="btn-close">開始遊戲</button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMatchGameStore } from '@/stores/LinkMatchGameStore';

const router = useRouter();
const gameStore = useMatchGameStore();

// UI 狀態
const showStats = ref(false);
const showLeaderboard = ref(false);
const showSettings = ref(false);
const showHowToPlay = ref(false);

// 遊戲設定
const settings = computed(() => gameStore.settings);
const stats = computed(() => gameStore.getStats);
const leaderboard = computed(() => gameStore.getLeaderboard(10));
const hasSavedGame = computed(() => gameStore.currentGameState !== null);

// 難度選項
const difficulties: Array<{
  value: 'easy' | 'normal' | 'hard';
  name: string;
  icon: string;
  description: string;
}> = [
  {
    value: 'easy',
    name: '簡單',
    icon: '😊',
    description: '時間充足，道具較多'
  },
  {
    value: 'normal',
    name: '普通',
    icon: '🙂',
    description: '標準難度，平衡挑戰'
  },
  {
    value: 'hard',
    name: '困難',
    icon: '😤',
    description: '時間緊迫，道具稀少'
  }
];

// 開始新遊戲
const startNewGame = () => {
  gameStore.clearCurrentGame();
  router.push('/match-game');
};

// 繼續遊戲
const continueSavedGame = () => {
  if (hasSavedGame.value) {
    router.push('/match-game');
  }
};

// 設定難度
const setDifficulty = (difficulty: 'easy' | 'normal' | 'hard') => {
  gameStore.setDifficulty(difficulty);
};

// 切換顯示計時器
const toggleShowTimer = () => {
  gameStore.updateSettings({ showTimer: !settings.value.showTimer });
};

// 切換自動儲存
const toggleAutoSave = () => {
  gameStore.updateSettings({ autoSave: !settings.value.autoSave });
};

// 確認重置資料
const confirmReset = () => {
  if (confirm('確定要清除所有資料嗎？此操作無法復原！')) {
    if (confirm('再次確認：這將刪除所有遊戲記錄、統計資料和設定！')) {
      gameStore.resetAllData();
      alert('所有資料已清除');
      showSettings.value = false;
    }
  }
};

// 格式化時間
const formatPlayTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// 格式化日期
const formatDate = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return '今天';
  if (days === 1) return '昨天';
  if (days < 7) return `${days} 天前`;
  
  return date.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric'
  });
};

onMounted(() => {
  gameStore.loadFromStorage();
});
</script>

<style scoped>
.menu-container {
  position: fixed;
  top: 64px; /* Vuetify app-bar 高度 */
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  box-sizing: border-box;
  gap: 30px;
  overflow-y: auto;
  z-index: 1;
}

/* 遊戲標題 */
.game-title {
  text-align: center;
  animation: title-appear 0.8s ease-out;
}

@keyframes title-appear {
  from {
    opacity: 0;
    transform: translateY(-30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.game-title h1 {
  font-size: 48px;
  color: white;
  margin: 0;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin-top: 10px;
  letter-spacing: 2px;
}

/* 主選單 */
.main-menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  max-width: 400px;
}

.menu-btn {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 18px 30px;
  border: none;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.95);
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.menu-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.menu-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-btn.primary {
  background: linear-gradient(135deg, #4caf50, #45a049);
  color: white;
}

.btn-icon {
  font-size: 28px;
}

.btn-text {
  flex: 1;
  text-align: left;
  font-weight: 600;
}

/* 快速統計 */
.quick-stats {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-stat-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 25px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 32px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

/* 彈窗樣式 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 24px;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal h2 {
  font-size: 32px;
  margin: 0 0 30px 0;
  text-align: center;
  color: #333;
}

.modal h3 {
  font-size: 20px;
  margin: 20px 0 15px 0;
  color: #555;
}

/* 統計卡片網格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.stat-card {
  background: linear-gradient(145deg, #f5f5f5, #ffffff);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-card-icon {
  font-size: 36px;
  margin-bottom: 10px;
}

.stat-card-value {
  font-size: 28px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 5px;
}

.stat-card-label {
  font-size: 12px;
  color: #666;
}

/* 排行榜 */
.leaderboard-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-message {
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
}

.leaderboard-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: #f5f5f5;
  transition: all 0.3s;
}

.leaderboard-item:hover {
  background: #eeeeee;
  transform: translateX(5px);
}

.leaderboard-item.top-three {
  background: linear-gradient(135deg, #fff9e6, #fffbf0);
  border: 2px solid #ffd700;
}

.rank {
  font-size: 24px;
  font-weight: bold;
  min-width: 50px;
  text-align: center;
  color: #667eea;
}

.record-info {
  flex: 1;
}

.record-score {
  font-size: 20px;
  font-weight: bold;
  color: #333;
}

.record-details {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.record-date {
  font-size: 12px;
  color: #999;
}

/* 設定區塊 */
.settings-section {
  margin: 25px 0;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 12px;
}

.difficulty-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 15px;
}

.difficulty-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: left;
}

.difficulty-btn:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.difficulty-btn.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.difficulty-icon {
  font-size: 28px;
}

.difficulty-name {
  font-size: 18px;
  font-weight: bold;
}

.difficulty-desc {
  font-size: 14px;
  opacity: 0.8;
}

.toggle-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #e0e0e0;
}

.toggle-row:last-child {
  border-bottom: none;
}

.toggle-label {
  font-size: 16px;
  color: #333;
}

.toggle-btn {
  position: relative;
  width: 60px;
  height: 32px;
  border: none;
  border-radius: 16px;
  background: #ccc;
  cursor: pointer;
  transition: background 0.3s;
}

.toggle-btn.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.toggle-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 24px;
  height: 24px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.toggle-btn.active .toggle-indicator {
  transform: translateX(28px);
}

.danger-zone {
  background: #fff5f5;
  border: 2px solid #ffcdd2;
}

.btn-danger {
  width: 100%;
  padding: 15px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-danger:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

/* 遊戲說明 */
.instruction-section {
  margin: 25px 0;
}

.instruction-section ul {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}

.instruction-section li {
  padding: 10px 15px;
  margin: 8px 0;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1.6;
}

.instruction-section strong {
  color: #667eea;
}

.tool-explanation {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
}

.tool-item {
  display: flex;
  align-items: flex-start;
  gap: 15px;
  padding: 15px;
  background: #f5f5f5;
  border-radius: 12px;
}

.tool-emoji {
  font-size: 32px;
  flex-shrink: 0;
}

.tool-desc {
  flex: 1;
}

.tool-desc strong {
  display: block;
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.tool-desc p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.btn-close {
  width: 100%;
  padding: 15px;
  margin-top: 20px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 彈窗動畫 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .modal,
.modal-leave-active .modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal,
.modal-leave-to .modal {
  transform: scale(0.9) translateY(20px);
}

/* 響應式設計 */
@media (max-width: 768px) {
  .game-title h1 {
    font-size: 36px;
  }

  .subtitle {
    font-size: 14px;
  }

  .menu-btn {
    padding: 15px 20px;
    font-size: 16px;
  }

  .btn-icon {
    font-size: 24px;
  }

  .quick-stats {
    width: 100%;
  }

  .quick-stat-item {
    flex: 1;
    min-width: 120px;
    padding: 12px 15px;
  }

  .stat-icon {
    font-size: 24px;
  }

  .stat-value {
    font-size: 20px;
  }

  .modal {
    padding: 30px 20px;
  }

  .modal h2 {
    font-size: 28px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .difficulty-btn {
    padding: 12px 15px;
  }

  .difficulty-name {
    font-size: 16px;
  }

  .difficulty-desc {
    font-size: 12px;
  }
}

/* 滾動條樣式 */
.modal::-webkit-scrollbar,
.leaderboard-list::-webkit-scrollbar {
  width: 8px;
}

.modal::-webkit-scrollbar-track,
.leaderboard-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb,
.leaderboard-list::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.modal::-webkit-scrollbar-thumb:hover,
.leaderboard-list::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>../stores/LinkMatchGameStore