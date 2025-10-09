<script setup lang="ts">
import { useGameStore, type Card } from '@/stores/FlipMatchGameStore';

const props = defineProps<{
  card: Card;
  getPokemonImageUrl: (id: number) => string; 
  // 【新增】: 接收來自父組件的點擊權限狀態
  isClickable: boolean; 
}>();

const gameStore = useGameStore();

const handleClick = () => {
  // 【關鍵修正】：只有在卡片是可點擊狀態時，才執行翻牌邏輯
  if (props.isClickable) {
    gameStore.flipCard(props.card);
  }
};
</script>

<template>
  <div 
    class="card-container" 
    @click="handleClick" 
    :class="{ 
      'matched': card.isMatched,
      'disabled': !isClickable 
    }"
  >
    <div class="card" :class="{'flipped': card.isFlipped}">
      <div class="card-face back">
        <img src="/assets/pokeball.png" alt="Pokémon" class="pokeball-icon">
      </div>
      
      <div class="card-face front">
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
  
  /* 【核心修正】：使用長寬比確保卡牌是正方形，解決 Grid 容器高度崩塌問題 */
  aspect-ratio: 1 / 1; 
  
  perspective: 1000px; /* 3D 視角 */
  
  /* 確保圖片正確居中且不失真 */
  display: flex; 
  justify-content: center;
  align-items: center;
  
  /* 確保非可點擊狀態有視覺回饋 */
   cursor: pointer;
   transition: transform 0.1s ease;
}

/* 【新增樣式】：不可點擊狀態 (預覽或遊戲未開始時) */
.card-container.disabled {
    cursor: default !important; /* 顯示預設游標 */
    pointer-events: none !important; /* 阻止所有點擊事件 */
    /* 預覽時卡牌會翻面，不需降低不透明度 */
}

/* 確保已配對的卡牌被禁用 */
.card-container.matched {
    pointer-events: none !important;
    opacity: 0.5;
}

.card-container:hover:not(.disabled):not(.matched) {
    /* 直接修改 card-container 或 card 的 transform，而不是使用複雜的選擇器 */
    transform: scale(1.03); /* 輕微抬升效果 */
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  
  /* 讓卡牌內容隨著外部容器變化 */
  display: flex; 
  justify-content: center;
  align-items: center;
}

.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden; /* 隱藏未翻轉那一面 */
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  padding: 5%; /* 內縮邊距 */
  box-sizing: border-box;
}

.card-face.front {
  background-color: #f0f0f0; /* 卡牌正面背景 */
  transform: rotateY(180deg);
}

.card-face.back {
  background: linear-gradient(135deg, #f59e0b 0%, #dc2626 100%); /* 卡牌背面背景 */
  border: 4px solid #fff;
}

.card-face img {
  /* 確保圖片在卡牌內居中且保持比例 */
  max-width: 90%; 
  max-height: 90%;
  object-fit: contain;
}

.pokeball-icon {
  width: 70%;
  height: auto;
  opacity: 0.8;
}

/* 匹配的卡牌的淡出效果 */
[style*="opacity: 0.5"] {
  transition: opacity 0.5s ease-out;
}

/* 【手機優化】：確保小卡牌上的點擊區域足夠大 */
@media (max-width: 480px) {
  .card-face {
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }
  .card-face.back {
    border: 3px solid #fff;
  }
}
</style>@/stores/FlipMatchGameStore