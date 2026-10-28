<script setup lang="ts">
defineProps<{ show: boolean }>();
defineEmits<{ close: [] }>();

const RULES = [
  { icon: 'mdi-gesture-tap', title: '配對方塊', text: '點擊兩隻相同的寶可夢進行配對。' },
  { icon: 'mdi-vector-polyline', title: '連線規則', text: '兩個方塊之間的連線最多只能轉兩個彎，路徑上不能有其他方塊。' },
  { icon: 'mdi-timer-outline', title: '過關條件', text: '在時間內消除所有方塊即可過關，剩餘秒數會換成獎勵分數。' },
  {
    icon: 'mdi-lightbulb-on-outline',
    title: '道具',
    text: '提示：標出一組可配對的方塊。重排：打亂剩下的方塊。炸彈：自動消除一組。',
  },
] as const;
</script>

<template>
  <transition name="modal">
    <div v-if="show" class="ui-scrim" @click.self="$emit('close')">
      <div class="ui-panel" role="dialog" aria-modal="true" aria-labelledby="link-rules-title">
        <button type="button" class="close-btn" aria-label="關閉" @click="$emit('close')">
          <v-icon icon="mdi-close" size="20" />
        </button>

        <h2 id="link-rules-title" class="ui-panel__title">連連看玩法</h2>

        <ul class="rules">
          <li v-for="rule in RULES" :key="rule.title" class="rule">
            <v-icon :icon="rule.icon" size="22" class="rule__icon" />
            <div>
              <strong class="rule__title">{{ rule.title }}</strong>
              <p class="rule__text">{{ rule.text }}</p>
            </div>
          </li>
        </ul>

        <div class="ui-panel__actions">
          <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="$emit('close')">
            知道了
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.ui-panel {
  position: relative;
}

.close-btn {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-green);
  background: var(--c-yellow-soft);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.close-btn:hover {
  background: var(--c-yellow);
  transform: rotate(90deg);
}

.rules {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.rule {
  display: flex;
  gap: 14px;
  padding: 12px 14px;
  background: var(--c-bg);
  border-radius: var(--radius);
}

/* 每條規則的圖示輪流換色 */
.rule__icon {
  flex-shrink: 0;
  width: 38px !important;
  height: 38px !important;
  color: #fff;
  background: var(--c-tomato);
  border-radius: 50%;
}
.rule:nth-child(2) .rule__icon {
  color: var(--c-green);
  background: var(--c-yellow);
}
.rule:nth-child(3) .rule__icon {
  background: var(--c-sage);
}
.rule:nth-child(4) .rule__icon {
  color: var(--c-yellow);
  background: var(--c-green);
}

.rule__title {
  display: block;
  margin-bottom: 2px;
  font-size: 16px;
  color: var(--c-green);
}

.rule__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--c-ink-muted);
}
</style>
