/**
 * Web Crypto API (SHA-256) 기반 PIN 암호화 및 검증 서비스
 */

const SALT_PREFIX = 'BUG_QUEST_RPG_SALT_';

/**
 * 동기 방식 핀 해시 생성 (SSR / 테스트 / 동기 검증용)
 */
export function hashPinSync(pin: string, username: string): string {
  const saltedText = `${SALT_PREFIX}${username.toLowerCase()}_${pin}`;
  let hash = 0;
  for (let i = 0; i < saltedText.length; i++) {
    const char = saltedText.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return 'hashed_fb_' + Math.abs(hash).toString(16);
}

/**
 * 주어진 텍스트(PIN)와 사용자명을 기반으로 SHA-256 해시를 생성합니다.
 */
export async function hashPin(pin: string, username: string): Promise<string> {
  const saltedText = `${SALT_PREFIX}${username.toLowerCase()}_${pin}`;
  
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(saltedText);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // fallback
    }
  }

  return hashPinSync(pin, username);
}

/**
 * 동기 환경용 PIN 검증 (평문 & 해시 겸용)
 */
export function verifyPinSync(inputPin: string, username: string, storedPinOrHash: string): boolean {
  if (storedPinOrHash === inputPin) return true;
  if (storedPinOrHash === hashPinSync(inputPin, username)) return true;
  return false;
}

/**
 * 입력된 PIN이 저장된 해시값(또는 구 버전 평문 PIN)과 일치하는지 검증합니다.
 */
export async function verifyPin(inputPin: string, username: string, storedPinOrHash: string): Promise<{ isValid: boolean; needsMigration: boolean }> {
  // 1. 구 버전 4자리 평문 PIN과 직접 일치하는 경우 (마이그레이션 필요)
  if (storedPinOrHash === inputPin) {
    return { isValid: true, needsMigration: true };
  }

  // 2. 동기/해시 일치 여부
  if (verifyPinSync(inputPin, username, storedPinOrHash)) {
    return { isValid: true, needsMigration: false };
  }

  // 3. Web Crypto Async SHA-256 해시값 검증
  const hashedInput = await hashPin(inputPin, username);
  if (hashedInput === storedPinOrHash) {
    return { isValid: true, needsMigration: false };
  }

  return { isValid: false, needsMigration: false };
}
