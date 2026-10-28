<template>
  <div 
    class="pokemon-tile"
    :class="{
      'selected': isSelected,
      'matched': isMatched,
      'hint': isHint,
      'empty': isEmpty,
      'disabled': disabled
    }"
    @click="handleClick"
  >
    <div v-if="!isEmpty && !isMatched" class="tile-content">
      <img 
        :src="getPokemonImageUrl(pokemonId)" 
        :alt="`Pokemon ${pokemonId}`"
        class="pokemon-img"
        @error="handleImageError"
      />
      
    </div>
    
    <!-- 匹配成功動畫 -->
    <transition name="match">
      <div v-if="isMatched" class="match-particles">
        <div class="particle" v-for="i in 6" :key="i"></div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { getPokemonImageUrl } from '@/utils/pokemon';

const props = withDefaults(
  defineProps<{
    pokemonId: number;
    isSelected?: boolean;
    isMatched?: boolean;
    isHint?: boolean;
    isEmpty?: boolean;
    disabled?: boolean;
  }>(),
  { isSelected: false, isMatched: false, isHint: false, isEmpty: false, disabled: false },
);

const emit = defineEmits<{ click: [] }>();

const handleClick = () => {
  if (!props.disabled && !props.isMatched && !props.isEmpty) emit('click');
};

const handleImageError = () => {
  console.error(`無法載入寶可夢圖片: ${props.pokemonId}`);
};
</script>

<style scoped>
/* 使用 !important 避免被 Vuetify 預設樣式覆蓋 */
/* 方塊：奶油紙小方糖，放在森林綠棋盤上 */
.pokemon-tile {
  position: relative !important;
  aspect-ratio: 1 !important;
  min-width: 0;
  background: var(--c-paper) !important;
  border-radius: var(--radius-sm) !important;
  box-shadow: 0 3px 0 var(--c-yellow-deep) !important;
  cursor: pointer !important;
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.15s ease,
    box-shadow 0.15s ease !important;
}

.pokemon-tile:hover:not(.matched):not(.empty):not(.disabled) {
  transform: translateY(-2px);
  background: var(--c-yellow-soft) !important;
}

/* 已選取：整塊變奶油黃，外圈番茄紅，跳起來一點 */
.pokemon-tile.selected {
  z-index: 10;
  transform: translateY(-3px) scale(1.06);
  background: var(--c-yellow) !important;
  box-shadow:
    0 0 0 3px var(--c-tomato),
    0 5px 0 var(--c-tomato-deep) !important;
}

/* 提示：番茄紅外框＋左右搖擺（光暈放在 ::after，避免被 !important 陰影蓋掉） */
.pokemon-tile.hint {
  z-index: 20;
  background: var(--c-yellow-soft) !important;
  box-shadow:
    0 0 0 3px var(--c-tomato),
    0 3px 0 var(--c-tomato-deep) !important;
  animation: hint-wiggle 0.6s ease-in-out infinite;
}

.pokemon-tile.hint::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: inherit;
  box-shadow: 0 0 22px 6px rgba(248, 226, 124, 0.85);
  pointer-events: none;
  animation: hint-glow 1s ease-in-out infinite;
}

@keyframes hint-wiggle {
  0%,
  100% {
    transform: rotate(0);
  }
  25% {
    transform: rotate(-5deg);
  }
  75% {
    transform: rotate(5deg);
  }
}

@keyframes hint-glow {
  0%,
  100% {
    opacity: 0.35;
  }
  50% {
    opacity: 1;
  }
}

.pokemon-tile.matched {
  pointer-events: none;
  animation: match-fade 0.5s ease-out forwards;
}

@keyframes match-fade {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  40% {
    transform: scale(1.08);
  }
  100% {
    transform: scale(0.85);
    opacity: 0;
  }
}

.pokemon-tile.empty {
  background: transparent !important;
  box-shadow: none !important;
  cursor: default !important;
}

.tile-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pokemon-img {
  width: 72%;
  height: 72%;
  object-fit: contain;
  pointer-events: none;
}

@media (max-width: 599px) {
  .pokemon-img {
    width: 82%;
    height: 82%;
  }
}

@media (min-width: 1024px) {
  .pokemon-img {
    width: 64%;
    height: 64%;
  }
}

/* 配對成功的粒子 */
.match-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 9px;
  height: 9px;
  background: var(--c-yellow);
  border-radius: 50%;
  animation: particle-burst 0.55s ease-out forwards;
}

.particle:nth-child(1) { --angle: 0deg; }
.particle:nth-child(2) { --angle: 60deg; background: var(--c-tomato); animation-delay: 0.04s; }
.particle:nth-child(3) { --angle: 120deg; animation-delay: 0.08s; }
.particle:nth-child(4) { --angle: 180deg; background: var(--c-tomato); animation-delay: 0.12s; }
.particle:nth-child(5) { --angle: 240deg; animation-delay: 0.16s; }
.particle:nth-child(6) { --angle: 300deg; background: var(--c-tomato); animation-delay: 0.2s; }

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(42px) scale(0);
    opacity: 0;
  }
}
</style>
