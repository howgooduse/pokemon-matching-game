<template>
  <div class="game-start-section">
    <div class="game-title-area">
      <h1 class="game-title">🔗 寶可夢連連看</h1>
      <p class="game-subtitle">Pokemon Match Link Game</p>
    </div>
    
    <div class="start-controls">
      <button @click="$emit('start')" class="btn-start-game">
        🎮 開始遊戲
      </button>
      <button @click="$emit('show-instructions')" class="btn-instructions">
        ❓ 玩法說明
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineEmits<{
  (e: 'start'): void;
  (e: 'show-instructions'): void;
}>();
</script>

<!-- 移除這行 -->
<!-- <style scoped src="@/styles/game/game-start.css"></style> -->