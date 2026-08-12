import type { AppState } from '../../store';
import { mockBudget } from '../../mockData';
import { icon } from '../../icons';
import { renderModalHeader } from '../ui';

export function renderCMSChartModal(_state: AppState): string {
  return `
    <div class="modal-backdrop budget-analytics-backdrop" id="modal-backdrop">
      <div class="modal-card analytics-modal budget-analytics-modal">
        ${renderModalHeader({ icon: 'chart', eyebrow: 'PROJECT ANALYTICS', title: '예산 소진 현황' })}
        
        <div class="chart-surface">
          <canvas id="burnChartCanvas" style="max-height: 240px;"></canvas>
        </div>

        <div class="analytics-summary">
          <div><span>${icon('chart', '', 13)} 총 예산</span><strong>₩${mockBudget.totalBudget.toLocaleString()}</strong></div>
          <div><span>${icon('activity', '', 13)} 현재 소진</span><strong>₩${mockBudget.spentBudget.toLocaleString()} <small>(${mockBudget.actualBurnRate}%)</small></strong></div>
        </div>
      </div>
    </div>
  `;
}
