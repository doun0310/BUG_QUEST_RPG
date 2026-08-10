import type { BugMonster, VacationRequest, WebhookPayload } from '../types';
import { showToast } from '../toastManager';

// Simulated API Client layer
export const api = {
  async fetchMonsters(): Promise<BugMonster[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const stored = localStorage.getItem('monstersState');
        resolve(stored ? JSON.parse(stored) : []);
      }, 150);
    });
  },

  async attackMonster(_monsterId: string, damage: number): Promise<{ success: boolean; isDefeated: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        showToast(`[API Sync] PR Merge 공격 요청 성공 (-${damage} HP)`, 'success');
        resolve({ success: true, isDefeated: false });
      }, 200);
    });
  },

  async submitVacation(request: Partial<VacationRequest>): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        showToast(`[API Sync] ${request.type} 신청이 승인 서버로 등록되었습니다.`, 'success');
        resolve(true);
      }, 200);
    });
  },

  async sendWebhook(_payload: Partial<WebhookPayload>): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        showToast(`[API Sync] Webhook 이벤트 전송 완료`, 'info');
        resolve(true);
      }, 150);
    });
  }
};
