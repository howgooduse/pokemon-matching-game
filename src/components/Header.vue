<template>
  <v-app-bar density="compact" app>
    <v-app-bar-title>
      <router-link to="/" class="text-decoration-none text-primary">
        <v-icon icon="mdi-pokeball" class="mr-2"></v-icon>
        POKEMON MATCH GAME
      </router-link>
    </v-app-bar-title>
    <v-spacer></v-spacer>
    <template v-if="display.smAndUp">
      <v-btn
        v-for="item in menuItems"
        :key="item.title"
        :to="item.route"
        variant="text"
      >
        {{ item.title }}
      </v-btn>
    </template>
    <template v-else>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
    </template>
  </v-app-bar>
  <v-navigation-drawer
    v-model="drawer"
    temporary
    :location="display.xs ? 'left' : undefined"
  >
    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.title"
        :to="item.route"
        :prepend-icon="item.icon"
        @click="drawer = false"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

// 取得 Vuetify 提供的螢幕尺寸資訊
const display = useDisplay();

// 控制 v-navigation-drawer 的開關
const drawer = ref(false);

// 選單項目列表
const menuItems = [
  { title: '連連看', icon: 'mdi-link-variant', route: '/' },
  { title: '翻翻看', icon: 'mdi-cards', route: '/flip-game' },
  { title: '猜猜看', icon: 'mdi-cards', route: '/guess-game' },
  { title: '瑪里歐', icon: 'mdi-cards', route: '/mario-spinner' }
];
</script>

<style scoped>
/* 確保 router-link 內文字顏色正確 */
.text-primary {
    color: var(--v-theme-primary); /* 使用 Vuetify 主題色 */
}
</style>