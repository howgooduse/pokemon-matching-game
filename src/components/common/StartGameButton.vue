<script setup lang="ts">
/**
 * 覆蓋在棋盤上的開始 / 繼續畫面（父層需 position: relative）。
 * 預設 slot 可放規則說明。
 */
withDefaults(defineProps<{ label?: string; icon?: string }>(), {
  label: '開始遊戲',
  icon: 'mdi-play',
});

defineEmits<{ click: [] }>();
</script>

<template>
  <div class="start-overlay">
    <div class="start-overlay__content">
      <slot />
      <button type="button" class="ui-btn ui-btn--primary ui-btn--lg start-btn" @click="$emit('click')">
        <v-icon :icon="icon" size="22" />
        {{ label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.start-overlay {
  position: absolute;
  inset: 0;
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(29, 61, 51, 0.72);
  border-radius: calc(var(--radius-xl) - 6px);
}

.start-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 22px;
  text-align: center;
  color: var(--c-yellow-soft);
}

.start-btn {
  min-width: 210px;
  padding: 18px 40px;
  font-size: 21px;
  letter-spacing: 0.1em;
  animation: bob 1.6s ease-in-out infinite;
}

.start-btn:hover:not(:disabled),
.start-btn:active:not(:disabled) {
  animation: none;
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

@media (max-width: 600px) {
  .start-overlay {
    border-radius: calc(var(--radius-lg) - 4px);
  }
}
</style>
