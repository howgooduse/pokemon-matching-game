<template>
  <transition name="modal">
    <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
      <div class="modal instructions-modal">
        <button class="close-btn" @click="$emit('close')" aria-label="關閉">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <h2 class="modal-title">📖 遊戲玩法</h2>
       
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
        
        <button @click="$emit('close')" class="btn-confirm">
          <span>知道了</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
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

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.instructions-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px;
  padding: 32px 28px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  position: relative;
  color: #ffffff;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #ffffff;
  backdrop-filter: blur(10px);
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.close-btn:active {
  transform: rotate(90deg) scale(0.9);
}

.modal-title {
  font-size: 28px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 28px 0;
  color: #ffffff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
}

.instructions-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 28px;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.instruction-item:hover {
  background: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.instruction-icon {
  font-size: 32px;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.instruction-detail {
  flex: 1;
}

.instruction-detail strong {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #ffffff;
}

.instruction-detail p {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
}

.btn-confirm {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #ffffff;
  border: none;
  border-radius: 14px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-shadow: 0 8px 20px rgba(245, 87, 108, 0.3);
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(245, 87, 108, 0.4);
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.btn-confirm:active {
  transform: translateY(0);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.btn-confirm svg {
  transition: transform 0.3s ease;
}

.btn-confirm:hover svg {
  transform: scale(1.2);
}

/* 動畫效果 */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-active .instructions-modal,
.modal-leave-active .instructions-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .instructions-modal {
  transform: scale(0.9) translateY(20px);
}

.modal-leave-to .instructions-modal {
  transform: scale(0.9) translateY(20px);
}

/* 滾動條美化 */
.instructions-modal::-webkit-scrollbar {
  width: 8px;
}

.instructions-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.instructions-modal::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
}

.instructions-modal::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}

/* 手機版適配 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 16px;
  }
  
  .instructions-modal {
    padding: 24px 20px;
    border-radius: 20px;
    max-height: 85vh;
  }
  
  .modal-title {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  .instructions-content {
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .instruction-item {
    padding: 16px;
    gap: 12px;
    border-radius: 12px;
  }
  
  .instruction-icon {
    font-size: 28px;
    width: 42px;
    height: 42px;
  }
  
  .instruction-detail strong {
    font-size: 16px;
    margin-bottom: 4px;
  }
  
  .instruction-detail p {
    font-size: 13px;
  }
  
  .btn-confirm {
    padding: 14px 20px;
    font-size: 16px;
    border-radius: 12px;
  }
  
  .close-btn {
    width: 32px;
    height: 32px;
    top: 12px;
    right: 12px;
  }
}

/* 小屏手機適配 */
@media (max-width: 400px) {
  .instructions-modal {
    padding: 20px 16px;
  }
  
  .modal-title {
    font-size: 22px;
  }
  
  .instruction-item {
    padding: 14px;
  }
  
  .instruction-icon {
    font-size: 24px;
    width: 38px;
    height: 38px;
  }
  
  .instruction-detail strong {
    font-size: 15px;
  }
  
  .instruction-detail p {
    font-size: 12px;
  }
}
</style>