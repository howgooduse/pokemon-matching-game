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
import { ref, nextTick } from 'vue';

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
  // 第1大區 - 堆疊 1 個方塊（橘黃色）
  { outer: '堆疊 1 個方塊', middle: '爬升 1', color1: '#FFA500', color2: '#FFE4B5', blocks: 1, climb: 1, icon: '📦', section: 1 },
  { outer: '堆疊 1 個方塊', middle: '爬升 3', color1: '#FFA500', color2: '#FFE4B5', blocks: 1, climb: 3, icon: '📦', section: 1 },
  { outer: '堆疊 1 個方塊', middle: '爬升 4', color1: '#FFA500', color2: '#FFE4B5', blocks: 1, climb: 4, icon: '📦', section: 1 },
  { outer: '堆疊 1 個方塊', middle: '爬升 2', color1: '#FFA500', color2: '#FFE4B5', blocks: 1, climb: 2, icon: '📦', section: 1 },
  
  // 第2大區 - 不堆疊方塊（藍色）
  { outer: '不堆疊方塊！', middle: '爬升 2', color1: '#4169E1', color2: '#B0E0E6', blocks: 0, climb: 2, icon: '🚫', section: 2 },
  { outer: '不堆疊方塊！', middle: '神秘', color1: '#4169E1', color2: '#FFD700', blocks: 0, climb: '?', icon: '❓', hasImage: true, section: 2 },
  { outer: '不堆疊方塊！', middle: '爬升 3', color1: '#4169E1', color2: '#B0E0E6', blocks: 0, climb: 3, icon: '🚫', section: 2 },
  { outer: '不堆疊方塊！', middle: '爬升 4', color1: '#4169E1', color2: '#B0E0E6', blocks: 0, climb: 4, icon: '🚫', section: 2 },
  
  // 第3大區 - 堆疊 2 個方塊（紅色）
  { outer: '堆疊 2 個方塊', middle: '爬升 1', color1: '#DC143C', color2: '#FFB6C1', blocks: 2, climb: 1, icon: '📦📦', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '翻轉', color1: '#DC143C', color2: '#FFD700', blocks: 2, climb: 'REVERSE', icon: '🔄', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '爬升 2', color1: '#DC143C', color2: '#FFB6C1', blocks: 2, climb: 2, icon: '📦📦', section: 3 },
  { outer: '堆疊 2 個方塊', middle: '爬升 1', color1: '#DC143C', color2: '#FFB6C1', blocks: 2, climb: 1, icon: '📦📦', section: 3 },
  
  // 第4大區 - 堆疊 1 個方塊（綠色）
  { outer: '堆疊 1 個方塊', middle: '爬升 3', color1: '#32CD32', color2: '#90EE90', blocks: 1, climb: 3, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '爬升 4', color1: '#32CD32', color2: '#90EE90', blocks: 1, climb: 4, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '爬升 2', color1: '#32CD32', color2: '#90EE90', blocks: 1, climb: 2, icon: '📦', section: 4 },
  { outer: '堆疊 1 個方塊', middle: '神秘', color1: '#32CD32', color2: '#FFD700', blocks: 1, climb: '?', icon: '❓', hasImage: true, section: 4 },
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
    { start: 0, end: 4, text: '堆疊 1 個方塊', color: '#FFA500' },
    { start: 4, end: 8, text: '不堆疊方塊！', color: '#4169E1' },
    { start: 8, end: 12, text: '堆疊 2 個方塊', color: '#DC143C' },
    { start: 12, end: 16, text: '堆疊 1 個方塊', color: '#32CD32' },
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
  
  const spins = 5 + Math.random() * 3;
  const extraDegrees = Math.random() * 360;
  const totalRotation = spins * 360 + extraDegrees;
  
  currentRotation.value += totalRotation;
  
  setTimeout(() => {
    const normalizedRotation = currentRotation.value % 360;
    const segmentAngle = 360 / segments.length;
    const pointerAngle = (360 - normalizedRotation + 90) % 360;
    const segmentIndex = Math.floor(pointerAngle / segmentAngle) % segments.length;
    
    // 確保 segmentIndex 有效且 segments 陣列中有對應元素
    if (segmentIndex >= 0 && segmentIndex < segments.length) {
      const selectedSegment = segments[segmentIndex];
      if (selectedSegment) {
        showResult(selectedSegment);
      }
    }
    
    isSpinning.value = false;
  }, 4000);
}

