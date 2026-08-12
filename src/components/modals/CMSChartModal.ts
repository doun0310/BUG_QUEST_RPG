import type { AppState } from '../../store';
import { icon } from '../../icons';
import { renderModalHeader } from '../ui';
import { loadTeamSettings, buildProjectBudget } from '../../services/teamSettingsService';

export function renderCMSChartModal(state?: AppState): string {
  const settings = loadTeamSettings();
  const monsters = state?.monstersState || [];
  const budget = buildProjectBudget(settings, monsters);

  const alertBadge = budget.burnRateAlert
    ? `<span class="badge badge-danger" style="margin-left: 0.5rem;">⚠️ 예산 초과 주의</span>`
    : `<span class="badge badge-success" style="margin-left: 0.5rem;">✅ 안정적 운영</span>`;

  return `
    <div class="modal-backdrop budget-analytics-backdrop" id="modal-backdrop">
      <div class="modal-card analytics-modal budget-analytics-modal">
        ${renderModalHeader({ icon: 'chart', eyebrow: 'PROJECT ANALYTICS', title: '실시간 예산 소진 현황' })}
        
        <div class="chart-surface">
          <canvas id="burnChartCanvas" style="max-height: 240px;"></canvas>
        </div>

        <div class="analytics-summary">
          <div>
            <span>${icon('chart', '', 13)} 총 프로젝트 예산 ${alertBadge}</span>
            <strong>₩${budget.totalBudget.toLocaleString('ko-KR')}</strong>
            <small style="color: var(--text-muted); display: block; margin-top: 0.2rem;">
              프로젝트 기간: ${budget.projectDays}일 (${budget.currentDay}일 경과)
            </small>
          </div>
          <div>
            <span>${icon('activity', '', 13)} 현재 실시간 소진</span>
            <strong>₩${budget.spentBudget.toLocaleString('ko-KR')} <small>(${budget.actualBurnRate}%)</small></strong>
            <small style="color: var(--primary-light); display: block; margin-top: 0.2rem;">
              버그 처리율: ${budget.defeatedCount}/${budget.totalMonsters}개 (${budget.damageProgressRate}%)
            </small>
          </div>
        </div>
      </div>
    </div>
  `;
}

