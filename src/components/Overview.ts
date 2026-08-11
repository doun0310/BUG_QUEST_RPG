import type { AppState } from '../store';
import { calculateCapacity } from '../mockData';
import { icon } from '../icons';

/** Product-focused landing summary. Game progress stays present, but never competes with work priorities. */
export function renderOverview(state: AppState): string {
  const active = state.monstersState.filter(m => m.status === 'Active');
  const critical = active.filter(m => m.severity === 'Critical' || m.isOverdue).length;
  const capacity = calculateCapacity(state.teamState);
  const load = Math.round((capacity.assignedHours / capacity.availableHours) * 100);
  const nextIssue = active[0];

  return `
    <section class="product-overview" aria-labelledby="overview-title">
      <div class="overview-intro">
        <div class="eyebrow">${icon('overview', '', 14)} TEAM OVERVIEW</div>
        <h2 id="overview-title">오늘의 개발 현황</h2>
        <p>${nextIssue ? `<strong>${nextIssue.title}</strong> 이슈가 현재 가장 높은 우선순위입니다.` : '현재 처리할 활성 이슈가 없습니다. 좋은 흐름입니다.'}</p>
      </div>
      <div class="overview-metrics" aria-label="팀 핵심 지표">
        <div class="metric-card metric-danger">
          <span class="metric-icon">${icon('bug', '', 18)}</span>
          <div><span class="metric-label">활성 이슈</span><strong>${active.length}</strong><small>${critical ? `긴급 ${critical}건` : '긴급 이슈 없음'}</small></div>
        </div>
        <div class="metric-card">
          <span class="metric-icon">${icon('activity', '', 18)}</span>
          <div><span class="metric-label">팀 가동률</span><strong>${load}%</strong><small>${capacity.isOverloaded ? '조정 필요' : '안정적'}</small></div>
        </div>
        <div class="metric-card metric-success">
          <span class="metric-icon">${icon('crystal', '', 18)}</span>
          <div><span class="metric-label">이번 주 성과</span><strong>${state.userState.defeatedBugs}</strong><small>해결한 이슈</small></div>
        </div>
      </div>
    </section>
  `;
}