// 顯示結果
function showResult(segment: Segment) {
  // 更新遊戲狀態
  gameState.value.totalBlocks += segment.blocks;
  
  // 觸發方塊動畫
  showBlockAnimation.value = true;
  setTimeout(() => {
    showBlockAnimation.value = false;
  }, 1000);
  
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
  
  // 更新結果 HTML
  let html = `<div class="result-icon">${segment.icon}</div>`;
  
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
  
  html += `<br><br>`;
  html += `📊 總方塊數: ${gameState.value.totalBlocks}<br>`;
  html += `🎯 總爬升: ${gameState.value.totalClimbs} 格`;
  
  resultHTML.value = `<div class="result-text">${html}</div>`;
}

// 重置遊戲
function reset() {
  currentRotation.value = 0;
  gameState.value = {
    totalBlocks: 0,
    totalClimbs: 0,
    history: []
  };
  
  resultHTML.value = `
    <div class="result-icon">⭐</div>
    遊戲已重置！<br>準備開始新的冒險！
  `;
}

// 開始遊戲
function handleStartGame() {
  isGameActive.value = true;
  showResults.value = false;
  nextTick(() => {
    createSegments();
  });
}

// 結束遊戲
function handleEndGame() {
  isGameActive.value = false;
  showResults.value = true;
}

// 重新開始
function handleRestart() {
  reset();
  handleStartGame();
}
</script>

<style scoped>
.game-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
}

/* 背景動畫雲朵 */
.game-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(ellipse 150px 80px at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
    radial-gradient(ellipse 200px 100px at 70% 60%, rgba(255,255,255,0.2) 0%, transparent 50%),
    radial-gradient(ellipse 180px 90px at 40% 80%, rgba(255,255,255,0.25) 0%, transparent 50%);
  animation: clouds 60s infinite linear;
  z-index: 0;
}

@keyframes clouds {
  0% { background-position: 0% 0%, 0% 0%, 0% 0%; }
  100% { background-position: 100% 0%, -100% 0%, 50% 0%; }
}

.game-playing {
  position: relative;
  max-width: 900px;
  width: 100%;
  z-index: 1;
}

/* 裝飾金幣 */
.coin {
  position: absolute;
  font-size: 2rem;
  animation: float 3s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

.coin:nth-child(1) { top: 10%; left: 10%; animation-delay: 0s; }
.coin:nth-child(2) { top: 20%; right: 15%; animation-delay: 0.5s; }
.coin:nth-child(3) { bottom: 15%; left: 15%; animation-delay: 1s; }
.coin:nth-child(4) { bottom: 20%; right: 10%; animation-delay: 1.5s; }

/* 遊戲標題 */
.game-header {
  margin-bottom: 20px;
}

.game-title {
  text-align: center;
  font-size: clamp(1.5rem, 5vw, 3rem);
  font-weight: 800;
  color: #FFD700;
  margin: 0 0 20px 0;
  text-shadow: 
    4px 4px 0 #ff6b6b,
    8px 8px 0 rgba(0,0,0,0.3);
  animation: bounce 2s ease-in-out infinite;
  font-family: 'Press Start 2P', cursive;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* 分數板 */
.score-board {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  align-items: center;
  flex-wrap: wrap;
}

.score-item {
  display: flex;
  align-items: center;
  gap: 12px;
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 15px 30px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s, box-shadow 0.3s;
  border: 3px solid transparent;
}

.score-item:hover {
  transform: translateY(-2px);
}

.score-item.total-blocks {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
  border-color: #fbbf24;
}

.score-item.total-climbs {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  border-color: #a78bfa;
}

.score-icon {
  font-size: 32px;
  font-weight: bold;
}

.score-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.score-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
  font-family: 'Press Start 2P', cursive;
}

.score-value {
  font-size: 32px;
  font-weight: bold;
  color: white;
  line-height: 1;
  font-family: 'Press Start 2P', cursive;
}

/* 邊框亮燈動畫 */
@keyframes border-glow {
  0%, 100% {
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 
                0 0 60px rgba(255, 255, 255, 0.6), 
                0 4px 15px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
  }
}

.score-item.animate-border {
  animation: border-glow 0.5s ease-in-out 2;
}

/* 結束遊戲按鈕 */
.btn-end-game {
  padding: 15px 30px;
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
  transition: all 0.3s;
  font-family: 'Press Start 2P', cursive;
}

.btn-end-game:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(239, 68, 68, 0.6);
  background: linear-gradient(135deg, #dc2626, #b91c1c);
}

/* 轉盤區域 */
.game-board {
  position: relative;
  width: min(90vw, 500px);
  height: min(90vw, 500px);
  margin: 30px auto;
  animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
}

.spinner-container {
  position: relative;
  width: 100%;
  height: 100%;
}

svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 10px 30px rgba(0,0,0,0.4));
}

