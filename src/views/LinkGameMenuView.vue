<template>
  <div class="game-page menu-page">
    <GameHeader title="連連看" subtitle="查看紀錄、調整難度，或直接開始新的一局。">
      <template #stats>
        <StatItem label="最高分" :value="gameStore.highScore" tone="yellow" />
        <StatItem label="最高關卡" :value="gameStore.bestLevel" />
        <StatItem label="最高連擊" :value="`${gameStore.bestCombo}×`" />
      </template>
    </GameHeader>

    <div class="menu-body">
      <button type="button" class="ui-btn ui-btn--primary ui-btn--lg start-btn" @click="startNewGame">
        <v-icon icon="mdi-play" size="22" />
        開始遊戲
      </button>

      <ul class="menu-list">
        <li v-for="item in MENU_ITEMS" :key="item.key">
          <button type="button" class="menu-row" @click="openPanel(item.key)">
            <v-icon :icon="item.icon" size="22" class="menu-row__icon" />
            <span class="menu-row__text">
              <strong>{{ item.title }}</strong>
              <span>{{ item.desc }}</span>
            </span>
            <v-icon icon="mdi-chevron-right" size="20" class="menu-row__chevron" />
          </button>
        </li>
      </ul>
    </div>

    <!-- 統計資料 -->
    <transition name="modal">
      <div v-if="showStats" class="ui-scrim" @click.self="showStats = false">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">統計資料</h2>
          <dl class="stats-grid">
            <div><dt>遊戲場次</dt><dd>{{ stats.totalGames }}</dd></div>
            <div><dt>總配對數</dt><dd>{{ stats.totalMatches }}</dd></div>
            <div><dt>最高分數</dt><dd>{{ stats.highScore }}</dd></div>
            <div><dt>平均分數</dt><dd>{{ stats.averageScore }}</dd></div>
            <div><dt>最高關卡</dt><dd>{{ stats.bestLevel }}</dd></div>
            <div><dt>最高連擊</dt><dd>{{ stats.bestCombo }}×</dd></div>
            <div><dt>總遊戲時間</dt><dd>{{ formatPlayTime(stats.totalPlayTime) }}</dd></div>
            <div><dt>過關率</dt><dd>{{ stats.winRate }}%</dd></div>
          </dl>
          <div class="ui-panel__actions">
            <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="showStats = false">
              關閉
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 排行榜 -->
    <transition name="modal">
      <div v-if="showLeaderboard" class="ui-scrim" @click.self="showLeaderboard = false">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">排行榜</h2>
          <p v-if="leaderboard.length === 0" class="empty-message">
            還沒有紀錄。玩完一局後，成績會出現在這裡。
          </p>
          <ol v-else class="leaderboard">
            <li
              v-for="record in leaderboard"
              :key="record.rank"
              class="leaderboard__item"
              :class="{ 'is-top': record.rank <= 3 }"
            >
              <span class="leaderboard__rank">{{ record.rank }}</span>
              <span class="leaderboard__info">
                <strong>{{ record.score }} 分</strong>
                <span>第 {{ record.level }} 關，連擊 {{ record.maxCombo }}×</span>
              </span>
              <span class="leaderboard__date">{{ formatRelativeDate(record.completedAt) }}</span>
            </li>
          </ol>
          <div class="ui-panel__actions">
            <button
              type="button"
              class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block"
              @click="showLeaderboard = false"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 遊戲設定 -->
    <transition name="modal">
      <div v-if="showSettings" class="ui-scrim" @click.self="showSettings = false">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">遊戲設定</h2>

          <h3 class="section-title">難度</h3>
          <div class="difficulty-list" role="radiogroup" aria-label="難度">
            <button
              v-for="diff in difficulties"
              :key="diff.value"
              type="button"
              role="radio"
              :aria-checked="settings.difficulty === diff.value"
              class="difficulty"
              :class="{ 'is-active': settings.difficulty === diff.value }"
              @click="gameStore.setDifficulty(diff.value)"
            >
              <v-icon :icon="diff.icon" size="20" />
              <span class="difficulty__text">
                <strong>{{ diff.name }}</strong>
                <span>{{ diff.description }}</span>
              </span>
            </button>
          </div>

          <h3 class="section-title">偏好</h3>
          <div class="toggle-row">
            <span>音效</span>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.soundEnabled"
              class="switch"
              :class="{ 'is-on': settings.soundEnabled }"
              @click="gameStore.toggleSetting('soundEnabled')"
            ></button>
          </div>
          <div class="toggle-row">
            <span>背景音樂</span>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.musicEnabled"
              class="switch"
              :class="{ 'is-on': settings.musicEnabled }"
              @click="gameStore.toggleSetting('musicEnabled')"
            ></button>
          </div>
          <div class="toggle-row">
            <span>顯示計時器</span>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.showTimer"
              class="switch"
              :class="{ 'is-on': settings.showTimer }"
              @click="gameStore.toggleSetting('showTimer')"
            ></button>
          </div>
          <div class="toggle-row">
            <span>自動儲存紀錄</span>
            <button
              type="button"
              role="switch"
              :aria-checked="settings.autoSave"
              class="switch"
              :class="{ 'is-on': settings.autoSave }"
              @click="gameStore.toggleSetting('autoSave')"
            ></button>
          </div>

          <div class="danger-zone">
            <button type="button" class="danger-btn" @click="confirmReset">清除所有紀錄</button>
          </div>

          <div class="ui-panel__actions">
            <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="showSettings = false">
              完成
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- 玩法與計分 -->
    <transition name="modal">
      <div v-if="showHowToPlay" class="ui-scrim" @click.self="showHowToPlay = false">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">玩法與計分</h2>

          <h3 class="section-title">規則</h3>
          <ul class="plain-list">
            <li>點擊兩隻相同的寶可夢進行配對。</li>
            <li>兩個方塊之間的連線最多只能轉兩個彎。</li>
            <li>連線路徑上不能有其他方塊擋住。</li>
            <li>連續快速配對可以累積連擊加分。</li>
          </ul>

          <h3 class="section-title">道具</h3>
          <ul class="plain-list">
            <li><strong>提示</strong>：標出一組可配對的方塊（扣 50 分）</li>
            <li><strong>重排</strong>：打亂剩下的方塊（扣 100 分）</li>
            <li><strong>炸彈</strong>：自動消除一組可連線的方塊（正常計分）</li>
          </ul>

          <h3 class="section-title">計分</h3>
          <ul class="plain-list">
            <li>每次配對 100 分</li>
            <li>連擊加成：(連擊數 − 1) × 50 分</li>
            <li>過關時間獎勵：剩餘秒數 × 10 分</li>
            <li>難度倍率：簡單 ×0.8、普通 ×1.0、困難 ×1.5</li>
          </ul>

          <div class="ui-panel__actions">
            <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="showHowToPlay = false">
              知道了
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useLinkGameStore } from '@/stores/linkGameStore';
import type { LinkDifficulty } from '@/types/link';
import { formatPlayTime, formatRelativeDate } from '@/utils/format';
import GameHeader from '@/components/common/GameHeader.vue';
import StatItem from '@/components/common/StatItem.vue';

