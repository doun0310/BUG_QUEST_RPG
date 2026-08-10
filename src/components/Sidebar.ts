import type { AppState } from '../store';
import { calculateCapacity, mockDailySummary } from '../mockData';

export function renderSidebar(state: AppState): string {
  const { teamState, vacationsState } = state;
  const capacity = calculateCapacity(teamState);

  return `
    <aside style="display: flex; flex-direction: column; gap: 0.85rem;">
      <!-- Sprint Capacity Widget -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 0.4rem;">
          <h3 class="card-title" style="font-size: 0.85rem;">팀 스프린트 Workload Capacity</h3>
          <span class="badge ${capacity.isOverloaded ? 'badge-danger' : 'badge-success'}">
            ${capacity.isOverloaded ? '과부하 경고' : '안정 상태'}
          </span>
        </div>
        
        <div style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 0.5rem;">
          가동 집중시간: <strong>${capacity.assignedHours} / ${capacity.availableHours}h</strong>
        </div>

        <div class="hp-bar-outer" style="margin-bottom: 0.6rem;">
          <div style="width: ${Math.min(100, (capacity.assignedHours / capacity.availableHours) * 100)}%; height: 100%; background: ${capacity.isOverloaded ? 'var(--danger)' : 'var(--primary)'}; border-radius: 3px;"></div>
        </div>

        <div style="border-top: 1px solid var(--panel-border); padding-top: 0.5rem; display: flex; flex-direction: column; gap: 0.35rem;">
          ${capacity.members.map(m => `
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem;">
              <span>${m.userName} (${m.role})</span>
              <span style="color: ${m.isOverloaded ? 'var(--danger)' : 'var(--text-main)'}; font-weight: ${m.isOverloaded ? '700' : 'normal'};">
                ${m.assignedHours}/${m.availableHours}h
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Quick Action Panel -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 0.45rem;">
          <h3 class="card-title" style="font-size: 0.85rem;">CMS 빠른 리소스 제어</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.35rem;">
          <button class="action-btn" id="btn-open-vacation-modal" style="width: 100%; justify-content: center; font-size: 0.75rem;">
            + 연차 / 외근 신청 (HP 회복)
          </button>
          <button class="action-btn action-btn-secondary" id="btn-open-cms-details" style="width: 100%; justify-content: center; font-size: 0.75rem;">
            📊 프로젝트 예산 소진 차트
          </button>
        </div>
      </div>

      <!-- Vacation List -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 0.4rem;">
          <h3 class="card-title" style="font-size: 0.85rem;">최근 휴가/외근 현황</h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.3rem;">
          ${vacationsState.map(v => `
            <div style="font-size: 0.75rem; display: flex; justify-content: space-between; border-bottom: 1px solid var(--panel-border); padding-bottom: 0.2rem;">
              <span><strong>${v.userName}</strong> (${v.type})</span>
              <span style="color: var(--text-sub);">${v.startDate.substring(5)}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Daily Dev Summary -->
      <div class="card">
        <div class="card-header" style="margin-bottom: 0.4rem;">
          <h3 class="card-title" style="font-size: 0.85rem;">오늘의 개발 요약</h3>
          <button class="action-btn" id="btn-generate-ai" style="padding: 0.2rem 0.45rem; font-size: 0.7rem;">갱신</button>
        </div>
        <div style="font-size: 0.75rem; color: var(--text-sub);">
          <div style="margin-bottom: 0.30rem;">
            <strong style="color: var(--success);">완료:</strong>
            <div style="font-size: 0.72rem; color: var(--text-main); margin-top: 0.1rem;">${mockDailySummary.doneToday[0]}</div>
          </div>
          <div>
            <strong style="color: var(--primary);">예정:</strong>
            <div style="font-size: 0.72rem; color: var(--text-main); margin-top: 0.1rem;">${mockDailySummary.planTomorrow[0]}</div>
          </div>
        </div>
      </div>

    </aside>
  `;
}
