import axios from 'axios';
import { getOrCreateMachineKey } from '@/utils/deviceId';

/** 後端 API 位址，可在 .env 以 VITE_API_BASE_URL 覆寫 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

/** 提交分數的 DTO */
export interface ScoreSubmissionDto {
  score: number;
  timeTakenSeconds: number;
  deckSize: number;
  /** 訪客提交時需附帶機碼 */
  machineKey?: string;
}

// 請求攔截器：附加 JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const scoresApi = {
  submitScore(data: ScoreSubmissionDto, isGuest = false) {
    return isGuest
      ? api.post('guest/submit', { ...data, machineKey: getOrCreateMachineKey() })
      : api.post('scores/submit', data);
  },

  getLeaderboard() {
    return api.get('scores/leaderboard');
  },
};

export default api;
