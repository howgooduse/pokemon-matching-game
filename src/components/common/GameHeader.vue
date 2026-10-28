<script setup lang="ts">
/** 三個遊戲共用的頁首：左側標題，右側數據，下方工具列 */
defineProps<{ title: string; subtitle?: string }>();
</script>

<template>
  <header class="game-header">
    <div class="game-header__titles">
      <h1 class="game-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="game-header__subtitle">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.stats" class="game-header__stats">
      <slot name="stats" />
    </div>
  </header>
  <div v-if="$slots.actions" class="game-toolbar">
    <slot name="actions" />
  </div>
</template>

<style scoped>
.game-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 6px;
}

/* 標題像貼紙：黃色底塊稍微歪一點 */
.game-header__title {
  display: inline-block;
  margin: 0;
  padding: 4px 18px 6px;
  font-size: 34px;
  font-weight: 900;
  line-height: 1.15;
  letter-spacing: 0.06em;
  color: var(--c-green);
  background: var(--c-yellow);
  border-radius: var(--radius);
  box-shadow: var(--edge-sm) var(--c-yellow-deep);
  transform: rotate(-2deg);
}

.game-header__subtitle {
  margin: 12px 0 0;
  font-size: 15px;
  font-weight: 500;
  color: var(--c-ink-muted);
}

.game-header__stats {
  display: flex;
  gap: 10px;
}

.game-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin: 18px 0 22px;
}

@media (max-width: 600px) {
  .game-header {
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }
  .game-header__titles {
    text-align: center;
  }
  .game-header__title {
    font-size: 26px;
  }
  .game-header__subtitle {
    font-size: 13px;
  }
  .game-header__stats {
    gap: 6px;
  }
  .game-toolbar {
    margin: 12px 0 16px;
  }
}
</style>
