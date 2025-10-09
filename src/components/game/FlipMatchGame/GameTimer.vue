<template>
  <div class="timer-container">
    <div class="timer-card">
      <div class="timer-icon-section">
        <div class="timer-icon">
          <v-icon :color="iconColor" size="32">
            {{ timeIcon }}
          </v-icon>
        </div>
      </div>
      
      <div class="timer-content">
        <div class="timer-label">剩餘時間</div>
        <div class="timer-display">{{ formattedTime }}</div>
      </div>
      
      <div class="timer-progress">
        <div 
          class="timer-progress-bar"
          :style="{ 
            width: `${timePercentage}%`,
            background: progressColor
          }"
        >
          <div class="timer-progress-glow"></div>
        </div>
      </div>
    </div>

    <!-- 時間警告 -->
    <!--<transition name="warning-fade">
      <div v-if="isLowTime" class="time-warning">
        <v-icon color="white">mdi-alert</v-icon>
        <span>時間快到了！</span>
      </div>
    </transition>-->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  timeRemaining: {
    type: Number,
    required: true
  },
  timeLimit: {
    type: Number,
    required: true
  }
});

const timePercentage = computed(() => {
  if (props.timeLimit === 0) return 0;
  return Math.max(0, Math.min(100, (props.timeRemaining / props.timeLimit) * 100));
});

const formattedTime = computed(() => {
  const minutes = Math.floor(props.timeRemaining / 60);
  const seconds = props.timeRemaining % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
});

const progressColor = computed(() => {
  const percentage = timePercentage.value;
  if (percentage <= 10) return '#ef4444';
  if (percentage <= 25) return '#f59e0b';
  if (percentage <= 50) return '#eab308';
  return '#4ade80';
});

const iconColor = computed(() => {
  const percentage = timePercentage.value;
  if (percentage <= 25) return 'red';
  return 'white';
});

const timeIcon = computed(() => {
  const percentage = timePercentage.value;
  if (percentage <= 10) return 'mdi-alarm';
  return 'mdi-clock-outline';
});

const isLowTime = computed(() => timePercentage.value <= 10);
</script>

<style scoped>
.timer-container {
  margin-bottom: 20px;
  animation: slideDown 0.6s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.timer-card {
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  overflow: hidden;
}

.timer-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, transparent 100%);
  pointer-events: none;
}

.timer-icon-section {
  flex-shrink: 0;
}

.timer-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.timer-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.timer-label {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.timer-display {
  font-size: 36px;
  font-weight: 800;
  color: white;
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.timer-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.timer-progress-bar {
  height: 100%;
  transition: width 1s linear, background 0.3s ease;
  position: relative;
}

.timer-progress-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 40px;
  height: 100%;
  background: inherit;
  filter: blur(10px);
  opacity: 0.8;
}

.time-warning {
  margin-top: 12px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  font-weight: 700;
  font-size: 16px;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.4);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}

.warning-fade-enter-active,
.warning-fade-leave-active {
  transition: all 0.3s ease;
}

.warning-fade-enter-from,
.warning-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 768px) {
  .timer-card {
    padding: 16px;
  }

  .timer-icon {
    width: 48px;
    height: 48px;
  }

  .timer-display {
    font-size: 32px;
  }

  .timer-label {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .timer-card {
    padding: 14px;
    gap: 12px;
  }

  .timer-icon {
    width: 44px;
    height: 44px;
  }

  .timer-display {
    font-size: 28px;
  }

  .time-warning {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>