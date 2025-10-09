<template>
  <v-dialog :model-value="true" persistent max-width="600">
    <v-card class="result-card">
      <div class="result-header">
        <div class="result-icon">{{ isWin ? '🎉' : '⏰' }}</div>
        <h1 class="result-title">{{ isWin ? '恭喜過關！' : '時間到！' }}</h1>
        <p class="result-subtitle">{{ isWin ? '完美完成挑戰' : '再接再厲' }}</p>
      </div>

      <v-card-text class="result-content">
        <div class="stats-grid">
          <div class="stat-item primary">
            <div class="stat-icon-bg">
              <v-icon color="amber" size="36">mdi-trophy-variant</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">最終分數</div>
              <div class="stat-value">{{ score }}</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon-bg">
              <v-icon color="blue" size="36">mdi-clock-outline</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">{{ isWin ? '完成時間' : '使用時間' }}</div>
              <div class="stat-value">{{ formattedTime }}</div>
            </div>
          </div>

          <div class="stat-item">
            <div class="stat-icon-bg">
              <v-icon color="green" size="36">mdi-cards</v-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">配對數</div>
              <div class="stat-value">{{ matchedCount }}</div>
            </div>
          </div>
        </div>
      </v-card-text>

      <v-card-actions class="result-actions">
        <v-btn
          color="pink-accent-3"
          variant="flat"
          size="large"
          block
          class="action-btn primary-btn"
          @click="$emit('restart')"
        >
          <v-icon left>mdi-refresh</v-icon>
          再玩一次
        </v-btn>
        <v-btn
          color="blue"
          variant="outlined"
          size="large"
          block
          class="action-btn"
          @click="$emit('backToMenu')"
        >
          <v-icon left>mdi-home</v-icon>
          返回主選單
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  isWin: {
    type: Boolean,
    required: true
  },
  score: {
    type: Number,
    required: true
  },
  timeTaken: {
    type: Number,
    required: true
  },
  matchedCount: {
    type: Number,
    required: true
  }
});

defineEmits(['restart', 'backToMenu']);

  const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeTaken / 60);
  const seconds = props.timeTaken % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
});
</script>

<style scoped>
.result-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  overflow: hidden;
}

.result-header {
  text-align: center;
  padding: 40px 24px 24px;
  position: relative;
}

.result-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.result-icon {
  font-size: 80px;
  margin-bottom: 16px;
  animation: bounceIn 0.8s ease-out;
  position: relative;
  z-index: 1;
}

@keyframes bounceIn {
  0% {
    transform: scale(0) rotate(-180deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.result-title {
  font-size: 40px;
  font-weight: 800;
  margin-bottom: 8px;
  text-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 1;
}

.result-subtitle {
  font-size: 18px;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.result-content {
  padding: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  animation: slideIn 0.5s ease-out backwards;
}

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.15s; }
.stat-item:nth-child(3) { animation-delay: 0.2s; }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-4px);
}

.stat-item.primary {
  grid-column: 1 / -1;
  background: rgba(251, 191, 36, 0.2);
  border-color: rgba(251, 191, 36, 0.3);
}

.stat-icon-bg {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  opacity: 0.85;
  margin-bottom: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.stat-item.primary .stat-value {
  font-size: 36px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.result-actions {
  padding: 24px;
  gap: 12px;
  display: flex;
  flex-direction: column;
}

.action-btn {
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
}

.primary-btn {
  box-shadow: 0 8px 24px rgba(245, 87, 108, 0.4);
}

.primary-btn:hover {
  box-shadow: 0 12px 32px rgba(245, 87, 108, 0.5);
  transform: translateY(-2px);
}

.action-btn:hover {
  transform: translateY(-2px);
}

/* 平板響應式 */
@media (max-width: 768px) {
  .result-header {
    padding: 28px 20px 20px;
  }

  .result-icon {
    font-size: 64px;
  }

  .result-title {
    font-size: 28px;
  }

  .result-subtitle {
    font-size: 16px;
  }

  .result-content {
    padding: 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item.primary {
    grid-column: 1;
  }

  .stat-item {
    padding: 16px;
  }

  .stat-icon-bg {
    width: 48px;
    height: 48px;
  }

  .stat-icon-bg :deep(.v-icon) {
    font-size: 28px !important;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-item.primary .stat-value {
    font-size: 28px;
  }

  .result-actions {
    padding: 18px;
  }
}

/* 手機響應式 - 更緊湊的佈局 */
@media (max-width: 480px) {
  /* Dialog 本身在小螢幕上調整 */
  .result-card {
    margin: 8px;
  }

  .result-header {
    padding: 20px 16px 16px;
  }

  .result-icon {
    font-size: 56px;
    margin-bottom: 12px;
  }

  .result-title {
    font-size: 24px;
    margin-bottom: 4px;
  }

  .result-subtitle {
    font-size: 14px;
  }

  .result-content {
    padding: 16px;
  }

  .stats-grid {
    gap: 10px;
  }

  .stat-item {
    padding: 12px;
    gap: 12px;
    border-radius: 12px;
  }

  .stat-icon-bg {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .stat-icon-bg :deep(.v-icon) {
    font-size: 24px !important;
  }

  .stat-label {
    font-size: 11px;
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-item.primary .stat-value {
    font-size: 24px;
  }

  .result-actions {
    padding: 16px;
    gap: 10px;
  }

  .action-btn {
    font-size: 15px;
    padding: 12px 20px;
  }

  .action-btn :deep(.v-icon) {
    font-size: 20px !important;
  }
}

/* 超小手機 (360px 以下) */
@media (max-width: 360px) {
  .result-header {
    padding: 16px 12px 12px;
  }

  .result-icon {
    font-size: 48px;
    margin-bottom: 8px;
  }

  .result-title {
    font-size: 22px;
  }

  .result-subtitle {
    font-size: 13px;
  }

  .result-content {
    padding: 12px;
  }

  .stats-grid {
    gap: 8px;
  }

  .stat-item {
    padding: 10px;
    gap: 10px;
  }

  .stat-icon-bg {
    width: 36px;
    height: 36px;
  }

  .stat-icon-bg :deep(.v-icon) {
    font-size: 20px !important;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-value {
    font-size: 18px;
  }

  .stat-item.primary .stat-value {
    font-size: 22px;
  }

  .result-actions {
    padding: 12px;
    gap: 8px;
  }

  .action-btn {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>