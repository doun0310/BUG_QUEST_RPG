import { getAllAccounts, getCurrentAccount, isSessionLocked, type Account } from '../services/authService';
import { icon } from '../icons';

export function renderLoginScreen(errorMsg: string = '', successMsg: string = ''): string {
  const accounts = getAllAccounts();
  const currentAccount = getCurrentAccount();
  const locked = isSessionLocked();

  // 1. Session Lock Mode (화면 잠금 모드)
  if (locked && currentAccount) {
    const avatar = currentAccount.avatar || { bgColor: 'linear-gradient(135deg, #6366f1, #38bdf8)', iconSymbol: '🛡️' };
    return `
      <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-gradient); padding: 1.5rem;">
        <div style="width: 100%; max-width: 400px; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.25rem 2rem; box-shadow: var(--glass-glow); text-align: center; color: var(--text-main);">
          
          <div style="width: 72px; height: 72px; border-radius: 50%; background: ${avatar.bgColor}; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem auto; box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); border: 2px solid rgba(255, 255, 255, 0.2);">
            ${avatar.iconSymbol}
          </div>

          <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 0.2rem;">${currentAccount.displayName}</h2>
          <p style="font-size: 0.78rem; color: var(--text-sub); margin-bottom: 1.5rem;">
            세션이 잠겨 있습니다. 보안 PIN 4자리를 입력하여 잠금을 해제하세요.
          </p>

          ${errorMsg ? `
            <div style="background: var(--danger-light); border: 1px solid var(--danger-border); color: var(--danger); font-size: 0.78rem; padding: 0.6rem 0.85rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem; justify-content: center;">
              ${icon('warning', 'color:var(--danger)', 14)} ${errorMsg}
            </div>
          ` : ''}

          <form id="form-unlock-session" style="margin-bottom: 1rem;">
            <div style="margin-bottom: 1.25rem;">
              <input type="password" id="unlock-pin" maxlength="4" pattern="[0-9]{4}" placeholder="••••" required autofocus style="width: 160px; height: 48px; font-size: 1.4rem; letter-spacing: 0.5em; text-align: center; background: var(--input-bg); border: 1px solid var(--primary-border); border-radius: 12px; color: var(--text-main); font-weight: 700; outline: none;" />
            </div>
            <button type="submit" class="action-btn" style="width: 100%; padding: 0.7rem; font-size: 0.88rem; font-weight: 700;">
              🔓 세션 잠금 해제
            </button>
          </form>

          <button type="button" id="btn-lock-switch-account" style="background: none; border: none; color: var(--text-muted); font-size: 0.78rem; cursor: pointer; text-decoration: underline;">
            다른 계정으로 로그인
          </button>
        </div>
      </div>
    `;
  }

  // 2. Normal Login & Account Selection Mode
  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-gradient); padding: 1.5rem;">
      <div style="width: 100%; max-width: 480px; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 24px; padding: 2.25rem 2rem; box-shadow: var(--glass-glow); color: var(--text-main);">
        
        <!-- Header Brand -->
        <div style="text-align: center; margin-bottom: 1.75rem;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 60px; height: 60px; background: rgba(129, 140, 248, 0.15); border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 18px; margin-bottom: 0.85rem; box-shadow: 0 8px 20px rgba(99, 102, 241, 0.25);">
            ${icon('sword', 'color:var(--primary-light)', 30)}
          </div>
          <h1 style="font-size: 1.45rem; font-weight: 900; letter-spacing: -0.02em; background: linear-gradient(135deg, #a5b4fc 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            BUG TRACKER RPG
          </h1>
          <p style="font-size: 0.82rem; color: var(--text-sub); margin-top: 0.25rem;">
            개발팀 프로필 계정을 선택하고 버그 레이드 전장에 참여하세요
          </p>
        </div>

        ${errorMsg ? `
          <div style="background: var(--danger-light); border: 1px solid var(--danger-border); color: var(--danger); font-size: 0.78rem; padding: 0.65rem 0.85rem; border-radius: 12px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('warning', 'color:var(--danger)', 14)} ${errorMsg}
          </div>
        ` : ''}

        ${successMsg ? `
          <div style="background: var(--success-light); border: 1px solid var(--success-border); color: var(--success); font-size: 0.78rem; padding: 0.65rem 0.85rem; border-radius: 12px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('check', 'color:var(--success)', 14)} ${successMsg}
          </div>
        ` : ''}

        <!-- Accounts List -->
        ${accounts.length > 0 ? `
          <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; font-weight: 700; color: var(--text-sub); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em;">
              <span>등록된 개발자 계정 (${accounts.length})</span>
              <span style="font-size: 0.7rem; color: var(--primary-light);">1-Click 빠른 선택</span>
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 240px; overflow-y: auto; padding-right: 0.2rem;">
              ${accounts.map(acc => {
                const avatar = acc.avatar || { bgColor: 'linear-gradient(135deg, #6366f1, #38bdf8)', iconSymbol: '👾' };
                return `
                  <div class="account-card-item" data-username="${acc.username}" style="background: var(--inner-box-bg); border: 1px solid var(--panel-border); padding: 0.85rem 1rem; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--panel-border)'">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                      <div style="width: 42px; height: 42px; border-radius: 12px; background: ${avatar.bgColor}; display: flex; align-items: center; justify-content: justify; justify-content: center; font-size: 1.2rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2);">
                        ${avatar.iconSymbol}
                      </div>
                      <div>
                        <div style="font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; gap: 0.35rem;">
                          ${acc.displayName}
                          <span style="font-size: 0.65rem; background: var(--primary-bg); color: var(--primary-light); padding: 0.1rem 0.4rem; border-radius: 99px; font-weight: 700;">Lv.${acc.userState.level}</span>
                        </div>
                        <div style="font-size: 0.72rem; color: var(--text-sub); margin-top: 0.15rem;">
                          @${acc.username} • ${acc.heroClass} • 토벌 ${acc.userState.defeatedBugs}건
                        </div>
                      </div>
                    </div>
                    <div style="text-align: right;">
                      <span style="font-size: 0.78rem; color: var(--primary-light); font-weight: 700;">접속 →</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Login Form -->
        <form id="form-login" style="margin-bottom: 1.25rem;">
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub);">사용자 계정 ID (@username)</label>
            <input type="text" class="form-input" id="login-username" placeholder="e.g. hero_kim" required style="font-size: 0.88rem; padding: 0.65rem 0.85rem;" />
          </div>

          <div class="form-group" style="margin-bottom: 1.25rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub);">보안 PIN (숫자 4자리)</label>
            <input type="password" maxlength="4" pattern="[0-9]{4}" class="form-input" id="login-pin" placeholder="••••" required style="font-size: 1rem; letter-spacing: 0.4em; text-align: center; font-weight: 700; padding: 0.6rem;" />
          </div>

          <button type="submit" class="action-btn" style="width: 100%; padding: 0.7rem; font-size: 0.9rem; font-weight: 800; display: flex; justify-content: center; align-items: center; gap: 0.4rem; box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);">
            ${icon('sword', 'color:white', 16)} RPG 전장 접속하기
          </button>
        </form>

        <!-- Toggle Create Account Form -->
        <div style="border-top: 1px solid var(--panel-border); padding-top: 1rem; text-align: center;">
          <button type="button" id="btn-toggle-create-acc" style="background: none; border: none; color: var(--primary-light); font-size: 0.82rem; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem;">
            ${icon('plus', 'color:var(--primary-light)', 14)} 신규 히어로 개발자 계정 등록
          </button>
        </div>

        <!-- Create Account Modal/Form -->
        <div id="create-account-section" style="display: none; margin-top: 1.25rem; background: var(--inner-box-bg); padding: 1.15rem; border-radius: 16px; border: 1px solid var(--panel-border);">
          <h3 style="font-size: 0.9rem; font-weight: 800; margin-bottom: 0.85rem; color: var(--primary-light); display: flex; align-items: center; gap: 0.35rem;">
            ${icon('sparkle', 'color:var(--primary-light)', 16)} 신규 계정 커스텀 생성
          </h3>
          <form id="form-create-account">
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">사용자 아이디 (영문/숫자)</label>
              <input type="text" class="form-input" id="new-acc-username" placeholder="e.g. dev_park" required style="font-size: 0.82rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">표시 닉네임 (팀원 표시용)</label>
              <input type="text" class="form-input" id="new-acc-displayname" placeholder="e.g. 박개발 (Backend)" required style="font-size: 0.82rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">히어로 직업 클래스</label>
              <select class="form-select" id="new-acc-class" style="font-size: 0.82rem;">
                <option value="전사 (Frontend)">🎨 전사 (Frontend)</option>
                <option value="마법사 (Backend)" selected>💻 마법사 (Backend)</option>
                <option value="성기사 (QA)">🛡️ 성기사 (QA)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 1rem;">
              <label style="font-size: 0.72rem;">접속 보안 PIN (숫자 4자리)</label>
              <input type="password" maxlength="4" pattern="[0-9]{4}" class="form-input" id="new-acc-pin" placeholder="1234" required style="font-size: 0.85rem; letter-spacing: 0.3em; text-align: center; font-weight: 700;" />
            </div>
            <button type="submit" class="action-btn action-btn-secondary" style="width: 100%; padding: 0.6rem; font-size: 0.82rem; font-weight: 800;">
              ✨ 계정 생성 완료 &amp; 전장으로 진입
            </button>
          </form>
        </div>

      </div>
    </div>
  `;
}
