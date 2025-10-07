<script setup lang="ts">
import Header from '@/components/Header.vue';
</script>

<template>
  <v-app id="app-root">
    <!-- HeaderMenu -->
    <Header />
    <v-main class="main-content" style="padding-top: 25px !important;">
      <!-- 使用 router-view 來顯示不同頁面 -->
      <router-view />
    </v-main>
  </v-app>
</template>

<style>
/* ... 全域樣式 ... */
</style>