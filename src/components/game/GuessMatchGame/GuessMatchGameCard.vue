<script setup lang="ts">
import { useGuessMatchGameStore, type PokemonCard } from '@/stores/GuessMatchGameStore';

const props = defineProps<{
  card: PokemonCard;
  getPokemonImageUrl: (id: number) => string;
  isClickable: boolean;
}>();

const gameStore = useGuessMatchGameStore();

const handleClick = () => {
  if (props.isClickable) {
    gameStore.selectCard(props.card);
  }
};

// 除錯：印出圖片路徑
const imageUrl = props.getPokemonImageUrl(props.card.pokemonId);
console.log('卡片 ID:', props.card.pokemonId, '圖片路徑:', imageUrl);
</script>

<template>
  <div 
    class="card-container" 
    @click="handleClick" 
    :class="{ 
      'disabled': !isClickable,
      'floating': card.isFloating
    }"
  >
    <div class="card" :class="{'flipped': card.isFlipped}">
      <!-- 背面 -->
      <div class="card-face back">
        <img src="/assets/pokeball.png" alt="寶可夢" class="pokeball-icon">
      </div>
      
      <!-- 正面 -->
      <div class="card-face front">
        <img 
          :src="getPokemonImageUrl(card.pokemonId)" 
          :alt="card.pokemonName"
          @error="(e) => console.error('圖片載入失敗:', card.pokemonId, e)"
        >
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
  transition: transform 0.2s ease;
}

.card-container:hover:not(.disabled) {
  transform: scale(1.05);
}

.card-container.disabled {
  cursor: default;
}

/* 發光效果 - 只發光不浮動 */
.card-container.floating {
  animation: glow-pulse 0.75s ease-out;
  z-index: 100;
}

.card-container.floating .card {
  animation: card-glow 0.75s ease-out;
}

@keyframes glow-pulse {
  0%, 100% {
    filter: drop-shadow(0 0 0 rgba(255, 215, 0, 0));
  }
  20%, 60% {
    filter: drop-shadow(0 0 20px rgba(255, 215, 0, 1)) 
            drop-shadow(0 0 40px rgba(255, 215, 0, 0.8))
            drop-shadow(0 0 60px rgba(255, 215, 0, 0.6));
  }
  40%, 80% {
    filter: drop-shadow(0 0 15px rgba(255, 215, 0, 0.8)) 
            drop-shadow(0 0 30px rgba(255, 215, 0, 0.6))
            drop-shadow(0 0 45px rgba(255, 215, 0, 0.4));
  }
}

@keyframes card-glow {
  0%, 100% {
    box-shadow: 0 0 0 rgba(255, 215, 0, 0);
  }
  20%, 60% {
    box-shadow: 0 0 25px rgba(255, 215, 0, 1),
                0 0 50px rgba(255, 215, 0, 0.8),
                0 0 75px rgba(255, 215, 0, 0.6);
  }
  40%, 80% {
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.8),
                0 0 40px rgba(255, 215, 0, 0.6),
                0 0 60px rgba(255, 215, 0, 0.4);
  }
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 5%;
  box-sizing: border-box;
}

.card-face.back {
  background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%);
  border: 4px solid #fff;
}

.card-face.front {
  background-color: #f0f0f0;
  transform: rotateY(180deg);
}

.card-face img {
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.pokeball-icon {
  width: 70%;
  height: auto;
  opacity: 0.8;
}

/* 手機優化 */
@media (max-width: 480px) {
  .card-face {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  
  .card-face.back {
    border: 3px solid #fff;
  }
}
</style>