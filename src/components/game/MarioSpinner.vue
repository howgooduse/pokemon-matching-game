<template>
  <div class="game-container">
    <div class="game-playing">
      <!-- 裝飾金幣 -->
      <div class="coin">🪙</div>
      <div class="coin">🪙</div>
      <div class="coin">🪙</div>
      <div class="coin">🪙</div>

      <!-- 遊戲標題區 -->
      <div class="game-header">
        <h1 class="game-title">🍄 SUPER MARIO SPINNER 🍄</h1>
        <div class="score-board">
          <div class="score-item total-blocks" :class="{ 'animate-border': showBlockAnimation }">
            <div class="score-icon">📦</div>
            <div class="score-content">
              <div class="score-label">總方塊</div>
              <div class="score-value">{{ gameState.totalBlocks }}</div>
            </div>
          </div>
          <div class="score-item total-climbs" :class="{ 'animate-border': showClimbAnimation }">
            <div class="score-icon">🎯</div>
            <div class="score-content">
              <div class="score-label">總爬升</div>
              <div class="score-value">{{ gameState.totalClimbs }}</div>
            </div>
          </div>
          <button 
            v-if="isGameActive" 
            @click="handleEndGame" 
            class="btn-end-game"
          >
            結束遊戲
          </button>
        </div>
      </div>

      <!-- 轉盤區域 -->
      <div class="game-board" v-if="isGameActive">
        <div class="spinner-container">
          <div class="arrow-pointer"></div>
          <svg viewBox="0 0 400 400" id="spinner-svg">
            <defs>
              <filter id="shadow">
                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.3"/>
              </filter>
            </defs>
            <g class="spinner-wheel" :style="{ transform: `rotate(${currentRotation}deg)` }" ref="wheelRef">
              <!-- 外圈段落 -->
              <g class="segments-outer" ref="segmentsOuterRef"></g>
              <!-- 中圈段落 -->
              <g class="segments-middle" ref="segmentsMiddleRef"></g>
              <!-- 中心圖片 -->
              <circle cx="200" cy="200" r="85" fill="#4ECDC4" class="center-circle"/>
              <text x="200" y="190" text-anchor="middle" font-size="14" fill="white" font-family="'Press Start 2P', cursive">PRESS</text>
              <text x="200" y="210" text-anchor="middle" font-size="14" fill="white" font-family="'Press Start 2P', cursive">SPIN!</text>
            </g>
          </svg>
        </div>
      </div>

      <!-- 控制按鈕 -->
      <div class="controls" v-if="isGameActive">
        <button 
          @click="spin" 
          :disabled="isSpinning"
          class="btn-spin"
        >
          🎮 SPIN!
        </button>
        <button 
          @click="reset" 
          class="btn-reset"
        >
          🔄 RESET
        </button>
      </div>

      <!-- 結果顯示 -->
      <div class="result" v-if="isGameActive">
        <div class="result-text" v-html="resultHTML"></div>
      </div>

      <!-- 開始遊戲覆蓋層 -->
      <div v-if="!isGameActive && !showResults" class="start-game-overlay">
        <div class="overlay-content">
          <div class="menu-title">🍄 SUPER MARIO SPINNER</div>
          <div class="menu-subtitle">瑪利歐轉盤遊戲</div>
          <button @click="handleStartGame" class="btn-start-main">
            <span class="start-btn-text">開始遊戲</span>
            <span class="start-btn-icon">🎮</span>
          </button>
          <div class="game-rules">
            <p>📜 遊戲規則：</p>
            <p>🎯 轉動轉盤獲得指示</p>
            <p>📦 根據結果堆疊方塊</p>
            <p>🏆 爬升到終點線！</p>
            <p>❓ 神秘方塊抽特殊卡片</p>
            <p>🔄 翻轉代表順序反轉</p>
          </div>
        </div>
      </div>

      <!-- 遊戲結束視窗 -->
      <div v-if="!isGameActive && showResults" class="game-result-overlay">
        <div class="result-content">
          <div class="result-title">🎉 遊戲結束！</div>
          <div class="result-stats">
            <div class="stat-item total-stat">
              <div class="stat-label">總回合數</div>
              <div class="stat-value">{{ gameState.history.length }}</div>
            </div>
            <div class="stat-item blocks-stat">
              <div class="stat-label">📦 總方塊</div>
              <div class="stat-value">{{ gameState.totalBlocks }}</div>
            </div>
            <div class="stat-item climbs-stat">
              <div class="stat-label">🎯 總爬升</div>
              <div class="stat-value">{{ gameState.totalClimbs }}</div>
            </div>
          </div>
          
          <div class="history-section">
            <div class="history-title">📜 遊戲紀錄</div>
            <div class="history-list">
              <div 
                v-for="(record, index) in gameState.history" 
                :key="index"
                class="history-item"
              >
                <span class="history-round">第 {{ index + 1 }} 回合</span>
                <span class="history-action">{{ record.action }}</span>
                <span class="history-detail">
                  方塊: {{ record.blocks }}
                  <template v-if="record.climb !== undefined">
                    | 爬升: {{ record.climb }}
                  </template>
                </span>
              </div>
            </div>
          </div>

          <button @click="handleRestart" class="btn-restart">
            <span>🔄 再玩一次</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 定義轉盤區段
