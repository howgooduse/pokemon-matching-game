import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/GamePlay.vue'), 
    meta: {
      title: '寶可夢記憶遊戲 - 挑戰你的記憶極限', // 專屬標題
      description: '開始挑戰，看你能否記住所有寶可夢！!', // 專屬描述
    }
  },
  {
    path: '/game',
    name: 'GamePlay',
    component: () => import('../views/GamePlay.vue'),
    meta: {
      title: '開始遊戲 | 寶可夢記憶遊戲',
      description: '正在進行中的遊戲挑戰，記錄你的得分和時間。',
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes, // 使用已定義的 routes 變數
})

export default router
