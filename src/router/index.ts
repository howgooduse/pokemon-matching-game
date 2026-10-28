import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    description?: string;
  }
}

const LinkGameView = () => import('@/views/LinkGameView.vue');

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: LinkGameView,
    meta: {
      title: '寶可夢連連看',
      description: '開始挑戰連連看遊戲，測試你的觀察力和反應速度！',
    },
  },
  {
    path: '/match-game',
    name: 'LinkGame',
    component: LinkGameView,
    meta: {
      title: '遊戲進行中 | 寶可夢連連看',
      description: '正在進行中的連連看挑戰，快速配對所有寶可夢！',
    },
  },
  {
    path: '/match-game-menu',
    name: 'LinkGameMenu',
    component: () => import('@/views/LinkGameMenuView.vue'),
    meta: {
      title: '寶可夢連連看 - 遊戲選單',
      description: '查看連連看的統計資料、排行榜與難度設定。',
    },
  },
  {
    path: '/flip-game',
    name: 'FlipGame',
    component: () => import('@/views/FlipGameView.vue'),
    meta: {
      title: '寶可夢記憶遊戲 - 挑戰你的記憶極限',
      description: '開始挑戰，看你能否記住所有寶可夢！',
    },
  },
  {
    path: '/guess-game',
    name: 'GuessGame',
    component: () => import('@/views/GuessGameView.vue'),
    meta: {
      title: '寶可夢猜猜看',
      description: '正在進行中的猜猜看挑戰，快速找到名字的寶可夢！',
    },
  },
  // 已移除的頁面（例如舊的 /mario-spinner）與不存在的網址一律導回首頁
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

export default router;
