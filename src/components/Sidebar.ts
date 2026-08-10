import type { AppState } from '../store';
import { calculateCapacity, mockDailySummary } from '../mockData';
import { icon } from '../icons';

export function renderSidebar(state: AppState): string {
  const { userState, teamState, vacationsState } = state;
  const capacity = calculateCapacity(teamState);
  const loadPct = Math.min(100, (capacity.assignedHours / capacity.availableHours) * 100);

  return `
    <aside style="display: flex; flex-direction: column; gap: 1rem;">

      <!-- ─── Current User Account Card ─── -->
      <div class="card" style="border: 1px solid var(--primary-border); background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8));">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div style="width: 36px; height: 36px; border-radius: 10px; background: var(--primary-bg); border: 1px solid var(--primary-border); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;">
              👤
            </div>
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-main); line-height: 1.2;">
                ${userState.name}
              </div>
              <div style="font-size: 0.7rem; color: var(--primary-light); font-weight: 600;">
                ${userState.heroClass} · Lv.${userState.level}
              </div>
            </div>
          </div>
          <span class="badge badge-success" style="font-size: 0.65rem; padding: 0.15rem 0.45rem;">접속 중</span>
        </div>

        <div style="display: flex; gap: 0.3rem; pt: 0.4rem; border-top: 1px solid rgba(255,255,255,0.08);">
          <button class="action-btn action-btn-secondary" id="btn-sidebar-edit-profile" style="flex: 1; padding: 0.3rem; font-size: 0.72rem; justify-content: center; display: flex; align-items: center; gap: 0.25rem;">
            ${icon('users', 'color:var(--primary-light)', 12)} 프로필 수정
          </button>
          <button class="action-btn action-btn-secondary" id="btn-sidebar-switch-acc" style="padding: 0.3rem 0.5rem; font-size: 0.72rem; justify-content: center; display: flex; align-items: center; gap: 0.25rem;">
            ${icon('users', 'color:var(--sky)', 12)} 전환
          </button>
          <button class="action-btn action-btn-secondary" id="btn-sidebar-logout" style="padding: 0.3rem 0.5rem; font-size: 0.72rem; color: var(--danger); border-color: var(--danger-border); justify-content: center; display: flex; align-items: center; gap: 0.25rem;">
            ${icon('warning', 'color:var(--danger)', 12)} 로그아웃
          </button>
        </div>
      </div>

      <!-- ─── Sprint Capacity ─── -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.4rem; background: linear-gradient(135deg, var(--primary-light), var(--sky)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
            ${icon('users', 'color:var(--primary-light)', 15)} 팀 워크로드
          </h3>
          <span class="badge ${capacity.isOverloaded ? 'badge-danger' : 'badge-success'}" style="border-radius: 99px; display: inline-flex; align-items: center; gap: 0.3rem;">
            ${capacity.isOverloaded
              ? icon('warning', 'color:var(--danger)', 11) + ' 과부하'
              : icon('check', 'color:var(--success)', 11) + ' 안정'}
          </span>
        </div>

        ${capacity.isOverloaded ? `
          <div style="background: var(--danger-light); border: 1px solid var(--danger-border); border-radius: 8px; padding: 0.45rem 0.65rem; font-size: 0.73rem; color: var(--danger); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('lightning', 'color:var(--danger)', 13)} <span>팀 용량 초과 — 리소스 재배분 필요</span>
          </div>
        ` : ''}

        <div style="margin-bottom: 0.75rem;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); margin-bottom: 0.4rem; align-items: center;">
            <span style="display: flex; align-items: center; gap: 0.25rem;">${icon('clock', '', 11)} 집중시간 배분</span>
            <span style="color: ${capacity.isOverloaded ? 'var(--danger)' : 'var(--text-main)'}; font-weight: 600;">
              ${capacity.assignedHours} / ${capacity.availableHours}h
            </span>
          </div>
          <div class="hp-bar-outer">
            <div style="width: ${loadPct}%; height: 100%; background: ${capacity.isOverloaded
              ? 'linear-gradient(90deg, var(--danger), #fb923c)'
              : 'linear-gradient(90deg, var(--primary), var(--sky))'}; border-radius: 99px; transition: width 0.4s ease;"></div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.45rem; border-top: 1px solid var(--panel-border); padding-top: 0.65rem;">
          ${capacity.members.map(m => {
            const mPct = Math.min(100, (m.assignedHours / m.availableHours) * 100);
            return `
            <div>
              <div style="display: flex; justify-content: space-between; font-size: 0.72rem; margin-bottom: 0.2rem; align-items: center;">
                <span style="display: flex; align-items: center; gap: 0.3rem; color: var(--text-sub);">
                  ${icon('target', 'color:var(--text-muted)', 11)} ${m.userName}
                  <span style="color: var(--text-muted);">(${m.role})</span>
                </span>
                <span style="color: ${m.isOverloaded ? 'var(--danger)' : 'var(--text-main)'}; font-weight: ${m.isOverloaded ? '700' : '500'};">
                  ${m.assignedHours}/${m.availableHours}h
                </span>
              </div>
              <div style="width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden;">
                <div style="width: ${mPct}%; height: 100%; background: ${m.isOverloaded ? 'var(--danger)' : 'var(--primary)'}; border-radius: 99px; opacity: 0.7;"></div>
              </div>
            </div>
          `;}).join('')}
        </div>
      </div>

      <!-- ─── Quick Actions ─── -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.4rem;">
            ${icon('target', 'color:var(--primary-light)', 15)} 빠른 리소스 제어
          </h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.5rem;">
          <button class="action-btn" id="btn-open-vacation-modal"
            style="width: 100%; justify-content: center; display: flex; align-items: center; gap: 0.45rem;">
            ${icon('leaf', '', 14)} 연차 / 외근 신청 (HP 회복)
          </button>
          <button class="action-btn action-btn-secondary" id="btn-open-cms-details"
            style="width: 100%; justify-content: center; display: flex; align-items: center; gap: 0.45rem;">
            ${icon('chart', '', 14)} 예산 소진 차트
          </button>
          <button class="action-btn action-btn-secondary" id="btn-open-webhook"
            style="width: 100%; justify-content: center; display: flex; align-items: center; gap: 0.45rem;">
            ${icon('link', '', 14)} Webhook 관리
          </button>
          <button class="action-btn action-btn-secondary" id="btn-leaderboard"
            style="width: 100%; justify-content: center; display: flex; align-items: center; gap: 0.45rem;">
            ${icon('trophy', '', 14)} 주간 리더보드
          </button>
        </div>
      </div>

      <!-- ─── Vacation Status ─── -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.4rem;">
            ${icon('clock', 'color:var(--primary-light)', 15)} 휴가 / 외근 현황
          </h3>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.1rem;">
          ${vacationsState.map((v, i) => `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0;
              ${i < vacationsState.length - 1 ? 'border-bottom: 1px solid rgba(71,85,105,0.2);' : ''}">
              <div style="display: flex; align-items: center; gap: 0.35rem;">
                ${icon('leaf', 'color:var(--success)', 12)}
                <span style="font-size: 0.76rem; font-weight: 600; color: var(--text-main);">${v.userName}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${v.type}</span>
              </div>
              <span style="font-size: 0.7rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.2rem;">
                ${icon('clock', '', 11)} ${v.startDate.substring(5)}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- ─── Daily Dev Summary ─── -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title" style="display: flex; align-items: center; gap: 0.4rem;">
            ${icon('checklist', 'color:var(--primary-light)', 15)} 오늘의 개발 요약
          </h3>
          <button class="action-btn" id="btn-generate-ai"
            style="padding: 0.22rem 0.55rem; font-size: 0.68rem; border-radius: 6px; display: flex; align-items: center; gap: 0.3rem;">
            ${icon('robot', '', 12)} 갱신
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 0.65rem;">
          <div style="background: var(--inner-box-bg); border-left: 2px solid var(--success); border-radius: 0 8px 8px 0; padding: 0.55rem 0.7rem;">
            <p style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--success); margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
              ${icon('check', 'color:var(--success)', 11)} 완료
            </p>
            <p style="font-size: 0.73rem; color: var(--text-main);">${mockDailySummary.doneToday[0]}</p>
          </div>
          <div style="background: var(--inner-box-bg); border-left: 2px solid var(--primary); border-radius: 0 8px 8px 0; padding: 0.55rem 0.7rem;">
            <p style="font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--primary-light); margin-bottom: 0.2rem; display: flex; align-items: center; gap: 0.3rem;">
              ${icon('flag', 'color:var(--primary-light)', 11)} 예정
            </p>
            <p style="font-size: 0.73rem; color: var(--text-main);">${mockDailySummary.planTomorrow[0]}</p>
          </div>
        </div>
      </div>

    </aside>
  `;
}
