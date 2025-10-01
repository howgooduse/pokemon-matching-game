import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // 這是為了讓 Vuetify 組件中的圖片路徑能正確轉換
      template: { transformAssetUrls }
    }),
    // 新增 vuetify 插件
    vuetify({
      autoImport: true, // 自動引入 Vuetify 組件，建議開啟
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) 
    },
  },
})
