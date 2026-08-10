import type { AppState } from '../../store';
import { mockBudget } from '../../mockData';

export function renderCMSChartModal(_state: AppState): string {
  return `
    <div class="modal-backdrop" id="modal-backdrop">
      <div class="modal-card" style="max-width: 600px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <h2 style="font-size: 1.05rem; font-weight: 700;">📊 CMS 예산 소진 곡선 (Chart.js 시각화)</h2>
          <button class="action-btn action-btn-secondary" id="btn-close-modal">닫기</button>
        </div>
        
        <div style="background: var(--inner-box-bg); padding: 1rem; border-radius: 6px; border: 1px solid var(--panel-border); margin-bottom: 1rem;">
          <canvas id="burnChartCanvas" style="max-height: 240px;"></canvas>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.78rem;">
          <div style="display: flex; justify-content: space-between; background: var(--inner-box-bg); padding: 0.6rem; border-radius: 6px; border: 1px solid var(--panel-border);">
            <span>총 예산: ₩${mockBudget.totalBudget.toLocaleString()}</span>
            <span>현재 소진액: ₩${mockBudget.spentBudget.toLocaleString()} (${mockBudget.actualBurnRate}%)</span>
          </div>
        </div>
      </div>
    </div>
  `;
}
