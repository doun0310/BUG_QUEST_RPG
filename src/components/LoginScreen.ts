import { getAllAccounts, createAccount, login, getCurrentAccount, type Account } from '../services/authService';
import { icon } from '../icons';

export function renderLoginScreen(errorMsg: string = '', successMsg: string = ''): string {
  const accounts = getAllAccounts();

  return `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-gradient); padding: 1.5rem;">
      <div style="width: 100%; max-width: 440px; background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: 20px; padding: 2rem; box-shadow: var(--glass-glow); color: var(--text-main);">
        
        <!-- Header Brand -->
        <div style="text-align: center; margin-bottom: 1.75rem;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 56px; height: 56px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px; margin-bottom: 0.85rem;">
            ${icon('sword', 'color:var(--primary-light)', 28)}
          </div>
          <h1 style="font-size: 1.4rem; font-weight: 800; letter-spacing: -0.02em; background: linear-gradient(135deg, #a5b4fc 0%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
            BUG TRACKER RPG
          </h1>
          <p style="font-size: 0.82rem; color: var(--text-sub); margin-top: 0.25rem;">
            개발 팀 계정으로 접속하여 버그 몬스터를 토벌하세요
          </p>
        </div>

        ${errorMsg ? `
          <div style="background: var(--danger-light); border: 1px solid var(--danger-border); color: var(--danger); font-size: 0.78rem; padding: 0.65rem 0.85rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('warning', 'color:var(--danger)', 14)} ${errorMsg}
          </div>
        ` : ''}

        ${successMsg ? `
          <div style="background: var(--success-light); border: 1px solid var(--success-border); color: var(--success); font-size: 0.78rem; padding: 0.65rem 0.85rem; border-radius: 10px; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.4rem;">
            ${icon('check', 'color:var(--success)', 14)} ${successMsg}
          </div>
        ` : ''}

        <!-- Existing Accounts List -->
        ${accounts.length > 0 ? `
          <div style="margin-bottom: 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 600; color: var(--text-sub); margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.05em;">
              기존 등록 계정 선택
            </div>
            <div style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 220px; overflow-y: auto;">
              ${accounts.map(acc => `
                <div class="account-card-item" data-username="${acc.username}" style="background: var(--inner-box-bg); border: 1px solid var(--panel-border); padding: 0.75rem 0.9rem; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all 0.2s ease;">
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <div style="width: 36px; height: 36px; border-radius: 50%; background: var(--primary-bg); border: 1px solid var(--primary-border); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--primary-light); font-size: 0.85rem;">
                      ${acc.displayName.charAt(0)}
                    </div>
                    <div>
                      <div style="font-size: 0.88rem; font-weight: 700;">${acc.displayName}</div>
                      <div style="font-size: 0.72rem; color: var(--text-sub);">@${acc.username} • ${acc.heroClass} (Lv.${acc.userState.level})</div>
                    </div>
                  </div>
                  <span style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">선택 →</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Login Form -->
        <form id="form-login" style="margin-bottom: 1.25rem;">
          <div class="form-group" style="margin-bottom: 0.85rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub);">사용자 ID (@username)</label>
            <input type="text" class="form-input" id="login-username" placeholder="e.g. hero_kim" required style="font-size: 0.85rem;" />
          </div>

          <div class="form-group" style="margin-bottom: 1.1rem;">
            <label style="font-size: 0.75rem; color: var(--text-sub);">PIN 번호 (숫자 4자리)</label>
            <input type="password" maxlength="4" pattern="[0-9]{4}" class="form-input" id="login-pin" placeholder="••••" required style="font-size: 0.85rem; letter-spacing: 0.3em; text-align: center;" />
          </div>

          <button type="submit" class="action-btn" style="width: 100%; padding: 0.65rem; font-size: 0.88rem; font-weight: 700; display: flex; justify-content: center; align-items: center; gap: 0.4rem;">
            ${icon('sword', 'color:white', 16)} 게임 접속하기
          </button>
        </form>

        <!-- Toggle Create Account Form -->
        <div style="border-top: 1px solid var(--panel-border); pt: 1rem; margin-top: 1.25rem; text-align: center;">
          <button type="button" id="btn-toggle-create-acc" style="background: none; border: none; color: var(--primary-light); font-size: 0.8rem; font-weight: 600; cursor: pointer; text-decoration: underline;">
            + 신규 히어로 계정 만들기
          </button>
        </div>

        <!-- Create Account Modal/Form (Hidden by default or expandable) -->
        <div id="create-account-section" style="display: none; margin-top: 1.25rem; background: var(--inner-box-bg); padding: 1rem; border-radius: 12px; border: 1px solid var(--panel-border);">
          <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--primary-light);">신규 히어로 계정 등록</h3>
          <form id="form-create-account">
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">사용자 아이디 (영문/숫자)</label>
              <input type="text" class="form-input" id="new-acc-username" placeholder="e.g. dev_park" required style="font-size: 0.8rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">표시 이름 (개발자 닉네임)</label>
              <input type="text" class="form-input" id="new-acc-displayname" placeholder="e.g. 박개발 (Backend)" required style="font-size: 0.8rem;" />
            </div>
            <div class="form-group" style="margin-bottom: 0.65rem;">
              <label style="font-size: 0.72rem;">히어로 직업 클래스</label>
              <select class="form-select" id="new-acc-class" style="font-size: 0.8rem;">
                <option value="전사 (Frontend)">전사 (Frontend)</option>
                <option value="마법사 (Backend)" selected>마법사 (Backend)</option>
                <option value="성기사 (QA)">성기사 (QA)</option>
              </select>
            </div>
            <div class="form-group" style="margin-bottom: 0.85rem;">
              <label style="font-size: 0.72rem;">보안 PIN (숫자 4자리)</label>
              <input type="password" maxlength="4" pattern="[0-9]{4}" class="form-input" id="new-acc-pin" placeholder="1234" required style="font-size: 0.8rem; letter-spacing: 0.2em; text-align: center;" />
            </div>
            <button type="submit" class="action-btn action-btn-secondary" style="width: 100%; padding: 0.5rem; font-size: 0.8rem; font-weight: 700;">
              ✨ 계정 생성을 완료하고 접속
            </button>
          </form>
        </div>

      </div>
    </div>
  `;
}
