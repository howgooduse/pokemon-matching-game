<script setup lang="ts">
// 使用相對路徑：從 src/App.vue 進入 views/ 找到 GamePlay.vue
import GamePlay from './views/GamePlay.vue'; 

// 這裡您可以引入其他全域組件，例如 Header.vue (如果您有)
// import Header from './components/Header.vue';
</script>

<template>
  <div id="app-root">
    
    <main class="main-content">
      <GamePlay />
    </main>

  </div>
</template>

<style>
/* ... 全域樣式 ... */
</style>