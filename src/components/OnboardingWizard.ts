import { loadTeamSettings } from '../services/teamSettingsService';
import type { TeamSettings, TeamMemberInput } from '../types';
import { icon, type IconName } from '../icons';


export type WizardStep = 1 | 2 | 3 | 4;

const STEP_LABELS = ['프로젝트 기본 설정', '팀원 등록', '스프린트 & 예산', '길드 & 완료'];

const ROLE_OPTIONS: TeamMemberInput['role'][] = [
  '전사 (Frontend)',
  '마법사 (Backend)',
  '성기사 (QA)',
  '궁수 (DevOps)',
  '힐러 (PM)',
];

const ROLE_ICON_MAP: Record<string, { icon: IconName; color: string }> = {
  '전사 (Frontend)': { icon: 'roleWarrior', color: 'var(--danger)' },
  '마법사 (Backend)': { icon: 'roleMage', color: 'var(--sky)' },
  '성기사 (QA)': { icon: 'rolePaladin', color: 'var(--warning)' },
  '궁수 (DevOps)': { icon: 'roleArcher', color: 'var(--primary-light)' },
  '힐러 (PM)': { icon: 'roleHealer', color: 'var(--success)' },
};

function getRoleSvg(roleName: string, size = 16): string {
  const cfg = ROLE_ICON_MAP[roleName] || { icon: 'users', color: 'var(--text-sub)' };
  return icon(cfg.icon, `color:${cfg.color}`, size);
}

