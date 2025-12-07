import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/MatchGame.vue'), // 改成連連看
    meta: {
      title: '寶可夢連連看',
      description: '開始挑戰連連看遊戲，測試你的觀察力和反應速度！',
    }
  },
  {
    path: '/flip-game',  // 翻牌遊戲改到這裡
    name: 'FlipGame',
    component: () => import('../views/FlipMatchGame.vue'),
    meta: {
      title: '寶可夢記憶遊戲 - 挑戰你的記憶極限',
      description: '開始挑戰，看你能否記住所有寶可夢！',
    }
  },
  {
    path: '/match-game-menu',
    name: 'MatchGameMenu',
    component: () => import('../views/MatchGameMenu.vue'),
    meta: {
      title: '寶可夢連連看 - 遊戲選單',
      description: '開始挑戰連連看遊戲，測試你的觀察力和反應速度！',
    }
  },
  {
    path: '/match-game',
    name: 'MatchGame',
    component: () => import('../views/MatchGame.vue'),
    meta: {
      title: '遊戲進行中 | 寶可夢連連看',
      description: '正在進行中的連連看挑戰，快速配對所有寶可夢！',
    }
  },
  {
    path: '/guess-game',
    name: 'GuessGame',
    component: () => import('../views/GuessMatchGame.vue'),
    meta: {
      title: '遊戲進行中 | 寶可夢連連看',
      description: '正在進行中的猜猜看挑戰，快速找到名字的寶可夢！',
    }
  },
  {
    path: '/mario-spinner',
    name: 'MarioSpinner',
    component: () => import('../components/game/MarioSpinner.vue'),
    meta: {
     title: '🍄 瑪利歐轉盤遊戲',
     description: '轉動轉盤，堆疊方塊，爬升到終點！',
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

export default router