const router = useRouter();
const gameStore = useLinkGameStore();

const showStats = ref(false);
const showLeaderboard = ref(false);
const showSettings = ref(false);
const showHowToPlay = ref(false);

const settings = computed(() => gameStore.settings);
const stats = computed(() => gameStore.stats);
const leaderboard = computed(() => gameStore.getLeaderboard(10));

const difficulties: ReadonlyArray<{
  value: LinkDifficulty;
  name: string;
  icon: string;
  description: string;
}> = [
  { value: 'easy', name: '簡單', icon: 'mdi-leaf', description: '4 分鐘、道具較多，分數 ×0.8' },
  { value: 'normal', name: '普通', icon: 'mdi-circle-half-full', description: '5 分鐘、標準道具，分數 ×1.0' },
  { value: 'hard', name: '困難', icon: 'mdi-fire', description: '2 分鐘、道具稀少，分數 ×1.5' },
];

const startNewGame = () => router.push('/match-game');

const MENU_ITEMS = [
  { key: 'stats', icon: 'mdi-chart-box-outline', title: '統計資料', desc: '總場次、配對數、平均分數' },
  { key: 'leaderboard', icon: 'mdi-podium', title: '排行榜', desc: '本機最高的 10 場紀錄' },
  { key: 'settings', icon: 'mdi-tune-variant', title: '遊戲設定', desc: '難度與其他偏好' },
  { key: 'help', icon: 'mdi-book-open-variant', title: '玩法與計分', desc: '連線規則、道具、分數怎麼算' },
] as const;

const openPanel = (key: (typeof MENU_ITEMS)[number]['key']) => {
  if (key === 'stats') showStats.value = true;
  else if (key === 'leaderboard') showLeaderboard.value = true;
  else if (key === 'settings') showSettings.value = true;
  else showHowToPlay.value = true;
};

const confirmReset = () => {
  if (!confirm('確定要清除所有資料嗎？此操作無法復原！')) return;
  if (!confirm('再次確認：這將刪除所有遊戲記錄與統計資料！')) return;
  gameStore.resetAllData();
  showSettings.value = false;
};
</script>

<style scoped>
.menu-page {
  max-width: 720px;
}

.menu-body {
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-top: 30px;
}

.start-btn {
  align-self: center;
  min-width: 260px;
  padding: 20px 44px;
  font-size: 22px;
  letter-spacing: 0.12em;
}

