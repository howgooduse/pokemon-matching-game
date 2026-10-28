const LOCAL_STORAGE_KEY = 'pokemon_game_machine_key';

function generateUniqueId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 從 localStorage 取得（或建立）訪客專用的機器碼 */
export function getOrCreateMachineKey(): string {
  try {
    let key = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!key) {
      key = generateUniqueId();
      localStorage.setItem(LOCAL_STORAGE_KEY, key);
    }
    return key;
  } catch {
    return generateUniqueId();
  }
}
