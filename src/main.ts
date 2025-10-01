import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// 引入 Vuetify 相關
import 'vuetify/styles' // Vuetify 基礎樣式
import '@mdi/font/css/materialdesignicons.css' // Material Design Icons 字型
import { createVuetify } from 'vuetify'

// 建立 Vuetify 實例
const vuetify = createVuetify({
  // 在這裡可以配置主題、預設元件屬性等
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
