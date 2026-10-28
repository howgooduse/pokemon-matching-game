<script setup lang="ts">
import { POKEBALL_IMAGE, getPokemonImageUrl } from '@/utils/pokemon';

/**
 * 可翻轉的寶可夢卡牌（翻翻看、猜猜看共用）。
 * 純展示元件：不直接操作 store，點擊時 emit('select')。
 */
const props = withDefaults(
  defineProps<{
    pokemonId: number;
    alt?: string;
    flipped: boolean;
    matched?: boolean;
    highlighted?: boolean;
    disabled?: boolean;
  }>(),
  { alt: '', matched: false, highlighted: false, disabled: false },
);

const emit = defineEmits<{ select: [] }>();

const handleClick = () => {
  if (!props.disabled && !props.matched) emit('select');
};

const handleImageError = () => {
  console.error(`無法載入寶可夢圖片: ${props.pokemonId}`);
};
</script>

<template>
  <div
    class="card-container"
    :class="{ matched, disabled, highlighted }"
    role="button"
    :aria-disabled="disabled || matched"
    @click="handleClick"
  >
    <div class="card" :class="{ flipped }">
      <div class="card-face back">
        <img :src="POKEBALL_IMAGE" alt="寶可夢卡背" class="pokeball-icon" />
      </div>
      <div class="card-face front">
        <img
          :src="getPokemonImageUrl(pokemonId)"
          :alt="alt || `Pokemon ${pokemonId}`"
          @error="handleImageError"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-container {
  width: 100%;
  aspect-ratio: 1 / 1;
  perspective: 1000px;
  cursor: pointer;
  transition:
    transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
    opacity 0.4s ease-out;
}

.card-container:hover:not(.disabled):not(.matched) {
  transform: translateY(-4px) rotate(-1.5deg);
}

.card-container.disabled {
  cursor: default;
  pointer-events: none;
}

.card-container.matched {
  pointer-events: none;
  opacity: 0.3;
  transform: scale(0.94);
}

.card {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--radius);
  transition: transform 0.55s cubic-bezier(0.34, 1.3, 0.5, 1);
  transform-style: preserve-3d;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8%;
  border-radius: var(--radius);
  backface-visibility: hidden;
  box-sizing: border-box;
}

/* 卡背：奶油黃錶框＋番茄紅小圓點 */
.card-face.back {
  background-color: var(--c-yellow);
  background-image: radial-gradient(rgba(238, 91, 54, 0.22) 2px, transparent 2.5px);
  background-size: 14px 14px;
  box-shadow: 0 4px 0 var(--c-yellow-deep);
}

.card-face.back::after {
  content: '';
  position: absolute;
  inset: 7px;
  border: 2.5px dashed rgba(47, 91, 77, 0.28);
  border-radius: calc(var(--radius) - 6px);
  pointer-events: none;
}

/* 卡面：奶油紙 */
.card-face.front {
  background: var(--c-paper);
  box-shadow: 0 4px 0 var(--c-line);
  transform: rotateY(180deg);
}

.card-face img {
  max-width: 88%;
  max-height: 88%;
  object-fit: contain;
}

.pokeball-icon {
  width: 46%;
  height: auto;
}

/* 猜猜看：揭曉正確答案 */
.card-container.highlighted .card-face.front {
  background: var(--c-sage-soft);
  box-shadow:
    0 0 0 4px var(--c-tomato),
    0 8px 0 var(--c-tomato-deep);
}

.card-container.highlighted {
  z-index: 10;
  animation: reveal 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes reveal {
  0% {
    transform: scale(1);
  }
  40% {
    transform: scale(1.1) rotate(3deg);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 480px) {
  .card,
  .card-face {
    border-radius: var(--radius-sm);
  }
  .card-face.back::after {
    inset: 4px;
    border-width: 2px;
    border-radius: 8px;
  }
}
</style>
