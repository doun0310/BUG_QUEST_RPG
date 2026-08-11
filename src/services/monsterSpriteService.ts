import type { BugMonster } from '../types';

export interface MonsterArtworkOption {
  id: string;
  label: string;
  row: number;
  column: number;
}

export const MONSTER_ARTWORK_OPTIONS: MonsterArtworkOption[] = [
  { id: 'pixel-monster-v2-0-0', label: '글리치 슬라임', row: 0, column: 0 },
  { id: 'pixel-monster-v2-0-1', label: '널 팬텀', row: 0, column: 1 },
  { id: 'pixel-monster-v2-0-2', label: '렌더 위습', row: 0, column: 2 },
  { id: 'pixel-monster-v2-0-3', label: 'CSS 미믹', row: 0, column: 3 },
  { id: 'pixel-monster-v2-1-0', label: '큐 고블린', row: 1, column: 0 },
  { id: 'pixel-monster-v2-1-1', label: '메모리 골렘', row: 1, column: 1 },
  { id: 'pixel-monster-v2-1-2', label: '데드락 레이스', row: 1, column: 2 },
  { id: 'pixel-monster-v2-1-3', label: 'API 히드라', row: 1, column: 3 },
  { id: 'pixel-monster-v2-2-0', label: '인덱스 스파이더', row: 2, column: 0 },
  { id: 'pixel-monster-v2-2-1', label: '캐시 미믹', row: 2, column: 1 },
  { id: 'pixel-monster-v2-2-2', label: '인젝션 서펀트', row: 2, column: 2 },
  { id: 'pixel-monster-v2-2-3', label: '파이어월 드래곤', row: 2, column: 3 },
];

const ELEMENT_VARIANTS: Record<NonNullable<BugMonster['elementTrait']>, MonsterArtworkOption[]> = {
  Frontend: MONSTER_ARTWORK_OPTIONS.slice(0, 4),
  Backend: MONSTER_ARTWORK_OPTIONS.slice(4, 8),
  Database: MONSTER_ARTWORK_OPTIONS.slice(8, 10),
  Security: MONSTER_ARTWORK_OPTIONS.slice(10, 12),
};

function stableIndex(value: string, length: number): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  return hash % length;
}

/** Resolves every issue to one of the project-owned pixel monster species. */
export function getMonsterArtwork(monster: Pick<BugMonster, 'id' | 'title' | 'isBoss' | 'elementTrait' | 'monsterImage'>): MonsterArtworkOption {
  const savedArtwork = MONSTER_ARTWORK_OPTIONS.find(option => option.id === monster.monsterImage);
  if (savedArtwork) return savedArtwork;
  if (monster.isBoss) return MONSTER_ARTWORK_OPTIONS[11];

  const choices = ELEMENT_VARIANTS[monster.elementTrait || 'Backend'];
  return choices[stableIndex(`${monster.id}:${monster.title}`, choices.length)];
}

export function monsterArtworkClass(monster: Pick<BugMonster, 'id' | 'title' | 'isBoss' | 'elementTrait' | 'monsterImage'>): string {
  const artwork = getMonsterArtwork(monster);
  return `sprite-v2-${artwork.row}-${artwork.column}`;
}