.spinner-wheel {
  transition: transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99);
  transform-origin: center;
}

.segment {
  cursor: pointer;
  transition: opacity 0.3s;
}

.segment:hover {
  opacity: 0.9;
}

.segment-text {
  font-family: 'Permanent Marker', cursive;
  font-size: 16px;
  font-weight: bold;
  fill: white;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  pointer-events: none;
}

.segment-number {
  font-family: 'Press Start 2P', cursive;
  font-size: 14px;
  fill: #333;
  font-weight: bold;
  pointer-events: none;
}

.center-circle {
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.arrow-pointer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-left: 25px solid transparent;
  border-right: 25px solid transparent;
  border-top: 60px solid white;
  transform: translate(-50%, -150px);
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  z-index: 10;
}

.arrow-pointer::after {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  top: -70px;
  left: 50%;
  transform: translateX(-50%);
}

/* 控制按鈕 */
.controls {
  margin-top: 40px;
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

button {
  font-family: 'Press Start 2P', cursive;
  font-size: clamp(0.7rem, 2vw, 1rem);
  padding: 15px 30px;
  border: 4px solid #fff;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.1s;
  position: relative;
  overflow: hidden;
}

.btn-spin {
  background: linear-gradient(145deg, #ff6b6b, #ff5252);
  color: white;
  box-shadow: 
    0 8px 0 #c92a2a,
    0 12px 20px rgba(0,0,0,0.3);
}

.btn-spin:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: 
    0 8px 0 #999,
    0 12px 20px rgba(0,0,0,0.2);
}

.btn-reset {
  background: linear-gradient(145deg, #4ade80, #22c55e);
  color: white;
  box-shadow: 
    0 8px 0 #15803d,
    0 12px 20px rgba(0,0,0,0.3);
}

button:not(:disabled):active {
  transform: translateY(4px);
}

.btn-spin:not(:disabled):active {
  box-shadow: 
    0 4px 0 #c92a2a,
    0 6px 10px rgba(0,0,0,0.3);
}

.btn-reset:active {
  box-shadow: 
    0 4px 0 #15803d,
    0 6px 10px rgba(0,0,0,0.3);
}

/* 結果顯示 */
.result {
  margin-top: 30px;
  padding: 20px 40px;
  background: rgba(255,255,255,0.95);
  border-radius: 20px;
  border: 4px solid #FFD700;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.result-text {
  font-size: clamp(1rem, 3vw, 1.5rem);
  color: #333;
  text-align: center;
  line-height: 1.6;
  font-family: 'Press Start 2P', cursive;
}

.result-icon {
  font-size: 3rem;
  margin-bottom: 10px;
  animation: pop 0.5s ease-out;
}

@keyframes pop {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

/* 開始遊戲覆蓋層 */
.start-game-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 500;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-radius: 20px;
}

.overlay-content {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.menu-title {
  font-size: 48px;
  font-weight: 800;
  color: #FFD700;
  margin-bottom: 10px;
  text-shadow: 
    4px 4px 0 #ff6b6b,
    8px 8px 0 rgba(0,0,0,0.3);
  font-family: 'Press Start 2P', cursive;
}

.menu-subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 30px;
  font-weight: 500;
  font-family: 'Press Start 2P', cursive;
}

.btn-start-main {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  padding: 20px 60px;
  border: 4px solid #fff;
  border-radius: 50px;
  background: linear-gradient(135deg, #4ade80, #22c55e);
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 
    0 10px 0 #15803d,
    0 15px 30px rgba(34, 197, 94, 0.5);
  transition: all 0.1s;
  animation: pulse-big 2s ease-in-out infinite;
  margin-bottom: 30px;
  font-family: 'Press Start 2P', cursive;
}

.btn-start-main:hover {
  transform: scale(1.05);
}

.btn-start-main:active {
  transform: translateY(6px);
  box-shadow: 
    0 4px 0 #15803d,
    0 8px 20px rgba(34, 197, 94, 0.5);
}

.start-btn-text {
  white-space: nowrap;
}

.start-btn-icon {
  font-size: 32px;
}

@keyframes pulse-big {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.game-rules {
  text-align: left;
  color: white;
  font-size: 14px;
  line-height: 1.8;
  padding: 20px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 15px;
  max-width: 320px;
  margin: 0 auto;
  font-family: 'Press Start 2P', cursive;
}

.game-rules p {
  margin: 5px 0;
}

.game-rules p:first-child {
  font-weight: bold;
  margin-bottom: 10px;
  font-size: 16px;
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

@keyframes scaleIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
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