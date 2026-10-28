<script setup lang="ts">
import { computed } from 'vue';
import { formatTime } from '@/utils/format';

const props = defineProps<{
  isWin: boolean;
  score: number;
  timeTaken: number;
  matchedCount: number;
}>();

defineEmits<{ restart: []; backToMenu: [] }>();

const formattedTime = computed(() => formatTime(props.timeTaken));
</script>

<template>
  <div class="ui-scrim">
    <div class="ui-panel" role="dialog" aria-modal="true">
      <h2 class="ui-panel__title">{{ isWin ? '全部配對完成！' : '時間到' }}</h2>
      <p class="result-score">{{ score }}</p>
      <p class="result-caption">分數</p>

      <dl class="result-list">
        <div>
          <dt>{{ isWin ? '完成時間' : '使用時間' }}</dt>
          <dd>{{ formattedTime }}</dd>
        </div>
        <div>
          <dt>配對組數</dt>
          <dd>{{ matchedCount }}</dd>
        </div>
      </dl>

      <div class="ui-panel__actions">
        <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="$emit('restart')">
          再玩一次
        </button>
        <button
          type="button"
          class="ui-btn ui-btn--outline ui-btn--lg ui-btn--block"
          @click="$emit('backToMenu')"
        >
          回到開始畫面
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.result-score {
  margin: 0;
  font-size: 60px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  color: var(--c-tomato);
  font-variant-numeric: tabular-nums;
}

.result-caption {
  margin: 6px 0 20px;
  font-size: 14px;
  text-align: center;
  color: var(--c-ink-muted);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.result-list > div {
  display: flex;
  justify-content: space-between;
  padding: 11px 18px;
  background: var(--c-bg);
  border-radius: 999px;
}

.result-list dt {
  color: var(--c-ink-muted);
}

.result-list dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
</style>
