import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalHeader } from '../ui';
import { loadTeamSettings, buildProjectBudget } from '../../services/teamSettingsService';

export function renderCMSChartModal(state?: AppState): string {
  const settings = loadTeamSettings();
  const monsters = state?.monstersState || [];
  const budget = buildProjectBudget(settings, monsters);
  const remainingBudget = Math.max(0, budget.totalBudget - budget.spentBudget);
  const burnDelta = Number((budget.actualBurnRate - budget.idealBurnRate).toFixed(1));
  const isOverPlan = burnDelta > 0;
  const statusLabel = budget.burnRateAlert ? '예산 소진 주의' : isOverPlan ? '계획 범위 내 주의' : '계획 대비 안정';
  const statusDescription = budget.burnRateAlert
    ? `계획보다 ${Math.abs(burnDelta).toFixed(1)}%p 빠르게 소진되고 있습니다.`
    : isOverPlan
      ? `계획보다 ${burnDelta.toFixed(1)}%p 높지만 허용 범위입니다.`
      : `계획보다 ${Math.abs(burnDelta).toFixed(1)}%p 여유가 있습니다.`;
  const alertTone = budget.burnRateAlert ? 'is-alert' : isOverPlan ? 'is-watch' : 'is-stable';

  return `
    <div class="modal-backdrop budget-analytics-backdrop" id="modal-backdrop">
      <div class="modal-card analytics-modal budget-analytics-modal">
        ${renderModalHeader({ icon: 'chart', eyebrow: 'PROJECT ANALYTICS', title: '실시간 예산 소진 현황' })}
        
        <div class="budget-status-strip ${alertTone}" role="status">
          <span class="budget-status-icon">${icon(budget.burnRateAlert ? 'warning' : isOverPlan ? 'activity' : 'check', '', 16)}</span>
          <div><strong>${statusLabel}</strong><span>${statusDescription}</span></div>
          <span class="budget-status-delta">${burnDelta > 0 ? '+' : ''}${burnDelta.toFixed(1)}%p</span>
        </div>

        <div class="budget-kpi-grid" aria-label="예산 핵심 지표">
          <div class="budget-kpi"><span>총 프로젝트 예산</span><strong>₩${budget.totalBudget.toLocaleString('ko-KR')}</strong><small>${budget.projectDays}일 프로젝트 · ${budget.currentDay}일 경과</small></div>
          <div class="budget-kpi budget-kpi-spent"><span>현재 실시간 소진</span><strong>₩${budget.spentBudget.toLocaleString('ko-KR')}</strong><small>총 예산의 ${budget.actualBurnRate}%</small></div>
          <div class="budget-kpi"><span>잔여 예산</span><strong>₩${remainingBudget.toLocaleString('ko-KR')}</strong><small>버그 처리율 ${budget.defeatedCount}/${budget.totalMonsters}개</small></div>
        </div>

        <div class="budget-progress-block">
          <div><span>예산 소진율</span><strong>${budget.actualBurnRate}% <small>· 계획 ${budget.idealBurnRate}%</small></strong></div>
          <div class="budget-progress-track" aria-label="현재 예산 소진율 ${budget.actualBurnRate}%"><i style="width:${budget.actualBurnRate}%"></i></div>
        </div>

        <div class="chart-surface budget-chart-surface">
          <canvas id="burnChartCanvas" style="max-height: 240px;"></canvas>
        </div>
      </div>
    </div>
  `;
}
