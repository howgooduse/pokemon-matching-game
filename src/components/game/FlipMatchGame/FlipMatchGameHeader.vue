<template>
  <div class="game-header">
    <!-- 分數卡片 -->
    <div class="stat-card score-card">
      <div class="stat-icon-wrapper">
        <div class="stat-icon">
          <v-icon color="amber" size="28">mdi-trophy-variant</v-icon>
        </div>
      </div>
      <div class="stat-content">
        <div class="stat-label">分數</div>
        <div class="stat-value score-value">{{ score }}</div>
      </div>
      <div class="stat-decoration"></div>
    </div>

    <!-- 配對進度卡片 -->
    <div class="stat-card progress-card">
      <div class="stat-icon-wrapper">
        <div class="stat-icon">
          <v-icon color="green" size="28">mdi-cards</v-icon>
        </div>
      </div>
      <div class="stat-content">
        <div class="stat-label">進度</div>
        <div class="stat-value progress-value">
          {{ matchedCount }}/{{ totalCards }}
        </div>
      </div>
      <div class="progress-mini-bar">
        <div 
          class="progress-mini-fill"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
    </div>

    <!-- 幫助次數卡片 -->
    <div class="stat-card helps-card">
      <div class="stat-icon-wrapper">
        <div class="stat-icon">
          <v-icon color="blue" size="28">mdi-lightbulb-on</v-icon>
        </div>
      </div>
      <div class="stat-content">
        <div class="stat-label">提示</div>
        <div class="stat-value helps-value">{{ helpsRemaining }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  score: {
    type: Number,
    required: true
  },
  matchedCount: {
    type: Number,
    required: true
  },
  totalCards: {
    type: Number,
    required: true
  },
  helpsRemaining: {
    type: Number,
    required: true
  }
});

const progressPercentage = computed(() => {
  if (props.totalCards === 0) return 0;
  return (props.matchedCount / props.totalCards) * 100;
});
</script>

<style scoped>
.game-header {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  animation: fadeInDown 0.6s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, transparent 100%);
  pointer-events: none;
}

.stat-card:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.stat-icon-wrapper {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.stat-icon {
  width: 52px;
  height: 52px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 28px;
  font-weight: 800;
  color: white;
  line-height: 1;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-variant-numeric: tabular-nums;
}

.score-card .score-value {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.progress-card {
  position: relative;
}

.progress-value {
  color: #4ade80;
}

.progress-mini-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.progress-mini-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80 0%, #22c55e 100%);
  transition: width 0.5s ease;
}

.helps-card .helps-value {
  color: #60a5fa;
}

.stat-decoration {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
}

@media (max-width: 768px) {
  .game-header {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .stat-card {
    padding: 14px;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
  }

  .stat-label {
    font-size: 11px;
  }

  .stat-value {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .game-header {
    gap: 8px;
  }

  .stat-card {
    padding: 12px;
    gap: 10px;
  }

  .stat-icon {
    width: 44px;
    height: 44px;
  }

  .stat-icon :deep(.v-icon) {
    font-size: 24px !important;
  }

  .stat-label {
    font-size: 10px;
  }

  .stat-value {
    font-size: 22px;
  }
}
</style>