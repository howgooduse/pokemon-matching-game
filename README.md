# pokemon-match-game.client

寶可夢小遊戲網站（Vue 3 + Vite + Vuetify + Pinia），包含三個遊戲：

| 遊戲 | 路徑 | 說明 |
| --- | --- | --- |
| 連連看 | `/`、`/match-game` | 連線最多轉兩個彎的配對遊戲，有關卡、連擊與道具 |
| 連連看選單 | `/match-game-menu` | 統計、排行榜、難度設定 |
| 翻翻看 | `/flip-game` | 記憶翻牌 |
| 猜猜看 | `/guess-game` | 依名字找出正確的寶可夢 |

## 專案結構

```
src/
├── api/                 後端 API（axios，VITE_API_BASE_URL 可覆寫位址）
├── components/
│   ├── common/          跨遊戲共用元件（StartGameButton、PokemonFlipCard）
│   ├── layout/          版面元件（AppHeader）
│   ├── link/            連連看專用元件
│   └── flip/            翻翻看專用元件
├── composables/         useLinkGame / useLinkBoard / useLinkTimer
├── router/              路由與 SEO meta
├── stores/              linkGameStore / flipGameStore / guessGameStore（Pinia setup store）
├── styles/              link-game.css
├── types/               型別與遊戲設定常數
├── utils/               array、format、pokemon、timers、seo、pathFinder、deviceId
└── views/               LinkGameView / LinkGameMenuView / FlipGameView / GuessGameView
```

命名規則：每個遊戲使用固定前綴 `Link` / `Flip` / `Guess`，
store 為 `xxxGameStore.ts`（`useXxxGameStore`），頁面為 `XxxGameView.vue`。

## 開發

```sh
npm install
npm run dev        # 開發伺服器
npm run build      # 型別檢查 + 打包
npm run lint       # ESLint
```

需要 Node.js 24。