interface Segment {
  outer: string;
  middle: string;
  color1: string;
  color2: string;
  blocks: number;
  climb: number | string;
  icon: string;
  hasImage?: boolean;
  section?: number;
}

const segments: Segment[] = [
  // 第1大區 - 不堆疊方塊（綠色）
  { outer: '不堆疊方塊！', middle: '爬升 1', color1: '#32CD32', color2: '#E8F5E9', blocks: 0, climb: 1, icon: '🚫', section: 1 },
  { outer: '不堆疊方塊！', middle: '爬升 3', color1: '#32CD32', color2: '#E8F5E9', blocks: 0, climb: 3, icon: '🚫', section: 1 },
  { outer: '不堆疊方塊！', middle: '爬升 4', color1: '#32CD32', color2: '#E8F5E9', blocks: 0, climb: 4, icon: '🚫', section: 1 },
  { outer: '不堆疊方塊！', middle: '爬升 2', color1: '#32CD32', color2: '#E8F5E9', blocks: 0, climb: 2, icon: '🚫', section: 1 },
  
  // 第2大區 - 堆疊 1 個方塊（藍色）
  { outer: '堆疊 1 個方塊', middle: '爬升 2', color1: '#4169E1', color2: '#E3F2FD', blocks: 1, climb: 2, icon: '📦', section: 2 },
  { outer: '堆疊 1 個方塊', middle: '神秘', color1: '#4169E1', color2: '#8B4513', blocks: 1, climb: '?', icon: '❓', hasImage: true, section: 2 },
  { outer: '堆疊 1 個方塊', middle: '爬升 3', color1: '#4169E1', color2: '#E3F2FD', blocks: 1, climb: 3, icon: '📦', section: 2 },
  { outer: '堆疊 1 個方塊', middle: '爬升 4', color1: '#4169E1', color2: '#E3F2FD', blocks: 1, climb: 4, icon: '📦', section: 2 },
  
  // 第3大區 - 堆疊 2 個方塊（紅色）
  { outer: '堆疊 2 個方塊', middle: '爬升 1', color1: '#DC143C', color2: '#FFE5E5', blocks: 2, climb: 1, icon: '📦📦', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '翻轉', color1: '#DC143C', color2: '#FFD93D', blocks: 2, climb: 'REVERSE', icon: '🔄', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '爬升 2', color1: '#DC143C', color2: '#FFE5E5', blocks: 2, climb: 2, icon: '📦📦', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '爬升 1', color1: '#DC143C', color2: '#FFE5E5', blocks: 2, climb: 1, icon: '📦📦', section: 3 },
  
  // 第4大區 - 堆疊 1 個方塊（橘黃色）
  { outer: '堆疊 1 個方塊', middle: '爬升 3', color1: '#FFA500', color2: '#FFF9E3', blocks: 1, climb: 3, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '爬升 4', color1: '#FFA500', color2: '#FFF9E3', blocks: 1, climb: 4, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '爬升 2', color1: '#FFA500', color2: '#FFF9E3', blocks: 1, climb: 2, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '神秘', color1: '#FFA500', color2: '#8B4513', blocks: 1, climb: '?', icon: '❓', hasImage: true, section: 4 },
];

