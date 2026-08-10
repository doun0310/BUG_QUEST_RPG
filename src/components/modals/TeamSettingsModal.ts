import { loadTeamSettings, saveTeamSettings, toTeamMemberCapacity } from '../../services/teamSettingsService';
import type { TeamMemberInput, TeamSettings } from '../../types';

const ROLE_OPTIONS: TeamMemberInput['role'][] = [
  '전사 (Frontend)',
  '마법사 (Backend)',
  '성기사 (QA)',
  '궁수 (DevOps)',
  '힐러 (PM)',
];

const ROLE_EMOJI: Record<string, string> = {
  '전사 (Frontend)': '🎨',
  '마법사 (Backend)': '💻',
  '성기사 (QA)': '🛡️',
  '궁수 (DevOps)': '🏹',
  '힐러 (PM)': '💚',
};

function memberRow(m: TeamMemberInput, i: number): string {
  return `
    <div class="ts-member-row" data-idx="${i}" style="
      display:grid;
      grid-template-columns:auto 1fr auto 60px 70px auto;
      align-items:center;
      gap:0.55rem;
      background:var(--inner-box-bg);
      border:1px solid var(--panel-border);
      border-radius:12px;
      padding:0.6rem 0.85rem;
      transition:border-color 0.2s;
    ">
      <span style="font-size:1.25rem;">${ROLE_EMOJI[m.role] || '👤'}</span>
      <input type="text" class="form-input ts-member-name" data-idx="${i}"
        value="${m.name}" placeholder="이름"
        style="font-size:0.83rem;font-weight:700;min-width:0;" />
      <select class="form-select ts-member-role" data-idx="${i}" style="font-size:0.78rem;min-width:120px;">
        ${ROLE_OPTIONS.map(r => `<option value="${r}" ${m.role === r ? 'selected' : ''}>${ROLE_EMOJI[r]} ${r}</option>`).join('')}
      </select>
      <div style="display:flex;align-items:center;gap:0.25rem;">
        <input type="number" class="form-input ts-member-hours" data-idx="${i}"
          value="${m.workingHoursPerDay}" min="1" max="12"
          style="font-size:0.78rem;width:46px;" />
        <span style="font-size:0.7rem;color:var(--text-muted);">h</span>
      </div>
      <div style="display:flex;align-items:center;gap:0.25rem;">
        <input type="number" class="form-input ts-member-ratio" data-idx="${i}"
          value="${Math.round(m.deepWorkRatio * 100)}" min="40" max="90" step="5"
          style="font-size:0.78rem;width:46px;" />
        <span style="font-size:0.7rem;color:var(--text-muted);">%</span>
      </div>
      <button type="button" class="ts-remove-member" data-idx="${i}"
        style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.78rem;padding:0.15rem 0.3rem;border-radius:6px;white-space:nowrap;">
        ✕
      </button>
    </div>
  `;
}

