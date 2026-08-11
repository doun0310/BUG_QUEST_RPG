import type { AppState } from '../store';
import { calculateCapacity, mockDailySummary } from '../mockData';
import { icon } from '../icons';
import { getAssignedWorkloadMembers } from '../services/workloadService';

export function renderSidebar(state: AppState): string {
  const { userState, teamState, vacationsState } = state;
  const assignedMembers = getAssignedWorkloadMembers(teamState, state.monstersState);
  const capacity = calculateCapacity(assignedMembers);
  const loadPct = capacity.availableHours > 0 ? Math.min(100, Math.round((capacity.assignedHours / capacity.availableHours) * 100)) : 0;

  return `
    <aside class="workspace-sidebar">
      <section class="card profile-summary">
        <div class="profile-summary-head">
          <div class="profile-avatar">${icon('mark', '', 19)}</div>
          <div><strong>${userState.name}</strong><span>${userState.heroClass} · Lv.${userState.level}</span></div>
          <span class="badge badge-success">온라인</span>
        </div>
        <div class="sidebar-actions">
          <button class="action-btn action-btn-secondary" id="btn-sidebar-edit-profile">${icon('users', '', 13)} 프로필</button>
          <button class="action-btn action-btn-secondary" id="btn-sidebar-switch-acc">${icon('users', '', 13)} 전환</button>
          <button class="action-btn action-btn-secondary action-btn-quiet-danger" id="btn-sidebar-logout">${icon('close', '', 13)} 로그아웃</button>
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h3 class="card-title">${icon('users', 'color:var(--primary-light)', 15)} 팀 워크로드</h3><span class="badge ${capacity.isOverloaded ? 'badge-danger' : 'badge-success'}">${capacity.isOverloaded ? '주의 필요' : '안정적'}</span></div>
        ${capacity.isOverloaded ? `<div class="inline-alert inline-alert-danger">${icon('warning', '', 13)} 리소스 재배분이 필요합니다.</div>` : ''}
        <div class="capacity-summary"><div><span>이번 스프린트</span><strong>${capacity.assignedHours} / ${capacity.availableHours}h</strong></div><strong class="capacity-percent">${loadPct}%</strong></div>
        <div class="progress-track"><div class="progress-value ${capacity.isOverloaded ? 'is-danger' : ''}" style="width:${loadPct}%"></div></div>
        <div class="member-load-list">
          ${capacity.members.length ? capacity.members.map(m => {
            const percent = Math.min(100, Math.round((m.assignedHours / m.availableHours) * 100));
            return `<div class="member-load"><div><span>${m.userName}</span><small>${m.role}</small></div><strong class="${m.isOverloaded ? 'text-danger' : ''}">${m.assignedHours}/${m.availableHours}h</strong><div class="member-progress"><i class="${m.isOverloaded ? 'is-danger' : ''}" style="width:${percent}%"></i></div></div>`;
          }).join('') : `<p style="margin:0; padding:.45rem 0; color:var(--text-sub); font-size:.75rem;">현재 업무가 배정된 팀원이 없습니다.</p>`}
        </div>
      </section>

      <section class="card">
        <div class="card-header"><h3 class="card-title">${icon('lightning', 'color:var(--primary-light)', 15)} 빠른 작업</h3></div>
        <div class="quick-action-list">
          <button class="action-btn" id="btn-open-vacation-modal">${icon('leaf', '', 14)} 휴가 / 외근 신청</button>
          <button class="action-btn action-btn-secondary" id="btn-open-cms-details">${icon('chart', '', 14)} 예산 분석</button>
          <button class="action-btn action-btn-secondary" id="btn-open-webhook">${icon('link', '', 14)} 연동 관리</button>
          <button class="action-btn action-btn-secondary" id="btn-leaderboard">${icon('trophy', '', 14)} 팀 리더보드</button>
        </div>
      </section>

      <section class="card compact-card">
        <div class="card-header"><h3 class="card-title">${icon('clock', 'color:var(--primary-light)', 15)} 부재 일정</h3></div>
        <div class="schedule-list">${vacationsState.map(v => `<div><span>${icon('leaf', 'color:var(--success)', 12)} <strong>${v.userName}</strong> <small>${v.type}</small></span><time>${v.startDate.substring(5)}</time></div>`).join('')}</div>
      </section>

      <section class="card compact-card">
        <div class="card-header"><h3 class="card-title">${icon('checklist', 'color:var(--primary-light)', 15)} 오늘의 요약</h3><button class="icon-button" id="btn-generate-ai" aria-label="요약 갱신">${icon('robot', '', 14)}</button></div>
        <div class="daily-summary"><div class="summary-done"><span>완료</span><p>${mockDailySummary.doneToday[0]}</p></div><div class="summary-next"><span>다음</span><p>${mockDailySummary.planTomorrow[0]}</p></div></div>
      </section>
    </aside>`;
}