// 狀態管理
const isGameActive = ref(false);
const showResults = ref(false);
const isSpinning = ref(false);
const currentRotation = ref(0);
const showBlockAnimation = ref(false);
const showClimbAnimation = ref(false);

const gameState = ref({
  totalBlocks: 0,
  totalClimbs: 0,
  history: [] as Array<{ action: string; blocks: number; climb?: number | string }>
});

const resultHTML = ref(`
  <div class="result-icon">⭐</div>
  準備好開始遊戲了嗎？<br>點擊 SPIN 轉動轉盤！
`);

// Refs
const wheelRef = ref<SVGGElement | null>(null);
const segmentsOuterRef = ref<SVGGElement | null>(null);
const segmentsMiddleRef = ref<SVGGElement | null>(null);

// SVG 輔助函數
function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = angleInDegrees * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function describeArc(
  x: number, 
  y: number, 
  radiusOuter: number, 
  radiusInner: number, 
  startAngle: number, 
  endAngle: number
): string {
  const start1 = polarToCartesian(x, y, radiusOuter, endAngle);
  const end1 = polarToCartesian(x, y, radiusOuter, startAngle);
  const start2 = polarToCartesian(x, y, radiusInner, endAngle);
  const end2 = polarToCartesian(x, y, radiusInner, startAngle);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  
  return [
    'M', start1.x, start1.y,
    'A', radiusOuter, radiusOuter, 0, largeArcFlag, 0, end1.x, end1.y,
    'L', end2.x, end2.y,
    'A', radiusInner, radiusInner, 0, largeArcFlag, 1, start2.x, start2.y,
    'L', start1.x, start1.y
  ].join(' ');
}

// 創建轉盤區段
function createSegments() {
  if (!segmentsOuterRef.value || !segmentsMiddleRef.value) return;

  const segmentsOuter = segmentsOuterRef.value;
  const segmentsMiddle = segmentsMiddleRef.value;
  const totalSegments = segments.length;
  const anglePerSegment = 360 / totalSegments;
  
  // 清空現有內容
  segmentsOuter.innerHTML = '';
  segmentsMiddle.innerHTML = '';
  
  // 繪製外圈（4大格）
  const outerSections = [
    { start: 0, end: 4, text: '不堆疊方塊！', color: '#32CD32' },
    { start: 4, end: 8, text: '堆疊 1 個方塊', color: '#4169E1' },
    { start: 8, end: 12, text: '堆疊 2 個方塊', color: '#DC143C' },
    { start: 12, end: 16, text: '堆疊 1 個方塊', color: '#FFA500' },
  ];
  
  outerSections.forEach((section) => {
    const startAngle = section.start * anglePerSegment - 90;
    const endAngle = section.end * anglePerSegment - 90;
    const midAngle = (startAngle + endAngle) / 2;
    
    // 繪製外圈大格
    const pathOuter = describeArc(200, 200, 190, 125, startAngle, endAngle);
    const segmentOuter = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    segmentOuter.setAttribute('d', pathOuter);
    segmentOuter.setAttribute('fill', section.color);
    segmentOuter.setAttribute('stroke', '#fff');
    segmentOuter.setAttribute('stroke-width', '4');
    segmentsOuter.appendChild(segmentOuter);
    
    // 外圈文字
    const textRadius = 157;
    const textX = 200 + textRadius * Math.cos(midAngle * Math.PI / 180);
    const textY = 200 + textRadius * Math.sin(midAngle * Math.PI / 180);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', textX.toString());
    text.setAttribute('y', textY.toString());
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('transform', `rotate(${midAngle + 90}, ${textX}, ${textY})`);
    text.style.fontSize = '11px';
    text.style.fontWeight = 'bold';
    text.style.fill = 'white';
    text.style.fontFamily = "'Press Start 2P', cursive";
    text.textContent = section.text;
    segmentsOuter.appendChild(text);
  });
  
  // 繪製中圈（16小格）
  segments.forEach((segment, index) => {
    const startAngle = index * anglePerSegment - 90;
    const endAngle = (index + 1) * anglePerSegment - 90;
    const midAngle = (startAngle + endAngle) / 2;
    
    // 中圈小格
    const pathMiddle = describeArc(200, 200, 120, 90, startAngle, endAngle);
    const segmentMiddle = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    segmentMiddle.setAttribute('d', pathMiddle);
    segmentMiddle.setAttribute('fill', segment.color2);
    segmentMiddle.setAttribute('stroke', '#333');
    segmentMiddle.setAttribute('stroke-width', '2');
    segmentMiddle.classList.add('segment');
    segmentsMiddle.appendChild(segmentMiddle);
    
    // 中圈數字/文字
    const textRadiusMiddle = 105;
    const textXMiddle = 200 + textRadiusMiddle * Math.cos(midAngle * Math.PI / 180);
    const textYMiddle = 200 + textRadiusMiddle * Math.sin(midAngle * Math.PI / 180);
    
    // 如果是問號方塊，顯示圖片
    if (segment.hasImage) {
      const imageSize = 18;
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/assets/question-block.png');
      image.setAttribute('x', (textXMiddle - imageSize / 2).toString());
      image.setAttribute('y', (textYMiddle - imageSize / 2).toString());
      image.setAttribute('width', imageSize.toString());
      image.setAttribute('height', imageSize.toString());
      image.setAttribute('transform', `rotate(${midAngle + 90}, ${textXMiddle}, ${textYMiddle})`);
      segmentsMiddle.appendChild(image);
    } else {
      // 一般文字
      const textMiddle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      textMiddle.setAttribute('x', textXMiddle.toString());
      textMiddle.setAttribute('y', textYMiddle.toString());
      textMiddle.setAttribute('text-anchor', 'middle');
      textMiddle.setAttribute('transform', `rotate(${midAngle + 90}, ${textXMiddle}, ${textYMiddle})`);
      textMiddle.classList.add('segment-number');
      textMiddle.style.fontSize = '9px';
      textMiddle.style.fontWeight = 'bold';
      textMiddle.textContent = segment.middle;
      segmentsMiddle.appendChild(textMiddle);
    }
  });
}