export function renderTeamSettingsModal(editMembers: TeamMemberInput[], errorMsg: string = '', successMsg: string = ''): string {
  const cfg = loadTeamSettings();

  return `
    <div class="modal-backdrop" id="modal-backdrop" style="align-items:flex-start;padding:1.5rem 1rem;overflow-y:auto;">
      <div class="modal-card" style="max-width:680px;width:100%;padding:2rem;position:relative;">

        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1.5rem;">
          <div>
            <h2 style="font-size:1.1rem;font-weight:900;margin:0 0 0.2rem;color:var(--text-main);">
              ⚙️ 팀 설정
            </h2>
            <p style="font-size:0.75rem;color:var(--text-sub);margin:0;">
              변경 사항은 저장 즉시 앱 전체에 반영됩니다.
            </p>
          </div>
          <button type="button" id="ts-close" style="background:none;border:1px solid var(--panel-border);color:var(--text-sub);border-radius:8px;padding:0.3rem 0.7rem;cursor:pointer;font-size:0.82rem;">✕ 닫기</button>
        </div>

        <!-- Alert Messages -->
        ${successMsg ? `<div style="background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.3);color:#34d399;font-size:0.8rem;padding:0.65rem 0.9rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">✅ ${successMsg}</div>` : ''}
        ${errorMsg ? `<div style="background:rgba(248,113,113,0.1);border:1px solid rgba(248,113,113,0.3);color:#f87171;font-size:0.8rem;padding:0.65rem 0.9rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">⚠️ ${errorMsg}</div>` : ''}

        <!-- Section 1: 프로젝트 기본 정보 -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--primary-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;display:flex;align-items:center;gap:0.4rem;">
            🏰 프로젝트 기본 정보
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;margin-bottom:0.65rem;">
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">팀 이름</label>
              <input type="text" class="form-input" id="ts-team-name"
                placeholder="예: 개발 1팀" value="${cfg.teamName || ''}"
                style="font-size:0.85rem;" />
            </div>
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">프로젝트 이름</label>
              <input type="text" class="form-input" id="ts-project-name"
                placeholder="예: CMS 고도화 v2.0" value="${cfg.projectName || ''}"
                style="font-size:0.85rem;" />
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">프로젝트 시작일</label>
              <input type="date" class="form-input" id="ts-start-date"
                value="${cfg.projectStartDate || new Date().toISOString().split('T')[0]}"
                style="font-size:0.85rem;" />
            </div>
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">전체 기간</label>
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <input type="number" class="form-input" id="ts-project-days"
                  value="${cfg.projectDurationDays || 60}" min="7" max="365"
                  style="font-size:0.85rem;" />
                <span style="font-size:0.78rem;color:var(--text-sub);white-space:nowrap;">일</span>
              </div>
            </div>
          </div>
        </div>

        <div style="height:1px;background:var(--panel-border);margin-bottom:1.5rem;"></div>

        <!-- Section 2: 팀원 관리 -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--primary-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
            👥 팀원 관리
          </div>

          <!-- Column Headers -->
          ${editMembers.length > 0 ? `
            <div style="display:grid;grid-template-columns:auto 1fr auto 60px 70px auto;gap:0.55rem;padding:0 0.85rem;margin-bottom:0.4rem;">
              <div></div>
              <div style="font-size:0.65rem;color:var(--text-muted);">이름</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">직업 클래스</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">근무h</div>
              <div style="font-size:0.65rem;color:var(--text-muted);">집중%</div>
              <div></div>
            </div>
          ` : ''}

          <!-- Member List -->
          <div id="ts-members-list" style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:0.85rem;max-height:280px;overflow-y:auto;padding-right:0.15rem;">
            ${editMembers.length === 0
              ? `<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.82rem;background:var(--inner-box-bg);border-radius:12px;border:1px dashed var(--panel-border);">
                  등록된 팀원이 없습니다. 아래에서 추가해주세요.
                </div>`
              : editMembers.map((m, i) => memberRow(m, i)).join('')
            }
          </div>

          <!-- Add Member Row -->
          <div style="background:var(--inner-box-bg);border:1px solid var(--primary-border);border-radius:14px;padding:0.85rem;">
            <div style="font-size:0.7rem;font-weight:700;color:var(--primary-light);margin-bottom:0.55rem;">+ 팀원 추가</div>
            <div style="display:grid;grid-template-columns:1fr 1fr 60px 65px auto;gap:0.5rem;align-items:end;">
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.67rem;color:var(--text-sub);">이름</label>
                <input type="text" class="form-input" id="ts-new-name" placeholder="홍길동" style="font-size:0.82rem;" />
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.67rem;color:var(--text-sub);">직업</label>
                <select class="form-select" id="ts-new-role" style="font-size:0.82rem;">
                  ${ROLE_OPTIONS.map(r => `<option value="${r}">${ROLE_EMOJI[r]} ${r}</option>`).join('')}
                </select>
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.67rem;color:var(--text-sub);">근무h</label>
                <input type="number" class="form-input" id="ts-new-hours" value="8" min="1" max="12" style="font-size:0.82rem;" />
              </div>
              <div class="form-group" style="margin:0;">
                <label style="font-size:0.67rem;color:var(--text-sub);">집중%</label>
                <input type="number" class="form-input" id="ts-new-ratio" value="70" min="40" max="90" step="5" style="font-size:0.82rem;" />
              </div>
              <button type="button" id="ts-add-member"
                class="action-btn"
                style="padding:0.45rem 0.75rem;font-size:0.8rem;font-weight:700;white-space:nowrap;">
                + 추가
              </button>
            </div>
          </div>
        </div>

        <div style="height:1px;background:var(--panel-border);margin-bottom:1.5rem;"></div>

        <!-- Section 3: 스프린트 & 예산 -->
        <div style="margin-bottom:1.5rem;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--primary-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
            📊 스프린트 & 예산
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">스프린트 기간</label>
              <div style="display:flex;gap:0.4rem;flex-wrap:wrap;margin-bottom:0.4rem;">
                ${[5, 7, 10, 14].map(d => `
                  <button type="button" class="ts-sprint-btn" data-days="${d}"
                    style="padding:0.3rem 0.7rem;border-radius:99px;font-size:0.78rem;font-weight:700;cursor:pointer;
                    border:1px solid ${(cfg.sprintDays || 10) === d ? 'var(--primary)' : 'var(--panel-border)'};
                    background:${(cfg.sprintDays || 10) === d ? 'var(--primary-bg)' : 'var(--inner-box-bg)'};
                    color:${(cfg.sprintDays || 10) === d ? 'var(--primary-light)' : 'var(--text-sub)'};">
                    ${d}일
                  </button>
                `).join('')}
              </div>
              <div style="display:flex;align-items:center;gap:0.4rem;">
                <input type="number" class="form-input" id="ts-sprint-days"
                  value="${cfg.sprintDays || 10}" min="1" max="30"
                  style="width:70px;font-size:0.85rem;" />
                <span style="font-size:0.78rem;color:var(--text-sub);">일</span>
              </div>
            </div>
            <div class="form-group">
              <label style="font-size:0.72rem;color:var(--text-sub);">프로젝트 총 예산</label>
              <div style="display:flex;align-items:center;gap:0.4rem;margin-bottom:0.3rem;">
                <input type="number" class="form-input" id="ts-total-budget"
                  value="${cfg.totalBudget || 50000000}" min="0" step="1000000"
                  style="font-size:0.85rem;" />
                <span style="font-size:0.78rem;color:var(--text-sub);">원</span>
              </div>
              <div id="ts-budget-preview" style="font-size:0.72rem;color:var(--primary-light);">
                = ${(cfg.totalBudget || 50000000).toLocaleString('ko-KR')}원
              </div>
            </div>
          </div>
        </div>

        <div style="height:1px;background:var(--panel-border);margin-bottom:1.5rem;"></div>

        <!-- Section 4: 길드 -->
        <div style="margin-bottom:1.75rem;">
          <div style="font-size:0.72rem;font-weight:800;color:var(--primary-light);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:0.75rem;">
            ⚔️ 길드 이름
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.65rem;">
            <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.18);border-radius:12px;padding:0.75rem;">
              <div style="font-size:0.68rem;font-weight:700;color:var(--primary-light);margin-bottom:0.4rem;">⚔️ 공격형 길드</div>
              <input type="text" class="form-input" id="ts-guild-a"
                placeholder="프론트엔드 길드" value="${cfg.guildAName || ''}"
                style="font-size:0.85rem;" />
            </div>
            <div style="background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.18);border-radius:12px;padding:0.75rem;">
              <div style="font-size:0.68rem;font-weight:700;color:#c084fc;margin-bottom:0.4rem;">🧙 수비형 길드</div>
              <input type="text" class="form-input" id="ts-guild-b"
                placeholder="백엔드 길드" value="${cfg.guildBName || ''}"
                style="font-size:0.85rem;" />
            </div>
          </div>
        </div>

        <!-- Footer Buttons -->
        <div style="display:flex;justify-content:space-between;align-items:center;gap:0.75rem;border-top:1px solid var(--panel-border);padding-top:1.25rem;">
          <div style="font-size:0.72rem;color:var(--text-muted);">
            마지막 설정: ${cfg.lastUpdatedAt ? new Date(cfg.lastUpdatedAt).toLocaleString('ko-KR', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' }) : '—'}
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button type="button" id="ts-close-footer"
              style="background:none;border:1px solid var(--panel-border);color:var(--text-sub);border-radius:10px;padding:0.5rem 1rem;cursor:pointer;font-size:0.83rem;">
              취소
            </button>
            <button type="button" id="ts-save"
              class="action-btn"
              style="padding:0.5rem 1.5rem;font-size:0.88rem;font-weight:800;box-shadow:0 4px 14px rgba(99,102,241,0.3);">
              💾 저장하기
            </button>
          </div>
        </div>

      </div>
    </div>
  `;
}
