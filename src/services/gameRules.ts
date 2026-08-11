import type { BugMonster, UserProfile } from '../types';

export const ELEMENTAL_BONUS = 1.3;
export const ENRAGE_THRESHOLD = 0.3;

export function getClassElement(devClass: UserProfile['devClass']): BugMonster['elementTrait'] {
  if (devClass === '프론트엔드 마법사') return 'Frontend';
  if (devClass === '백엔드 전사') return 'Backend';
  return 'Security';
}

export function calculateElementalDamage(baseDamage: number, monster: Pick<BugMonster, 'elementTrait'>, devClass: UserProfile['devClass']) {
  const advantage = monster.elementTrait === getClassElement(devClass);
  return { damage: Math.round(baseDamage * (advantage ? ELEMENTAL_BONUS : 1)), advantage };
}

export function canEnrage(monster: Pick<BugMonster, 'currentHp' | 'maxHp' | 'isEnraged'>): boolean {
  return monster.currentHp > 0 && !monster.isEnraged && monster.currentHp / monster.maxHp <= ENRAGE_THRESHOLD;
}

export function isDailyClaimAvailable(lastClaimedDate: string | null, date: string): boolean {
  return lastClaimedDate !== date;
}