// 轉動轉盤
function spin() {
  if (isSpinning.value) return;
  
  isSpinning.value = true;
  
  const spins = 5 + Math.floor(Math.random() * 3);
  const randomAngle = Math.floor(Math.random() * 360);
  const totalRotation = spins * 360 + randomAngle;
  
  currentRotation.value += totalRotation;
  
  setTimeout(() => {
    isSpinning.value = false;
    
    const finalAngle = currentRotation.value % 360;
    const adjustedAngle = (360 - finalAngle + 90) % 360;
    const segmentIndex = Math.floor(adjustedAngle / (360 / segments.length));
    
    if (segmentIndex >= 0 && segmentIndex < segments.length) {
      const selectedSegment = segments[segmentIndex];
      if (selectedSegment) {
        showResult(selectedSegment);
      }
    }
  }, 4000);
}

// 顯示結果
function showResult(segment: Segment) {
  gameState.value.totalBlocks += segment.blocks;
  
  // 觸發方塊動畫
  showBlockAnimation.value = true;
  setTimeout(() => {
    showBlockAnimation.value = false;
  }, 1000);
  
  let html = `<div class="result-icon">${segment.icon}</div>`;
  
  if (segment.climb === 'REVERSE') {
    gameState.value.history.push({
      action: '翻轉遊戲',
      blocks: segment.blocks
    });
  } else if (segment.climb === '?') {
    gameState.value.history.push({
      action: '神秘方塊！',
      blocks: segment.blocks,
      climb: '?'
    });
  } else {
    const climbValue = typeof segment.climb === 'number' ? segment.climb : 0;
    gameState.value.totalClimbs += climbValue;
    // 觸發爬升動畫
    showClimbAnimation.value = true;
    setTimeout(() => {
      showClimbAnimation.value = false;
    }, 1000);
    
    gameState.value.history.push({
      action: '爬升',
      blocks: segment.blocks,
      climb: segment.climb
    });
  }
  
  if (segment.climb === 'REVERSE') {
    html += `<strong>🔄 翻轉遊戲！</strong><br>`;
    html += `堆疊 ${segment.blocks} 個方塊<br>`;
    html += `遊戲順序翻轉！`;
  } else if (segment.climb === '?') {
    html += `<strong>❓ 神秘方塊！</strong><br>`;
    html += `堆疊 ${segment.blocks} 個方塊<br>`;
    html += `抽取特殊卡片！`;
  } else {
    html += `<strong>堆疊 ${segment.blocks} 個方塊</strong><br>`;
    html += `<strong>爬升 ${segment.climb} 格</strong>`;
  }
  
  resultHTML.value = html;
}

