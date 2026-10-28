<script setup lang="ts">
import { computed } from 'vue';

/** 細長的剩餘時間條 */
const props = defineProps<{
  timeRemaining: number;
  timeLimit: number;
}>();

const percentage = computed(() =>
  props.timeLimit > 0
    ? Math.max(0, Math.min(100, (props.timeRemaining / props.timeLimit) * 100))
    : 0,
);
const isLow = computed(() => percentage.value <= 20);
</script>

<template>
  <div
    class="time-bar"
    role="progressbar"
    aria-label="剩餘時間"
    :aria-valuenow="timeRemaining"
    aria-valuemin="0"
    :aria-valuemax="timeLimit"
  >
    <div class="time-bar__fill" :class="{ 'is-low': isLow }" :style="{ width: `${percentage}%` }" />
  </div>
</template>

<style scoped>
/* 時間條：像一節錶帶，奶油黃填色、到最後變番茄紅 */
.time-bar {
  height: 16px;
  padding: 3px;
  overflow: hidden;
  background: var(--c-paper);
  border-radius: 999px;
  box-shadow:
    inset 0 0 0 2px var(--c-line),
    var(--edge-sm) var(--c-line);
}

.time-bar__fill {
  height: 100%;
  background: var(--c-sage);
  border-radius: inherit;
  transition:
    width 1s linear,
    background-color 0.3s ease;
}

.time-bar__fill.is-low {
  background: var(--c-tomato);
}
</style>
