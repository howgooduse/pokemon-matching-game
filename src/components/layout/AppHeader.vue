<script setup lang="ts">
import { ref } from 'vue';
import { useDisplay } from 'vuetify';

interface MenuItem {
  title: string;
  icon: string;
  route: string;
}

const MENU_ITEMS: readonly MenuItem[] = [
  { title: '連連看', icon: 'mdi-link-variant', route: '/' },
  { title: '翻翻看', icon: 'mdi-cards-outline', route: '/flip-game' },
  { title: '猜猜看', icon: 'mdi-help-circle-outline', route: '/guess-game' },
];

const { smAndUp } = useDisplay();
const drawer = ref(false);
</script>

<template>
  <v-app-bar density="comfortable" flat color="transparent" class="app-bar">
    <router-link to="/" class="brand">
      <v-icon icon="mdi-pokeball" size="22" class="brand__icon" />
      <span class="brand__text">POKÉMON MATCH</span>
    </router-link>

    <v-spacer />

    <nav v-if="smAndUp" class="nav">
      <router-link v-for="item in MENU_ITEMS" :key="item.route" :to="item.route" class="nav__link">
        {{ item.title }}
      </router-link>
    </nav>
    <v-app-bar-nav-icon v-else color="#2f5b4d" @click.stop="drawer = !drawer" />
  </v-app-bar>

  <v-navigation-drawer v-model="drawer" temporary location="right" color="#fff4dc">
    <v-list nav>
      <v-list-item
        v-for="item in MENU_ITEMS"
        :key="item.route"
        :to="item.route"
        :prepend-icon="item.icon"
        :title="item.title"
        color="primary"
        @click="drawer = false"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<style scoped>
.app-bar {
  background: rgba(255, 244, 220, 0.94) !important;
  border-bottom: 4px solid var(--c-yellow);
  backdrop-filter: blur(6px);
}

/* 品牌：番茄紅膠囊 */
.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
  padding: 6px 16px 6px 10px;
  text-decoration: none;
  background: var(--c-tomato);
  border-radius: 999px;
  box-shadow: var(--edge-sm) var(--c-tomato-deep);
  transform: rotate(-2deg);
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.brand:hover {
  transform: rotate(2deg) scale(1.04);
}

.brand__icon {
  color: var(--c-yellow);
}

.brand__text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: #fff;
}

.nav {
  display: flex;
  gap: 8px;
  margin-right: 20px;
}

.nav__link {
  padding: 7px 16px;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-green);
  text-decoration: none;
  border-radius: 999px;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.nav__link:hover {
  background: var(--c-yellow-soft);
}

/* 目前頁面：森林綠膠囊 */
.nav__link.router-link-exact-active {
  color: var(--c-yellow);
  background: var(--c-green);
  box-shadow: var(--edge-sm) var(--c-green-deep);
}
</style>