/* ---------- 選單：四塊撞色的矽膠方塊 ---------- */
.menu-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu-row {
  --row-bg: var(--c-yellow);
  --row-fg: var(--c-green);
  --row-edge: var(--c-yellow-deep);
  --row-icon-bg: var(--c-paper);

  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  height: 100%;
  padding: 18px 16px;
  font: inherit;
  color: var(--row-fg);
  text-align: left;
  background: var(--row-bg);
  border: none;
  border-radius: var(--radius-lg);
  box-shadow: var(--edge) var(--row-edge);
  cursor: pointer;
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.1s;
}

.menu-list li:nth-child(2) .menu-row {
  --row-bg: var(--c-tomato);
  --row-fg: #fff;
  --row-edge: var(--c-tomato-deep);
}
.menu-list li:nth-child(3) .menu-row {
  --row-bg: var(--c-green);
  --row-fg: var(--c-yellow-soft);
  --row-edge: var(--c-green-deep);
}
.menu-list li:nth-child(4) .menu-row {
  --row-bg: var(--c-sage);
  --row-fg: #fff;
  --row-edge: var(--c-sage-deep);
}

.menu-row:hover {
  transform: translateY(-3px) rotate(-1deg);
  box-shadow: 0 8px 0 var(--row-edge);
}

.menu-row:active {
  transform: translateY(5px);
  box-shadow: 0 0 0 var(--row-edge);
}

.menu-row__icon {
  flex-shrink: 0;
  width: 46px !important;
  height: 46px !important;
  color: var(--c-green);
  background: var(--row-icon-bg);
  border-radius: 50%;
}

.menu-row__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
}

.menu-row__text strong {
  font-size: 18px;
}

.menu-row__text span {
  font-size: 13px;
  opacity: 0.85;
}

.menu-row__chevron {
  display: none;
}

/* ---------- 彈窗內容 ---------- */
.section-title {
  margin: 22px 0 10px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--c-tomato);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  margin: 0;
}

.stats-grid > div {
  padding: 12px 16px;
  background: var(--c-bg);
  border-radius: var(--radius);
}

.stats-grid > div:nth-child(4n + 1) {
  background: var(--c-yellow-soft);
}
.stats-grid > div:nth-child(4n + 4) {
  background: var(--c-sage-soft);
}

.stats-grid dt {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-muted);
}

.stats-grid dd {
  margin: 2px 0 0;
  font-size: 26px;
  font-weight: 700;
  color: var(--c-green);
  font-variant-numeric: tabular-nums;
}

.empty-message {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  color: var(--c-ink-muted);
}

.leaderboard {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.leaderboard__item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 16px 10px 10px;
  background: var(--c-bg);
  border-radius: 999px;
}

.leaderboard__rank {
  width: 34px;
  height: 34px;
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--c-ink-muted);
  background: var(--c-paper);
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
}

.leaderboard__item.is-top .leaderboard__rank {
  color: var(--c-green);
  background: var(--c-yellow);
  box-shadow: var(--edge-sm) var(--c-yellow-deep);
}

.leaderboard__item:first-child .leaderboard__rank {
  color: #fff;
  background: var(--c-tomato);
  box-shadow: var(--edge-sm) var(--c-tomato-deep);
}

.leaderboard__info {
  display: flex;
  flex: 1;
  flex-direction: column;
  color: var(--c-green);
}

.leaderboard__info span,
.leaderboard__date {
  font-size: 13px;
  color: var(--c-ink-muted);
}

.difficulty-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.difficulty {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  font: inherit;
  color: var(--c-green);
  text-align: left;
  background: var(--c-bg);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition:
    transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1),
    background-color 0.15s,
    box-shadow 0.15s;
}

.difficulty:hover {
  background: var(--c-yellow-soft);
}

.difficulty.is-active {
  color: var(--c-yellow);
  background: var(--c-green);
  box-shadow: var(--edge-sm) var(--c-green-deep);
  transform: scale(1.02);
}

.difficulty.is-active .v-icon {
  color: var(--c-yellow);
}

.difficulty__text {
  display: flex;
  flex-direction: column;
}

.difficulty__text span {
  font-size: 13px;
  opacity: 0.75;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 4px;
  font-weight: 500;
}

.switch {
  position: relative;
  width: 52px;
  height: 30px;
  flex-shrink: 0;
  background: var(--c-line);
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.switch::after {
  content: '';
  position: absolute;
  top: 4px;
  left: 4px;
  width: 22px;
  height: 22px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 0 rgba(29, 61, 51, 0.2);
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.switch.is-on {
  background: var(--c-tomato);
}

.switch.is-on::after {
  transform: translateX(22px);
}

.danger-zone {
  margin-top: 22px;
}

.danger-btn {
  padding: 0;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-tomato-deep);
  background: none;
  border: none;
  text-decoration: underline;
  text-decoration-style: wavy;
  text-underline-offset: 4px;
  cursor: pointer;
}

.plain-list {
  margin: 0;
  padding-left: 1.2em;
  font-size: 15px;
  line-height: 1.8;
}

.plain-list li::marker {
  color: var(--c-tomato);
}

@media (max-width: 600px) {
  .start-btn {
    align-self: stretch;
  }
  .menu-list {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