// 重置遊戲
function reset() {
  gameState.value = {
    totalBlocks: 0,
    totalClimbs: 0,
    history: []
  };
  resultHTML.value = `
    <div class="result-icon">⭐</div>
    準備好開始遊戲了嗎？<br>點擊 SPIN 轉動轉盤！
  `;
}

// 開始遊戲
function handleStartGame() {
  isGameActive.value = true;
  showResults.value = false;
  reset();
  setTimeout(() => {
    createSegments();
  }, 100);
}

// 結束遊戲
function handleEndGame() {
  isGameActive.value = false;
  showResults.value = true;
}

// 重新開始
function handleRestart() {
  isGameActive.value = true;
  showResults.value = false;
  reset();
  setTimeout(() => {
    createSegments();
  }, 100);
}

// 組件掛載時初始化
onMounted(() => {
  if (isGameActive.value) {
    createSegments();
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Permanent+Marker&display=swap');

.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
}

/* 雲朵動畫背景 */
.game-container::before {
  content: '☁️ ☁️ ☁️ ☁️ ☁️';
  position: absolute;
  top: 10%;
  left: -20%;
  font-size: 3rem;
  opacity: 0.3;
  animation: float 30s linear infinite;
  white-space: nowrap;
}

.game-container::after {
  content: '☁️ ☁️ ☁️ ☁️';
  position: absolute;
  top: 70%;
  right: -20%;
  font-size: 3rem;
  opacity: 0.3;
  animation: float 25s linear infinite reverse;
  white-space: nowrap;
}

@keyframes float {
  0% { transform: translateX(0); }
  100% { transform: translateX(120vw); }
}

.game-playing {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
}

/* 裝飾金幣 */
.coin {
  position: absolute;
  font-size: 3rem;
  animation: bounce 2s ease-in-out infinite;
  z-index: 1;
}

.coin:nth-child(1) {
  top: 5%;
  left: 5%;
  animation-delay: 0s;
}

.coin:nth-child(2) {
  top: 15%;
  right: 8%;
  animation-delay: 0.5s;
}

.coin:nth-child(3) {
  bottom: 20%;
  left: 10%;
  animation-delay: 1s;
}

.coin:nth-child(4) {
  bottom: 10%;
  right: 15%;
  animation-delay: 1.5s;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* 遊戲標題區 */
.game-header {
  text-align: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 10;
}

.game-title {
  font-size: 2.5rem;
  color: white;
  text-shadow: 
    4px 4px 0 #000,
    6px 6px 0 rgba(0,0,0,0.3);
  margin-bottom: 20px;
  font-family: 'Press Start 2P', cursive;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

/* 分數板 */
.score-board {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.95);
  padding: 15px 30px;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0,0,0,0.3);
  border: 4px solid #fff;
  transition: all 0.3s;
}

.score-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0,0,0,0.4);
}

.score-item.animate-border {
  animation: borderGlow 1s ease-in-out;
}

