import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVuetify } from 'vuetify';
import { createGtag } from 'vue-gtag';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';
import './styles/theme.css';

import App from './App.vue';
import router from './router';
import { updateSeoTags } from './utils/seo';

const GA_TAG_ID = 'G-E3HYZ4QQGL';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(
  createVuetify({
    theme: {
      defaultTheme: 'candy',
      themes: {
        candy: {
          dark: false,
          colors: {
            background: '#fff4dc',
            surface: '#fffdf6',
            primary: '#ee5b36',
            secondary: '#2f5b4d',
            success: '#6f9c8a',
            error: '#c4411f',
            'on-background': '#22403a',
            'on-surface': '#22403a',
            'on-primary': '#ffffff',
          },
        },
      },
    },
  }),
);
app.use(createGtag({ tagId: GA_TAG_ID }));

// 每次路由切換（含首次載入）都更新 SEO 標籤
router.afterEach((to) => updateSeoTags(to));

router
  .isReady()
  .then(() => app.mount('#app'))
  .catch((err) => console.error('Router failed to initialize:', err));