function stepBar(currentStep: WizardStep): string {
  return `
    <div style="display: flex; align-items: center; gap: 0; margin-bottom: 2rem;">
      ${STEP_LABELS.map((label, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isDone = step < currentStep;
        const color = isDone ? 'var(--success)' : isActive ? 'var(--primary-light)' : 'var(--text-muted)';
        const bgColor = isDone ? 'var(--success)' : isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)';
        return `
          <div style="display: flex; flex-direction: column; align-items: center; flex: 1; position: relative;">
            ${step > 1 ? `<div style="position: absolute; top: 13px; left: -50%; width: 100%; height: 2px; background: ${isDone ? 'var(--success)' : 'rgba(255,255,255,0.08)'}; z-index: 0;"></div>` : ''}
            <div style="width: 28px; height: 28px; border-radius: 50%; background: ${bgColor}; border: 1px solid ${color}; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; color: ${isActive ? 'white' : color}; z-index: 1; position: relative;">
              ${isDone ? '✓' : step}
            </div>
            <span style="font-size: 0.65rem; margin-top: 0.3rem; color: ${isActive ? 'var(--text-main)' : 'var(--text-muted)'}; font-weight: ${isActive ? '700' : '400'}; text-align: center; line-height: 1.2;">${label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ─── Step 1: 프로젝트 기본 설정 ──────────────────────────────────────────────

function renderStep1(settings: TeamSettings, errorMsg: string): string {
  return `
    <div>
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
        🏰 프로젝트 기본 정보를 입력해주세요
      </h2>
      <p style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 1.5rem;">
        팀명과 프로젝트명을 설정합니다. 나중에 설정에서 언제든 변경할 수 있습니다.
      </p>

      ${errorMsg ? `<div style="background:var(--danger-light);border:1px solid var(--danger-border);color:var(--danger);font-size:0.78rem;padding:0.6rem 0.85rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">${icon('warning','color:var(--danger)',14)} ${errorMsg}</div>` : ''}

      <div class="form-group" style="margin-bottom: 0.9rem;">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">팀 이름 <span style="color:var(--danger);">*</span></label>
        <input type="text" class="form-input" id="wizard-team-name" placeholder="예: 개발 1팀, Blossom Squad" value="${settings.teamName}" style="font-size:0.88rem;" />
      </div>

      <div class="form-group" style="margin-bottom: 0.9rem;">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">프로젝트 이름 <span style="color:var(--danger);">*</span></label>
        <input type="text" class="form-input" id="wizard-project-name" placeholder="예: 데이터베이스 인프라 구축, 웹사이트 리뉴얼" value="${settings.projectName}" style="font-size:0.88rem;" />
      </div>

      <div class="form-group" style="margin-bottom: 0.9rem;">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">프로젝트 시작일</label>
        <input type="date" class="form-input" id="wizard-start-date" value="${settings.projectStartDate || new Date().toISOString().split('T')[0]}" style="font-size:0.88rem;" />
      </div>

      <div class="form-group">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">프로젝트 전체 기간</label>
        <div style="display:flex;align-items:center;gap:0.5rem;">
          <input type="number" class="form-input" id="wizard-project-days" value="${settings.projectDurationDays || 60}" min="7" max="365" style="width:90px;font-size:0.88rem;" />
          <span style="font-size:0.82rem;color:var(--text-sub);">일</span>
        </div>
      </div>
    </div>
  `;
}

// ─── Step 2: 팀원 등록 ───────────────────────────────────────────────────────

function renderStep2(members: TeamMemberInput[], errorMsg: string): string {
  return `
    <div>
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
        팀원을 등록해주세요
      </h2>
      <p style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 1.25rem;">
        실제 팀원 이름과 역할을 입력하세요. 워크로드 계산 및 리더보드에 반영됩니다.
      </p>

      ${errorMsg ? `<div style="background:var(--danger-light);border:1px solid var(--danger-border);color:var(--danger);font-size:0.78rem;padding:0.6rem 0.85rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">${icon('warning','color:var(--danger)',14)} ${errorMsg}</div>` : ''}

      <div id="wizard-members-list" style="display:flex;flex-direction:column;gap:0.6rem;margin-bottom:0.9rem;max-height:260px;overflow-y:auto;padding-right:0.2rem;">
        ${members.length === 0
          ? `<div style="text-align:center;padding:1.5rem;color:var(--text-muted);font-size:0.82rem;background:var(--inner-box-bg);border-radius:12px;border:1px dashed var(--panel-border);">
              아직 등록된 팀원이 없습니다.<br>아래에서 팀원을 추가해주세요.
            </div>`
          : members.map((m, i) => `
            <div style="background:var(--inner-box-bg);border:1px solid var(--panel-border);padding:0.7rem 0.85rem;border-radius:12px;display:flex;align-items:center;justify-content:space-between;gap:0.5rem;">
              <div style="display:flex;align-items:center;gap:0.55rem;">
                <span style="display:flex;align-items:center;">${getRoleSvg(m.role, 20)}</span>
                <div>
                  <div style="font-weight:700;font-size:0.85rem;color:var(--text-main);">${m.name}</div>
                  <div style="font-size:0.72rem;color:var(--text-sub);">${m.role} · ${m.workingHoursPerDay}h/일 (집중 ${Math.round(m.deepWorkRatio * 100)}%)</div>
                </div>
              </div>
              <button type="button" class="wiz-remove-member" data-idx="${i}" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:0.8rem;">✕</button>
            </div>
          `).join('')
        }
      </div>

      <div style="background:var(--inner-box-bg);border:1px solid var(--primary-border);border-radius:14px;padding:0.9rem;margin-bottom:0.5rem;">
        <div style="font-size:0.72rem;font-weight:700;color:var(--primary-light);margin-bottom:0.6rem;">+ 팀원 추가</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.5rem;">
          <div class="form-group">
            <label style="font-size:0.7rem;color:var(--text-sub);">이름</label>
            <input type="text" class="form-input" id="wiz-new-name" placeholder="예: 홍길동" style="font-size:0.83rem;" />
          </div>
          <div class="form-group">
            <label style="font-size:0.7rem;color:var(--text-sub);">직업 클래스</label>
            <select class="form-select" id="new-member-role" style="font-size:0.82rem;">
              ${ROLE_OPTIONS.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.5rem;margin-bottom:0.65rem;">
          <div class="form-group">
            <label style="font-size:0.7rem;color:var(--text-sub);">하루 근무시간</label>
            <div style="display:flex;align-items:center;gap:0.3rem;">
              <input type="number" class="form-input" id="new-member-hours" value="8" min="1" max="12" style="width:70px;font-size:0.82rem;" />
              <span style="font-size:0.75rem;color:var(--text-sub);">시간</span>
            </div>
          </div>
          <div class="form-group">
            <label style="font-size:0.7rem;color:var(--text-sub);">집중 업무 비율</label>
            <div style="display:flex;align-items:center;gap:0.3rem;">
              <input type="number" class="form-input" id="new-member-ratio" value="55" min="40" max="90" step="5" style="width:70px;font-size:0.82rem;" />
              <span style="font-size:0.75rem;color:var(--text-sub);">%</span>
            </div>
          </div>
        </div>
        <button type="button" id="btn-add-wizard-member" class="action-btn action-btn-secondary" style="width:100%;padding:0.4rem;font-size:0.8rem;font-weight:700;">
          + 팀원 추가
        </button>
      </div>
    </div>
  `;
}

// ─── Step 3: 스프린트 & 예산 ─────────────────────────────────────────────────

function renderStep3(settings: TeamSettings): string {
  return `
    <div>
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
        스프린트 & 예산을 설정해주세요
      </h2>
      <p style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 1.5rem;">
        팀 워크로드 계산 및 예산 소진율 차트에 반영됩니다.
      </p>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">스프린트 기간 (한 이터레이션)</label>
        <div style="display:flex;gap:0.5rem;flex-wrap:wrap;">
          ${[5, 7, 10, 14].map(d => `
            <button type="button" class="wizard-sprint-btn" data-days="${d}" style="padding:0.45rem 1rem;border-radius:99px;font-size:0.82rem;font-weight:700;cursor:pointer;border:1px solid ${(settings.sprintDays||10) === d ? 'var(--primary)' : 'var(--panel-border)'};background:${(settings.sprintDays||10) === d ? 'var(--primary-bg)' : 'var(--inner-box-bg)'};color:${(settings.sprintDays||10) === d ? 'var(--primary-light)' : 'var(--text-sub)'};">
              ${d}일
            </button>
          `).join('')}
          <div style="display:flex;align-items:center;gap:0.3rem;">
            <input type="number" class="form-input" id="wizard-sprint-custom" placeholder="직접 입력" min="1" max="30" style="width:90px;font-size:0.82rem;" />
            <span style="font-size:0.75rem;color:var(--text-sub);">일</span>
          </div>
        </div>
        <input type="hidden" id="wizard-sprint-days" value="${settings.sprintDays || 10}" />
      </div>

      <div class="form-group" style="margin-bottom: 1rem;">
        <label style="font-size:0.75rem;color:var(--text-sub);margin-bottom:0.3rem;display:block;">프로젝트 총 예산</label>
        <div style="display:flex;align-items:center;gap:0.4rem;">
          <input type="number" class="form-input" id="wizard-total-budget" value="${settings.totalBudget || 50000000}" min="0" step="1000000" style="font-size:0.88rem;" />
          <span style="font-size:0.82rem;color:var(--text-sub);">원</span>
        </div>
        <div id="wizard-budget-preview" style="font-size:0.72rem;color:var(--primary-light);margin-top:0.3rem;"></div>
      </div>

      <div style="background:var(--inner-box-bg);border:1px solid var(--panel-border);border-radius:12px;padding:0.85rem;">
        <div style="font-size:0.75rem;font-weight:700;color:var(--text-sub);margin-bottom:0.5rem;">⚡ 자동 계산 미리보기</div>
        <div id="wizard-capacity-preview" style="font-size:0.78rem;color:var(--text-main);line-height:1.7;">
          팀원 정보와 스프린트 기간을 기반으로 하여 예상 가용 시간이 자동 계산됩니다.
        </div>
      </div>
    </div>
  `;
}

// ─── Step 4: 길드 & 완료 ────────────────────────────────────────────────────

function renderStep4(settings: TeamSettings): string {
  return `
    <div>
      <h2 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-main);">
        길드 이름을 설정하고 시작하세요!
      </h2>
      <p style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 1.5rem;">
        팀을 두 개의 길드로 나누어 주간 경쟁을 진행합니다.
      </p>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;margin-bottom:1.5rem;">
        <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);border-radius:14px;padding:1rem;">
          <div style="font-size:0.7rem;font-weight:700;color:var(--primary-light);margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em;">공격형 길드</div>
          <input type="text" class="form-input" id="wizard-guild-a" placeholder="예: 프론트엔드 길드" value="${settings.guildAName}" style="font-size:0.82rem;" />
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.3rem;">주로 Frontend/기능 개발팀</div>
        </div>
        <div style="background:rgba(168,85,247,0.08);border:1px solid rgba(168,85,247,0.2);border-radius:14px;padding:1rem;">
          <div style="font-size:0.7rem;font-weight:700;color:#c084fc;margin-bottom:0.5rem;text-transform:uppercase;letter-spacing:0.05em;">수비형 길드</div>
          <input type="text" class="form-input" id="wizard-guild-b" placeholder="예: 백엔드 길드" value="${settings.guildBName}" style="font-size:0.82rem;" />
          <div style="font-size:0.68rem;color:var(--text-muted);margin-top:0.3rem;">주로 Backend/인프라팀</div>
        </div>
      </div>

      <div style="background:linear-gradient(135deg,rgba(15,23,42,0.9),rgba(30,41,59,0.8));border:1px solid var(--primary-border);border-radius:16px;padding:1.25rem;margin-bottom:1.5rem;">
        <div style="font-size:0.78rem;font-weight:700;color:var(--primary-light);margin-bottom:0.65rem;">설정 요약</div>
        <div id="wizard-final-summary" style="font-size:0.78rem;color:var(--text-sub);line-height:1.9;">
        </div>
      </div>
    </div>
  `;
}

// ─── Main Render ─────────────────────────────────────────────────────────────

export function renderOnboardingWizard(
  step: WizardStep,
  members: TeamMemberInput[],
  errorMsg: string = '',
  successMsg: string = ''
): string {
  const settings = loadTeamSettings();
  const settingsWithMembers = { ...settings, members };

  const stepContent =
    step === 1 ? renderStep1(settings, errorMsg) :
    step === 2 ? renderStep2(members, errorMsg) :
    step === 3 ? renderStep3(settingsWithMembers) :
    renderStep4(settingsWithMembers);

  const isFirst = step === 1;
  const isLast = step === 4;

  return `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg-gradient);padding:1.5rem;">
      <div style="width:100%;max-width:560px;">

        <!-- Header -->
        <div style="text-align:center;margin-bottom:1.5rem;">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;background:rgba(129,140,248,0.15);border:1px solid rgba(129,140,248,0.3);border-radius:16px;margin-bottom:0.6rem;box-shadow:0 8px 20px rgba(99,102,241,0.2);">
            ${icon('sword','color:var(--primary-light)',26)}
          </div>
          <h1 style="font-size:1.2rem;font-weight:900;letter-spacing:-0.02em;background:linear-gradient(135deg,#a5b4fc 0%,#38bdf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">
            BUG QUEST RPG — 팀 설정
          </h1>
          <p style="font-size:0.78rem;color:var(--text-sub);margin-top:0.2rem;">실제 팀 정보를 입력하면 모든 데이터가 실시간으로 반영됩니다</p>
        </div>

        <!-- Wizard Card -->
        <div style="background:var(--glass-bg);backdrop-filter:var(--glass-blur);border:1px solid var(--glass-border);border-radius:24px;padding:2rem;box-shadow:var(--glass-glow);color:var(--text-main);">

          ${stepBar(step)}

          ${successMsg ? `<div style="background:var(--success-light);border:1px solid var(--success-border);color:var(--success);font-size:0.78rem;padding:0.6rem 0.85rem;border-radius:10px;margin-bottom:1rem;display:flex;align-items:center;gap:0.4rem;">${icon('check','color:var(--success)',14)} ${successMsg}</div>` : ''}

          <div id="wizard-step-content">
            ${stepContent}
          </div>

          <!-- Navigation Buttons -->
          <div style="display:flex;gap:0.6rem;margin-top:1.75rem;${isFirst ? 'justify-content:flex-end' : 'justify-content:space-between'};">
            ${!isFirst ? `
              <button type="button" id="btn-wizard-back" class="action-btn action-btn-secondary" style="padding:0.6rem 1.25rem;font-size:0.85rem;font-weight:700;">
                ← 이전
              </button>
            ` : ''}
            ${!isLast ? `
              <button type="button" id="btn-wizard-next" class="action-btn" style="padding:0.6rem 1.5rem;font-size:0.85rem;font-weight:800;">
                다음 →
              </button>
            ` : `
              <button type="button" id="btn-wizard-complete" class="action-btn" style="padding:0.65rem 1.75rem;font-size:0.88rem;font-weight:800;box-shadow:0 4px 16px rgba(99,102,241,0.35);">
                전장으로 출격!
              </button>
            `}
          </div>

        </div>

        <!-- Skip -->
        <div style="text-align:center;margin-top:0.85rem;">
          <button type="button" id="btn-wizard-skip" style="background:none;border:none;color:var(--text-muted);font-size:0.75rem;cursor:pointer;text-decoration:underline;">
            지금은 건너뛰고 기본 데이터로 시작하기 (나중에 설정 가능)
          </button>
        </div>
      </div>
    </div>
  `;
}
