import type { BugMonster, VacationRequest, WebhookPayload } from '../types';
import { fetchProjectSnapshot, projectApiRequest } from '../services/projectApiService';

// Production API client. The browser never manufactures successful responses:
// the configured backend is the source of truth.
export const api = {
  async fetchMonsters(): Promise<BugMonster[]> {
    return (await fetchProjectSnapshot())?.monstersState || [];
  },

  async attackMonster(monsterId: string, damage: number): Promise<{ success: boolean; isDefeated: boolean }> {
    return projectApiRequest(`/v1/monsters/${encodeURIComponent(monsterId)}/attacks`, {
      method: 'POST', body: JSON.stringify({ damage }),
    });
  },

  async submitVacation(request: Partial<VacationRequest>): Promise<boolean> {
    await projectApiRequest('/v1/vacations', { method: 'POST', body: JSON.stringify(request) });
    return true;
  },

  async sendWebhook(payload: Partial<WebhookPayload>): Promise<boolean> {
    await projectApiRequest('/v1/webhooks/events', { method: 'POST', body: JSON.stringify(payload) });
    return true;
  }
};
