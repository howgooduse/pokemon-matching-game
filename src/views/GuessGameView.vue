<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import {
  GUESS_MAX_ROUNDS,
  GUESS_TIME_LIMIT,
  useGuessGameStore,
} from '@/stores/guessGameStore';
import PokemonFlipCard from '@/components/common/PokemonFlipCard.vue';
import GameHeader from '@/components/common/GameHeader.vue';
import StatItem from '@/components/common/StatItem.vue';
import StartGameButton from '@/components/common/StartGameButton.vue';

const gameStore = useGuessGameStore();
const {
  cards,
  status,
  currentTargetName,
  correctCount,
  wrongCount,
  currentRound,
  timeRemaining,
  lastAnswer,
  answeredCount,
  accuracy,
  isActive,
  canSelect,
} = storeToRefs(gameStore);

onMounted(() => gameStore.initializeGame());
onUnmounted(() => gameStore.dispose());
</script>

<template>
  <div class="game-page guess-page">
    <GameHeader title="猜猜看" subtitle="看名字，從五張卡裡找出正確的寶可夢。">
      <template #stats>
        <StatItem label="回合" :value="`${currentRound} / ${GUESS_MAX_ROUNDS}`" />
        <StatItem label="答對" :value="correctCount" tone="green" />
        <StatItem label="答錯" :value="wrongCount" :tone="wrongCount > 0 ? 'tomato' : 'default'" />
        <StatItem
          label="秒數"
          :value="isActive ? timeRemaining : GUESS_TIME_LIMIT"
          :tone="isActive && timeRemaining <= 3 ? 'tomato' : 'default'"
        />
      </template>

      <template #actions>
        <button type="button" class="ui-btn ui-btn--soft" :disabled="!isActive" @click="gameStore.endGame()">
          <v-icon icon="mdi-flag-checkered" size="18" />
          結束遊戲
        </button>
      </template>
    </GameHeader>

    <!-- 題目 -->
    <section class="prompt" aria-live="polite">
      <template v-if="status === 'shuffling'">
        <p class="prompt__label">洗牌中</p>
        <p class="prompt__name prompt__name--muted">……</p>
      </template>
      <template v-else-if="isActive">
        <p class="prompt__label">找出</p>
        <p
          class="prompt__name"
          :class="{
            'is-correct': lastAnswer === 'correct',
            'is-wrong': lastAnswer === 'wrong',
          }"
        >
          {{ currentTargetName }}
        </p>
        <p class="prompt__feedback">
          <template v-if="lastAnswer === 'correct'">答對了</template>
          <template v-else-if="lastAnswer === 'wrong'">答錯了，正確答案已標出</template>
        </p>
      </template>
      <template v-else>
        <p class="prompt__label">準備好了嗎？</p>
        <p class="prompt__name prompt__name--muted">？？？</p>
      </template>
    </section>

    <!-- 卡牌 -->
    <div class="board-well guess-board">
      <div class="guess-grid">
        <PokemonFlipCard
          v-for="card in cards"
          :key="card.id"
          :pokemon-id="card.pokemonId"
          :alt="card.pokemonName"
          :flipped="card.isFlipped"
          :highlighted="card.isHighlighted"
          :disabled="!canSelect"
          @select="gameStore.selectCard(card)"
        />
      </div>

      <StartGameButton v-if="status === 'idle'" @click="gameStore.startGame()">
        <ul class="rules">
          <li>每回合 {{ GUESS_TIME_LIMIT }} 秒</li>
          <li>共 {{ GUESS_MAX_ROUNDS }} 回合</li>
          <li>隨時可以結束並查看成績</li>
        </ul>
      </StartGameButton>
    </div>

    <!-- 結算 -->
    <transition name="modal">
      <div v-if="status === 'finished'" class="ui-scrim">
        <div class="ui-panel" role="dialog" aria-modal="true">
          <h2 class="ui-panel__title">遊戲結束</h2>
          <p class="result-score">{{ accuracy }}<span>%</span></p>
          <p class="result-caption">正確率</p>

          <div class="ratio-bar" aria-hidden="true">
            <div class="ratio-bar__fill" :style="{ width: `${accuracy}%` }"></div>
          </div>

          <dl class="result-list">
            <div><dt>作答題數</dt><dd>{{ answeredCount }}</dd></div>
            <div><dt>答對</dt><dd class="is-correct">{{ correctCount }}</dd></div>
            <div><dt>答錯</dt><dd class="is-wrong">{{ wrongCount }}</dd></div>
          </dl>

          <div class="ui-panel__actions">
            <button type="button" class="ui-btn ui-btn--dark ui-btn--lg ui-btn--block" @click="gameStore.restart()">
              再玩一次
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.guess-page {
  max-width: 900px;
}

