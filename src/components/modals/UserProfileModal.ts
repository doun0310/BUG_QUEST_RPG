import { getCurrentAccount } from '../../services/authService';
import type { UserProfile } from '../../types';

const HERO_CLASSES: UserProfile['heroClass'][] = [
  '전사 (Frontend)',
  '마법사 (Backend)',
  '성기사 (QA)',
];

const AVATAR_BG_PRESETS = [
  { name: '네온 인디고', bg: 'linear-gradient(135deg, #6366f1, #38bdf8)' },
  { name: '사이버 펄프', bg: 'linear-gradient(135deg, #a855f7, #ec4899)' },
  { name: '에메랄드 매트릭스', bg: 'linear-gradient(135deg, #10b981, #06b6d4)' },
  { name: '선셋 파이어', bg: 'linear-gradient(135deg, #f97316, #e11d48)' },
  { name: '다크 옵스', bg: 'linear-gradient(135deg, #475569, #0f172a)' },
];

const AVATAR_ICON_PRESETS = ['⚡', '💻', '🛡️', '👾', '🚀', '🗡️', '🧙‍♂️', '🎨', '🔥', '👑'];

export function renderUserProfileModal(errorMsg: string = '', successMsg: string = ''): string {
  const account = getCurrentAccount();
  if (!account) return '';

  const currentBg = account.avatar?.bgColor || AVATAR_BG_PRESETS[0].bg;
  const currentSymbol = account.avatar?.iconSymbol || '⚡';

  return `
    <div class="modal-backdrop" id="modal-backdrop" style="align-items: center; padding: 1.5rem 1rem;">
      <div class="modal-card" style="max-width: 520px; width: 100%; padding: 2rem; position: relative;">

        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 900; margin: 0 0 0.25rem; color: var(--text-main); display: flex; align-items: center; gap: 0.4rem;">
              👤 계정 프로필 수정
            </h2>
            <p style="font-size: 0.76rem; color: var(--text-sub); margin: 0;">
              계정 닉네임, 보안 PIN, 아바타 및 직업 클래스를 수정합니다.
            </p>
          </div>
          <button type="button" id="up-close" style="background: none; border: 1px solid var(--panel-border); color: var(--text-sub); border-radius: 8px; padding: 0.3rem 0.7rem; cursor: pointer; font-size: 0.82rem;">✕ 닫기</button>
        </div>

        <!-- Alert Messages -->
        ${successMsg ? `<div style="background: rgba(16,185,129,0.12); border: 1px solid rgba(16,185,129,0.3); color: #34d399; font-size: 0.8rem; padding: 0.65rem 0.9rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">✅ ${successMsg}</div>` : ''}
        ${errorMsg ? `<div style="background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.3); color: #f87171; font-size: 0.8rem; padding: 0.65rem 0.9rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">⚠️ ${errorMsg}</div>` : ''}

        <form id="form-update-profile">
          <!-- Account ID (Non-editable) -->
          <div style="background: var(--inner-box-bg); border: 1px solid var(--panel-border); padding: 0.75rem 1rem; border-radius: 12px; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">계정 아이디 (변경 불가)</div>
              <div style="font-size: 0.9rem; font-weight: 800; color: var(--sky); margin-top: 0.1rem;">@${account.username}</div>
            </div>
            <div style="font-size: 0.7rem; color: var(--text-sub); background: rgba(255,255,255,0.06); padding: 0.25rem 0.6rem; border-radius: 6px;">
              가입일: ${account.createdAt ? account.createdAt.split('T')[0] : '—'}
            </div>
          </div>

          <!-- Avatar Preset Selection -->
          <div style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub); font-weight: 700; display: block; margin-bottom: 0.5rem;">
              🎨 아바타 커스텀
            </label>
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.75rem;">
              <!-- Live Preview Avatar -->
              <div id="up-avatar-preview" style="width: 56px; height: 56px; border-radius: 16px; background: ${currentBg}; display: flex; align-items: center; justify-content: center; font-size: 1.7rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); border: 2px solid rgba(255,255,255,0.2); flex-shrink: 0;">
                ${currentSymbol}
              </div>
              <div style="flex: 1;">
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.35rem;">테마 색상</div>
                <div style="display: flex; gap: 0.4rem;">
                  ${AVATAR_BG_PRESETS.map((p) => `
                    <button type="button" class="up-bg-preset-btn" data-bg="${p.bg}"
                      style="width: 24px; height: 24px; border-radius: 50%; background: ${p.bg}; border: 2px solid ${currentBg === p.bg ? 'white' : 'transparent'}; cursor: pointer;"
                      title="${p.name}">
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Icon Symbols -->
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.35rem;">심볼 아이콘</div>
            <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
              ${AVATAR_ICON_PRESETS.map(symbol => `
                <button type="button" class="up-icon-preset-btn" data-symbol="${symbol}"
                  style="width: 32px; height: 32px; border-radius: 8px; background: ${currentSymbol === symbol ? 'var(--primary-bg)' : 'var(--inner-box-bg)'}; border: 1px solid ${currentSymbol === symbol ? 'var(--primary)' : 'var(--panel-border)'}; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                  ${symbol}
                </button>
              `).join('')}
            </div>

            <input type="hidden" id="up-avatar-bg" value="${currentBg}" />
            <input type="hidden" id="up-avatar-symbol" value="${currentSymbol}" />
          </div>

          <!-- Display Name -->
          <div class="form-group" style="margin-bottom: 1rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub); display: block; margin-bottom: 0.3rem;">표시 닉네임 <span style="color: var(--danger);">*</span></label>
            <input type="text" class="form-input" id="up-display-name" value="${account.displayName}" placeholder="전장에 표시될 이름" required style="font-size: 0.88rem;" />
          </div>

          <!-- Hero Class -->
          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub); display: block; margin-bottom: 0.3rem;">직업 클래스</label>
            <select class="form-select" id="up-hero-class" style="font-size: 0.88rem;">
              ${HERO_CLASSES.map(cls => `
                <option value="${cls}" ${account.heroClass === cls ? 'selected' : ''}>${cls}</option>
              `).join('')}
            </select>
          </div>

          <div style="height: 1px; background: var(--panel-border); margin: 1.25rem 0;"></div>

          <!-- PIN Change Section -->
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: var(--primary-light); margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.3rem;">
              🔒 보안 PIN 및 본인 인증
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <div class="form-group">
                <label style="font-size: 0.72rem; color: var(--text-sub); display: block; margin-bottom: 0.3rem;">현재 PIN (확인용) <span style="color: var(--danger);">*</span></label>
                <input type="password" class="form-input" id="up-current-pin" maxlength="4" placeholder="기존 4자리 PIN" required style="font-size: 0.88rem; letter-spacing: 0.2em;" />
              </div>
              <div class="form-group">
                <label style="font-size: 0.72rem; color: var(--text-sub); display: block; margin-bottom: 0.3rem;">새 PIN (변경 시에만)</label>
                <input type="password" class="form-input" id="up-new-pin" maxlength="4" placeholder="새 4자리 PIN (선택)" style="font-size: 0.88rem; letter-spacing: 0.2em;" />
              </div>
            </div>
          </div>

          <!-- Submit Buttons -->
          <div style="display: flex; justify-content: flex-end; gap: 0.6rem; border-top: 1px solid var(--panel-border); padding-top: 1.25rem;">
            <button type="button" id="up-close-footer" style="background: none; border: 1px solid var(--panel-border); color: var(--text-sub); border-radius: 10px; padding: 0.55rem 1.1rem; cursor: pointer; font-size: 0.83rem;">
              취소
            </button>
            <button type="submit" class="action-btn" style="padding: 0.55rem 1.6rem; font-size: 0.88rem; font-weight: 800; box-shadow: 0 4px 14px rgba(99,102,241,0.35);">
              💾 프로필 저장
            </button>
          </div>
        </form>

      </div>
    </div>
  `;
}