@keyframes borderGlow {
  0%, 100% { border-color: #fff; }
  50% { border-color: #fbbf24; box-shadow: 0 0 20px #fbbf24; }
}

.score-item.total-blocks {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
}

.score-item.total-climbs {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.score-icon {
  font-size: 2.5rem;
}

.score-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.score-label {
  font-size: 14px;
  font-weight: 600;
  opacity: 0.9;
  font-family: 'Press Start 2P', cursive;
}

.score-value {
  font-size: 32px;
  font-weight: 900;
  font-family: 'Press Start 2P', cursive;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.btn-end-game {
  padding: 15px 30px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  border: 3px solid white;
  border-radius: 15px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Press Start 2P', cursive;
  box-shadow: 0 6px 0 #991b1b;
}

.btn-end-game:hover {
  transform: translateY(-3px);
  box-shadow: 0 9px 0 #991b1b;
}

.btn-end-game:active {
  transform: translateY(3px);
  box-shadow: 0 3px 0 #991b1b;
}

/* 轉盤區域 */
.game-board {
  width: 500px;
  height: 500px;
  margin: 30px auto;
  position: relative;
  z-index: 10;
}

.spinner-container {
  width: 100%;
  height: 100%;
  position: relative;
  background: white;
  border-radius: 50%;
  box-shadow: 
    0 10px 40px rgba(0,0,0,0.3),
    inset 0 0 20px rgba(0,0,0,0.1);
  border: 8px solid #fff;
}

#spinner-svg {
  width: 100%;
  height: 100%;
}

.spinner-wheel {
  transform-origin: center;
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
}

.segment {
  transition: opacity 0.3s;
  cursor: pointer;
}

.segment:hover {
  opacity: 0.8;
}

.segment-text {
  fill: white;
  font-family: 'Press Start 2P', cursive;
  pointer-events: none;
}

.segment-number {
  fill: #333;
  font-family: 'Press Start 2P', cursive;
  font-weight: bold;
  pointer-events: none;
}

.center-circle {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

/* 箭頭指針 */
.arrow-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 160px;
  background: linear-gradient(180deg, #E74C3C 0%, #C0392B 100%);
  transform: translate(-50%, -100%);
  transform-origin: center bottom;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5));
  z-index: 15;
  pointer-events: none;
  border-radius: 5px 5px 0 0;
  clip-path: polygon(50% 0%, 100% 15%, 100% 100%, 0% 100%, 0% 15%);
}

.arrow-pointer::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 18px solid transparent;
  border-right: 18px solid transparent;
  border-bottom: 30px solid #E74C3C;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.arrow-pointer::after {
  content: '';
  position: absolute;
  width: 35px;
  height: 35px;
  background: radial-gradient(circle, #34495E 0%, #2C3E50 70%, #1A252F 100%);
  border-radius: 50%;
  bottom: -17px;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 
    0 0 0 3px #95A5A6,
    0 0 0 5px #ECF0F1,
    inset 0 2px 4px rgba(0,0,0,0.4),
    0 4px 10px rgba(0,0,0,0.5);
}

/* 控制按鈕 */
.controls {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 30px 0;
  position: relative;
  z-index: 10;
}

.btn-spin,
.btn-reset {
  padding: 20px 50px;
  border: 4px solid #fff;
  border-radius: 50px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
  font-family: 'Press Start 2P', cursive;
  position: relative;
}

.btn-spin {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  color: white;
  box-shadow: 
    0 10px 0 #d97706,
    0 15px 30px rgba(251, 191, 36, 0.5);
}

.btn-spin:hover:not(:disabled) {
  transform: scale(1.05);
}

.btn-spin:active:not(:disabled) {
  transform: translateY(6px);
  box-shadow: 
    0 4px 0 #d97706,
    0 8px 20px rgba(251, 191, 36, 0.5);
}

.btn-spin:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-reset {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
  box-shadow: 
    0 10px 0 #6d28d9,
    0 15px 30px rgba(139, 92, 246, 0.5);
}

.btn-reset:hover {
  transform: scale(1.05);
}

.btn-reset:active {
  transform: translateY(6px);
  box-shadow: 
    0 4px 0 #6d28d9,
    0 8px 20px rgba(139, 92, 246, 0.5);
}

/* 結果顯示 */
.result {
  text-align: center;
  margin-top: 30px;
  position: relative;
  z-index: 10;
}

.result-text {
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 20px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 4px solid #fbbf24;
  max-width: 600px;
  margin: 0 auto;
  animation: slideUp 0.5s ease-out;
  font-family: 'Press Start 2P', cursive;
  line-height: 1.8;
}

.result-icon {
  font-size: 4rem;
  margin-bottom: 20px;
  animation: pop 0.6s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes pop {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

/* 開始遊戲覆蓋層 */
.start-game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.overlay-content {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.95));
  padding: 60px 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  animation: scaleIn 0.4s ease-out;
  max-width: 90%;
}

.menu-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 15px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', cursive;
}

.menu-subtitle {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 40px;
  font-weight: 600;
}

.btn-start-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 20px 60px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: 4px solid white;
  border-radius: 50px;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.1s;
  margin: 0 auto 30px;
  box-shadow: 
    0 10px 0 #047857,
    0 15px 30px rgba(16, 185, 129, 0.5);
  font-family: 'Press Start 2P', cursive;
}

.btn-start-main:hover {
  transform: scale(1.05);
}

.btn-start-main:active {
  transform: translateY(6px);
  box-shadow: 
    0 4px 0 #047857,
    0 8px 20px rgba(16, 185, 129, 0.5);
}

