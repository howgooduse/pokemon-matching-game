import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 引入 Vuetify 相關
import 'vuetify/styles' // Vuetify 基礎樣式
import '@mdi/font/css/materialdesignicons.css' // Material Design Icons 字型
import { createVuetify } from 'vuetify'
import { createGtag } from 'vue-gtag'; 

// 建立 Vuetify 實例
const vuetify = createVuetify({
  // 在這裡可以配置主題、預設元件屬性等
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(vuetify)

app.use(
  createGtag({
    // 使用 tagId 屬性，解決了最新的型別錯誤 (2345)
    tagId: 'G-E3HYZ4QQGL' 
  }) 
  // 這裡不再傳遞 router 參數，解決了現在的錯誤 (2769)
);

// 步驟 B: 手動設定路由監聽 (確保 SPA 頁面切換追蹤)
// 這段程式碼在每次路由切換後，會發送一個 page_view 事件給 GA
router.afterEach((to) => {
  // 檢查 gtag 函式是否已被 vue-gtag 載入
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_title: to.meta.title || to.name || 'Unknown Page', 
      page_path: to.fullPath
    });
  }
});

app.mount('#app')
