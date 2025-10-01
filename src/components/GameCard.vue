<script setup lang="ts">
import { useGameStore, type Card } from '@/stores/gameStore';

const props = defineProps<{
  card: Card;
  // 假設您有一個 function 來獲取寶可夢圖片 URL
  getPokemonImageUrl: (id: number) => string; 
}>();

const gameStore = useGameStore();

const handleClick = () => {
  gameStore.flipCard(props.card);
};
</script>

<template>
  <div class="card-container" @click="handleClick"
  :style="card.isMatched ? { pointerEvents: 'none' } : {}" 
  >
    <div class="card" 
    :class="{ 
        'flipped': card.isFlipped,
      }">     
      <div class="card-face back">
        <img src="/assets/pokeball.png" alt="Pokémon" class="pokeball-icon">
      </div>
      
      <div class="card-face front" :style="card.isMatched ? { 
      opacity: 0.5,
      pointerEvents: 'none'
  } : {}">
        <img :src="getPokemonImageUrl(card.pokemonId)" :alt="`Pokemon ${card.pokemonId}`">
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 為了響應式和翻轉效果，這裡需要一些 CSS */
.card-container {
  /* 確保卡牌在網格中大小一致 */
  width: 100%;
  height: 100%;
  perspective: 1000px; /* 3D 視角 */
}
.card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  cursor: pointer;
}

.flipped {
  transform: rotateY(180deg);
}


.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 確保背面在正面時不可見 */
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.front {
  background-color: white;
  /* 這裡現在保持乾淨，它的位置由父容器 .card 控制 */
}

.back {
  background-color: #e3350d; /* 寶可夢紅色 */
}


.card-face.front {
  background-color: white;
 transform: rotateY(180deg);
}

.card-face img {
    max-width: 80%;
    max-height: 80%;
}

</style>