.start-btn-icon {
  font-size: 32px;
}

.game-rules {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 15px;
  color: white;
  font-size: 14px;
  line-height: 2;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.game-rules p {
  margin: 5px 0;
}

/* 遊戲結束視窗 */
.game-result-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  animation: fadeIn 0.3s ease-out;
}

.result-content {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95), rgba(118, 75, 162, 0.95));
  padding: 50px;
  border-radius: 30px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  text-align: center;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  animation: scaleIn 0.4s ease-out;
}

.result-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin-bottom: 30px;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', cursive;
}

.result-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background: rgba(255, 255, 255, 0.2);
  padding: 20px;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 3px solid rgba(255, 255, 255, 0.3);
}

.stat-item.total-stat {
  grid-column: 1 / -1;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
  border-color: #a78bfa;
}

.stat-item.blocks-stat {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.3), rgba(245, 158, 11, 0.3));
  border-color: #fbbf24;
}

.stat-item.climbs-stat {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3));
  border-color: #a78bfa;
}

.stat-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 10px;
  font-weight: 600;
  font-family: 'Press Start 2P', cursive;
}

.stat-value {
  font-size: 42px;
  font-weight: 900;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-family: 'Press Start 2P', cursive;
}

/* 歷史紀錄區域 */
.history-section {
  margin: 30px 0;
  background: rgba(0, 0, 0, 0.2);
  padding: 20px;
  border-radius: 15px;
}

.history-title {
  font-size: 20px;
  color: white;
  font-weight: bold;
  margin-bottom: 15px;
  font-family: 'Press Start 2P', cursive;
}

.history-list {
  max-height: 200px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: white;
  font-family: 'Press Start 2P', cursive;
  gap: 10px;
}

.history-round {
  color: #fbbf24;
  font-weight: bold;
}

.history-action {
  flex: 1;
  text-align: center;
}

.history-detail {
  color: #a78bfa;
  font-size: 11px;
}

.btn-restart {
  padding: 18px 50px;
  border: 4px solid #fff;
  border-radius: 50px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 
    0 10px 0 #15803d,
    0 15px 30px rgba(34, 197, 94, 0.5);
  transition: all 0.1s;
  font-family: 'Press Start 2P', cursive;
}

.btn-restart:hover {
  transform: scale(1.05);
}

.btn-restart:active {
  transform: translateY(6px);
  box-shadow: 
    0 4px 0 #15803d,
    0 8px 20px rgba(34, 197, 94, 0.5);
}

/* 響應式設計 - 平板 */
@media (max-width: 768px) {
  .game-container {
    padding: 12px;
  }

  .game-title {
    font-size: 1.5rem;
  }

  .game-board {
    width: 90vw;
    height: 90vw;
    margin: 20px auto;
  }

  .score-board {
    gap: 15px;
  }

  .score-item {
    padding: 12px 24px;
  }

  .score-value {
    font-size: 28px;
  }

  .menu-title {
    font-size: 36px;
  }

  .menu-subtitle {
    font-size: 18px;
  }

  .result-stats {
    grid-template-columns: 1fr;
  }

  .stat-item.total-stat,
  .stat-item.blocks-stat,
  .stat-item.climbs-stat {
    grid-column: 1;
  }
}

/* 響應式設計 - 手機 */
@media (max-width: 480px) {
  .game-title {
    font-size: 1.2rem;
    margin-bottom: 15px;
  }

  .score-board {
    gap: 10px;
  }

  .score-item {
    padding: 10px 20px;
    gap: 8px;
  }

  .score-icon {
    font-size: 24px;
  }

  .score-value {
    font-size: 24px;
  }

  .score-label {
    font-size: 12px;
  }

  .btn-start-main {
    padding: 15px 40px;
    font-size: 22px;
  }

  .start-btn-icon {
    font-size: 26px;
  }

  .menu-title {
    font-size: 28px;
  }

  .menu-subtitle {
    font-size: 16px;
  }

  .overlay-content {
    padding: 25px 20px;
  }

  .game-rules {
    font-size: 12px;
    padding: 15px;
  }

  .btn-end-game {
    width: 100%;
    margin-top: 10px;
  }

  .result-content {
    padding: 30px 20px;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    font-size: 11px;
  }
}
</style>