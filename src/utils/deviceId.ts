// src/utils/deviceId.ts

const LOCAL_STORAGE_KEY = 'pokemon_game_machine_key';

function generateUniqueId(): string {
  // 簡單的 UUID v4 生成
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 從 localStorage 獲取或創建一個訪客專用的機器碼
 * @returns {string} 唯一的機器碼
 */
export function getOrCreateMachineKey(): string {
  let key = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!key) {
    key = generateUniqueId();
    localStorage.setItem(LOCAL_STORAGE_KEY, key);
  }
  
  return key;
}