<template>
  <div class="game-header">
    <div class="header-left">
      <button @click="$emit('pause')" class="icon-btn" title="暫停">⏸️</button>
      <button @click="$emit('show-instructions')" class="icon-btn" title="說明">
        ❓
      </button>
    </div>

    <div class="game-stats">
      <div class="stat-item">
        <span class="stat-label">關卡</span>
        <span class="stat-value level">{{ currentLevel }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">分數</span>
        <span class="stat-value score">{{ score }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">連擊</span>
        <span class="stat-value combo" :class="{ 'high-combo': combo >= 5 }">
          {{ combo }}x
        </span>
      </div>
      <div class="stat-item">
        <span class="stat-label">時間</span>
        <span class="stat-value time" :class="{ 'time-warning': timeLeft <= 30 }">
          {{ formatTime(timeLeft) }}
        </span>
      </div>
    </div>

    <div class="header-right">
      <button
        @click="$emit('use-hint')"
        :disabled="hints <= 0 || isProcessing"
        class="tool-btn"
        title="提示"
      >
        <span class="tool-icon-small">💡</span>
        <span class="tool-count-small">{{ hints }}</span>
      </button>

      <button
        @click="$emit('use-shuffle')"
        :disabled="shuffles <= 0 || isProcessing"
        class="tool-btn"
        title="重排"
      >
        <span class="tool-icon-small">🔄</span>
        <span class="tool-count-small">{{ shuffles }}</span>
      </button>

      <button
        @click="$emit('use-bomb')"
        :disabled="bombs <= 0 || isProcessing"
        class="tool-btn"
        title="炸彈"
      >
        <span class="tool-icon-small">💣</span>
        <span class="tool-count-small">{{ bombs }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  currentLevel: number;
  score: number;
  combo: number;
  timeLeft: number;
  hints: number;
  shuffles: number;
  bombs: number;
  isProcessing: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'pause'): void;
  (e: 'show-instructions'): void;
  (e: 'use-hint'): void;
  (e: 'use-shuffle'): void;
  (e: 'use-bomb'): void;
}>();

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<!-- 移除這行 -->
<!-- <style scoped src="@/styles/game/game-header.css"></style> -->