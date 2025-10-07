<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal instructions-modal" style="color: #f0f0f0;">
        <h2>📖 遊戲玩法</h2>
        
        <div class="instructions-content">
          <div class="instruction-item">
            <span class="instruction-icon">👆</span>
            <div class="instruction-detail">
              <strong>配對方塊</strong>
              <p>點擊兩個相同的寶可夢進行配對</p>
            </div>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">🔄</span>
            <div class="instruction-detail">
              <strong>連接規則</strong>
              <p>連接線最多只能轉兩個彎</p>
            </div>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">⏱️</span>
            <div class="instruction-detail">
              <strong>過關條件</strong>
              <p>在時間內消除所有方塊即可過關</p>
            </div>
          </div>
          <div class="instruction-item">
            <span class="instruction-icon">💡</span>
            <div class="instruction-detail">
              <strong>道具使用</strong>
              <p>提示：顯示可配對的方塊<br>重排：重新排列方塊<br>炸彈：自動消除一組</p>
            </div>
          </div>
        </div>

        <button @click="$emit('close')" class="btn-primary">
          知道了
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  show: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'close'): void;
}>();
</script>