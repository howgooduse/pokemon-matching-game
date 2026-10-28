<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useFlipGameStore } from '@/stores/flipGameStore';
import { formatTime } from '@/utils/format';
import GameHeader from '@/components/common/GameHeader.vue';
import StatItem from '@/components/common/StatItem.vue';
import PokemonFlipCard from '@/components/common/PokemonFlipCard.vue';
import StartGameButton from '@/components/common/StartGameButton.vue';
import FlipTimer from '@/components/flip/FlipTimer.vue';
import FlipResultDialog from '@/components/flip/FlipResultDialog.vue';

const gameStore = useFlipGameStore();
const { cards, score, status, timeLimit, timeRemaining, matchedCount, isVictory, timeTaken, canFlip } =
  storeToRefs(gameStore);

const gridSize = computed(() => Math.ceil(Math.sqrt(cards.value.length)) || 4);
const totalPairs = computed(() => cards.value.length / 2);

const restart = () => {
  gameStore.initializeGame();
  gameStore.startGame();
};

onMounted(() => gameStore.initializeGame());
onUnmounted(() => gameStore.dispose());
</script>

<template>
  <div class="game-page flip-page">
    <GameHeader title="翻翻看" subtitle="開局會亮牌一秒，記住位置後翻出相同的兩張。">
      <template #stats>
        <StatItem label="配對" :value="`${matchedCount / 2} / ${totalPairs}`" />
        <StatItem label="分數" :value="score" tone="yellow" />
        <StatItem
          label="時間"
          :value="formatTime(timeRemaining)"
          :tone="timeRemaining <= 10 && status === 'playing' ? 'tomato' : 'default'"
        />
      </template>

      <template #actions>
        <button
          type="button"
          class="ui-btn ui-btn--soft"
          :disabled="status !== 'playing'"
          @click="gameStore.pauseGame()"
        >
          <v-icon icon="mdi-pause" size="18" />
          暫停
        </button>
        <FlipTimer class="flip-timer" :time-remaining="timeRemaining" :time-limit="timeLimit" />
      </template>
    </GameHeader>

    <div class="board-well flip-board">
      <div class="flip-grid" :style="{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }">
        <PokemonFlipCard
          v-for="card in cards"
          :key="card.id"
          :pokemon-id="card.pokemonId"
          :flipped="card.isFlipped"
          :matched="card.isMatched"
          :disabled="!canFlip"
          @select="gameStore.flipCard(card)"
        />
      </div>

      <StartGameButton v-if="status === 'idle'" @click="gameStore.startGame()" />
      <StartGameButton
        v-else-if="status === 'paused'"
        label="繼續遊戲"
        @click="gameStore.resumeGame()"
      />
    </div>

    <FlipResultDialog
      v-if="status === 'finished'"
      :is-win="isVictory"
      :score="score"
      :time-taken="timeTaken"
      :matched-count="matchedCount / 2"
      @restart="restart"
      @back-to-menu="gameStore.initializeGame()"
    />
  </div>
</template>

<style scoped>
.flip-page {
  max-width: 760px;
}

.flip-timer {
  flex: 1;
  min-width: 160px;
}

.flip-grid {
  display: grid;
  gap: 14px;
  width: min(100%, calc(100svh - 300px));
  min-width: min(100%, 300px);
  margin: 0 auto;
}

@media (max-width: 600px) {
  .flip-grid {
    gap: 8px;
    width: 100%;
  }
}
</style>
