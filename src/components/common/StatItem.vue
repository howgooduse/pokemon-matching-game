<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    tone?: 'default' | 'yellow' | 'tomato' | 'green';
  }>(),
  { tone: 'default' },
);
</script>

<template>
  <div class="stat" :class="`stat--${tone}`">
    <span class="stat__label">{{ label }}</span>
    <span class="stat__value">{{ value }}</span>
  </div>
</template>

<style scoped>
/* 數據膠囊：像錶帶上的一節色塊 */
.stat {
  --stat-bg: var(--c-paper);
  --stat-fg: var(--c-green);
  --stat-edge: var(--c-line);

  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  min-width: 76px;
  padding: 8px 14px 9px;
  background: var(--stat-bg);
  border-radius: var(--radius);
  box-shadow: var(--edge-sm) var(--stat-edge);
  transition:
    background-color 0.25s,
    box-shadow 0.25s;
}

.stat__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--stat-fg);
  opacity: 0.7;
}

.stat__value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--stat-fg);
  font-variant-numeric: tabular-nums;
}

.stat--yellow {
  --stat-bg: var(--c-yellow);
  --stat-edge: var(--c-yellow-deep);
}
.stat--tomato {
  --stat-bg: var(--c-tomato);
  --stat-fg: #fff;
  --stat-edge: var(--c-tomato-deep);
  animation: stat-wiggle 0.5s ease-in-out;
}
.stat--green {
  --stat-bg: var(--c-sage);
  --stat-fg: #fff;
  --stat-edge: var(--c-sage-deep);
}

@keyframes stat-wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-4deg);
  }
  75% {
    transform: rotate(4deg);
  }
}

@media (max-width: 600px) {
  .stat {
    flex: 1;
    min-width: 0;
    padding: 6px 6px 7px;
  }
  .stat__label {
    font-size: 11px;
  }
  .stat__value {
    font-size: 19px;
  }
}
</style>
