<template>
  <div 
    class="pokemon-tile"
    :class="{
      'selected': isSelected,
      'matched': isMatched,
      'hint': isHint,
      'empty': isEmpty
    }"
    @click="handleClick"
  >
    <div v-if="!isEmpty && !isMatched" class="tile-content">
      <img 
        :src="`/assets/pokemon/${pokemonId}.png`" 
        :alt="`Pokemon ${pokemonId}`"
        class="pokemon-img"
        @error="handleImageError"
      />
      
      <!-- 選中效果 -->
      <div v-if="isSelected" class="selection-ring"></div>
      
      <!-- 提示效果 -->
      <div v-if="isHint" class="hint-glow"></div>
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
import { ref } from 'vue';

interface Props {
  pokemonId: number;
  isSelected?: boolean;
  isMatched?: boolean;
  isHint?: boolean;
  isEmpty?: boolean;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  isMatched: false,
  isHint: false,
  isEmpty: false,
  disabled: false,
});

const emit = defineEmits<{
  click: [pokemonId: number];
}>();

const imageError = ref(false);

const handleClick = () => {
  if (!props.disabled && !props.isMatched && !props.isEmpty) {
    emit('click', props.pokemonId);
  }
};

const handleImageError = () => {
  imageError.value = true;
  console.error(`無法載入寶可夢圖片: ${props.pokemonId}`);
};
</script>

<style scoped>
/* 確保樣式不被 Vuetify 覆蓋 */
.pokemon-tile {
  position: relative !important;
  aspect-ratio: 1 !important;
  background: linear-gradient(145deg, #ffffff, #f0f0f0) !important;
  border-radius: 12px !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.5) !important;
  overflow: hidden !important;
}

.pokemon-tile:hover:not(.matched):not(.empty):not(.disabled) {
  transform: translateY(-4px) scale(1.05);
  box-shadow: 
    0 8px 16px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.pokemon-tile.selected {
  background: linear-gradient(145deg, #fff9c4, #ffeb3b);
  transform: scale(1.1);
  box-shadow: 
    0 0 20px rgba(255, 235, 59, 0.6),
    0 8px 16px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.pokemon-tile.hint {
  animation: hint-pulse 1s ease-in-out infinite;
  border: 4px solid #ffeb3b !important;
  background: linear-gradient(145deg, #fff9c4, #ffeb3b) !important;
  z-index: 20;
  position: relative;
}

.pokemon-tile.hint::before {
  content: '';
  position: absolute;
  inset: -8px;
  border: 3px solid #ffeb3b;
  border-radius: 16px;
  animation: hint-ring 1s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% {
    box-shadow: 
      0 0 30px rgba(255, 235, 59, 1),
      0 0 60px rgba(255, 235, 59, 0.8),
      0 8px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.15);
  }
  50% {
    box-shadow: 
      0 0 50px rgba(255, 235, 59, 1),
      0 0 100px rgba(255, 235, 59, 0.9),
      0 12px 24px rgba(0, 0, 0, 0.3);
    transform: scale(1.2);
  }
}

@keyframes hint-ring {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.1);
  }
}

.pokemon-tile.matched {
  pointer-events: none;
  animation: match-fade 0.6s ease-out forwards;
}

@keyframes match-fade {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2) rotate(10deg);
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}

.pokemon-tile.empty {
  background: transparent;
  box-shadow: none;
  cursor: default;
}

.tile-content {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.pokemon-img {
  width: 70%;
  height: 70%;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s;
  pointer-events: none;
}

/* 超小手機 - 圖片更大 */
@media (max-width: 374px) {
  .pokemon-img {
    width: 78%;
    height: 78%;
  }
}

/* 手機版 - 圖片大 */
@media (min-width: 375px) and (max-width: 599px) {
  .pokemon-img {
    width: 80%;
    height: 80%;
  }
}

/* 平板版 */
@media (min-width: 600px) and (max-width: 1023px) {
  .pokemon-img {
    width: 70%;
    height: 70%;
  }
}

/* 電腦版 - 圖片較小 */
@media (min-width: 1024px) {
  .pokemon-img {
    width: 55%;
    height: 55%;
  }
}

.pokemon-tile:hover .pokemon-img:not(.matched) {
  transform: scale(1.1);
}

.selection-ring {
  position: absolute;
  inset: -4px;
  border: 4px solid #ffeb3b;
  border-radius: 12px;
  animation: ring-pulse 1s ease-in-out infinite;
  pointer-events: none;
}

@keyframes ring-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

.hint-glow {
  position: absolute;
  inset: -10px;
  border: 5px solid #ffeb3b;
  border-radius: 20px;
  box-shadow: 
    0 0 30px rgba(255, 235, 59, 1),
    0 0 60px rgba(255, 235, 59, 0.8),
    inset 0 0 30px rgba(255, 235, 59, 0.6);
  pointer-events: none;
  animation: glow-pulse 1s ease-in-out infinite;
  background: rgba(255, 235, 59, 0.2);
}

@keyframes glow-pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: brightness(1.5);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.08);
    filter: brightness(2);
  }
}

.match-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  background: radial-gradient(circle, #ffeb3b, #ffc107);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  animation: particle-burst 0.6s ease-out forwards;
}

.particle:nth-child(1) { animation-delay: 0s; --angle: 0deg; }
.particle:nth-child(2) { animation-delay: 0.05s; --angle: 60deg; }
.particle:nth-child(3) { animation-delay: 0.1s; --angle: 120deg; }
.particle:nth-child(4) { animation-delay: 0.15s; --angle: 180deg; }
.particle:nth-child(5) { animation-delay: 0.2s; --angle: 240deg; }
.particle:nth-child(6) { animation-delay: 0.25s; --angle: 300deg; }

@keyframes particle-burst {
  0% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(var(--angle)) translateX(40px) scale(0);
    opacity: 0;
  }
}

.match-enter-active {
  animation: match-appear 0.4s ease-out;
}

@keyframes match-appear {
  from {
    transform: scale(0);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>