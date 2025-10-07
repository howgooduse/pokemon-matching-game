import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 引入 Vuetify 相關
import 'vuetify/styles' // Vuetify 基礎樣式
import '@mdi/font/css/materialdesignicons.css' // Material Design Icons 字型
import { createVuetify } from 'vuetify'
import { createGtag } from 'vue-gtag'; 
import type { RouteLocationNormalized } from 'vue-router'

// 建立 Vuetify 實例
const vuetify = createVuetify({
  // 在這裡可以配置主題、預設元件屬性等
})

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(vuetify)

//啟用 Google Analytics 追蹤
app.use(
  createGtag({
    // 設定您的 GA4 追蹤 ID。vue-gtag 會自動處理追蹤碼載入。
    tagId: 'G-E3HYZ4QQGL' 
  }) 
);

/**
 * 輔助函式：執行 SEO 相關的 DOM 更新 (Title, Description)
 * @param to 當前目標路由對象
 */
const updateSeoTags = (to: RouteLocationNormalized) => {
  // 1. 處理 Title
  // 從路由 meta 中獲取標題，如果沒有設定則使用預設值
  const pageTitle = (to.meta.title as string) || 'PLAY一對';
  document.title = pageTitle;

  // 2. 處理 Meta Description
  // 從路由 meta 中獲取描述，如果沒有設定則使用預設值
  const pageDescription = (to.meta.description as string) || '開始挑戰遊戲，看你能否記住所有寶可夢';
  
  // 嘗試選取現有的 meta description 標籤
  let metaDescriptionTag = document.querySelector('meta[name="description"]');
  
  if (!metaDescriptionTag) {
    // 如果不存在，就創建一個新的 <meta name="description"> 標籤
    metaDescriptionTag = document.createElement('meta');
    metaDescriptionTag.setAttribute('name', 'description');
    document.head.appendChild(metaDescriptionTag);
  }
  
  // 設定或更新 description 內容
  metaDescriptionTag.setAttribute('content', pageDescription);

  // 額外處理 Open Graph (OG) 描述，以確保社群媒體分享正確
  let ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  if (!ogDescriptionTag) {
    ogDescriptionTag = document.createElement('meta');
    ogDescriptionTag.setAttribute('property', 'og:description');
    document.head.appendChild(ogDescriptionTag);
  }
  ogDescriptionTag.setAttribute('content', pageDescription);
};


// 🎯 核心修正：確保首次加載時也能正確執行 SEO 更新
router.isReady().then(() => {
    // 首次加載：使用當前路徑 (如 /game) 的 meta 資訊進行更新
    // 解決直接從網址列進入時描述不會變的問題
    updateSeoTags(router.currentRoute.value as RouteLocationNormalized);
    
    // 後續切換：每次路由跳轉完成後，執行 SEO 更新
    router.afterEach(updateSeoTags);

    // 只有在路由就緒後，才掛載應用程式
    app.mount('#app')
}).catch(err => {
    // 處理可能的路由初始化錯誤
    console.error("Router failed to initialize:", err);
});