/* ---------- 題目 ---------- */
.prompt {
  margin: 28px 0 26px;
  text-align: center;
}

.prompt__label {
  margin: 0 0 6px;
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--c-ink-muted);
}

/* 題目名稱：大大的奶油黃貼紙，答對變綠、答錯變紅 */
.prompt__name {
  display: inline-block;
  margin: 4px 0 0;
  padding: 6px 32px 10px;
  font-size: 48px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0.08em;
  color: var(--c-green);
  background: var(--c-yellow);
  border-radius: var(--radius-lg);
  box-shadow: 0 6px 0 var(--c-yellow-deep);
  transition:
    background-color 0.2s,
    box-shadow 0.2s,
    color 0.2s;
}

.prompt__name--muted {
  color: var(--c-ink-muted);
  background: var(--c-paper);
  box-shadow: 0 6px 0 var(--c-line);
}

.prompt__name.is-correct {
  color: #fff;
  background: var(--c-sage);
  box-shadow: 0 6px 0 var(--c-sage-deep);
  animation: pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.prompt__name.is-wrong {
  color: #fff;
  background: var(--c-tomato);
  box-shadow: 0 6px 0 var(--c-tomato-deep);
  animation: shake 0.4s ease-in-out;
}

@keyframes pop {
  50% {
    transform: scale(1.1) rotate(-2deg);
  }
}

@keyframes shake {
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

.prompt__feedback {
  min-height: 24px;
  margin: 14px 0 0;
  font-size: 15px;
  font-weight: 700;
  color: var(--c-ink-muted);
}

/* ---------- 卡牌 ---------- */
.guess-board {
  min-height: 220px;
}

.guess-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
}

.rules {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 15px;
  line-height: 1.9;
  font-weight: 500;
  color: var(--c-yellow-soft);
}

/* ---------- 結算 ---------- */
.result-score {
  margin: 0;
  font-size: 60px;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  color: var(--c-tomato);
  font-variant-numeric: tabular-nums;
}

.result-score span {
  font-size: 28px;
  margin-left: 2px;
}

.result-caption {
  margin: 6px 0 16px;
  font-size: 14px;
  text-align: center;
  color: var(--c-ink-muted);
}

.ratio-bar {
  height: 14px;
  margin-bottom: 20px;
  overflow: hidden;
  background: var(--c-tomato-soft);
  border-radius: 999px;
}

.ratio-bar__fill {
  height: 100%;
  background: var(--c-sage);
  border-radius: inherit;
  transition: width 0.8s ease-out;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
}

.result-list > div {
  display: flex;
  justify-content: space-between;
  padding: 11px 18px;
  background: var(--c-bg);
  border-radius: 999px;
}

.result-list dt {
  color: var(--c-ink-muted);
}

.result-list dd {
  margin: 0;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.result-list .is-correct {
  color: var(--c-sage-deep);
}

.result-list .is-wrong {
  color: var(--c-tomato-deep);
}

@media (max-width: 600px) {
  .prompt {
    margin: 18px 0 16px;
  }
  .prompt__name {
    padding: 4px 20px 8px;
    font-size: 30px;
  }
  .guess-grid {
    gap: 6px;
  }
  .result-score {
    font-size: 46px;
  }
}
</style>
