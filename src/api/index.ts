// src/api/index.ts

import axios from 'axios';
import { getOrCreateMachineKey } from '@/utils/deviceId';

const API_BASE_URL = 'http://localhost:5000/api/'; // <-- 確保與您的 .NET API 端口一致

const api = axios.create({
  baseURL: API_BASE_URL, 
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  }
});

/**
 * 提交分數的 DTO (Data Transfer Object) 結構
 */
interface ScoreSubmissionDto {
    score: number;
    timeTakenSeconds: number;
    deckSize: number;
    // 訪客提交需要提供機碼
    machineKey?: string; 
}

// **--- 請求攔截器：處理 JWT Token ---**
api.interceptors.request.use(
  (config) => {
    // 假設您的登入 token 儲存在 localStorage
    const token = localStorage.getItem('jwtToken'); 
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// **--- API 函數定義 ---**
export const scoresApi = {
    // 提交分數
    submitScore(data: ScoreSubmissionDto, isGuest: boolean = false) {
        if (isGuest) {
            // 訪客提交，需要添加機碼
            const guestData = { ...data, machineKey: getOrCreateMachineKey() };
            return api.post('guest/submit', guestData);
        } else {
            // 登入用戶提交
            return api.post('scores/submit', data);
        }
    },
    
    // 獲取排行榜
    getLeaderboard() {
        return api.get('scores/leaderboard');
    }
};

export default api;