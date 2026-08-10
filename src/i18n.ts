export type Lang = 'ko' | 'en';

export const translations: Record<Lang, Record<string, string>> = {
  ko: {
    appTitle: 'BUG QUEST RPG',
    developer: '개발자',
    combo: 'COMBO',
    battleLogTitle: '[ BATTLE LOG ]',
    battleFieldTitle: '몬스터 토벌 전장',
    activeMonsters: '출현',
    defeatedMonsters: '토벌',
    createMonsterBtn: '+ 몬스터 발견 등록',
    weeklyQuestsBtn: '주간 퀘스트',
    rankingsBtn: '기여도 랭킹',
    skillReady: '⚡ 스킬 준비 (S)',
    skillActive: '⚡ 스킬 발동!',
    filterAll: '전체',
    filterActive: '출현 중',
    filterDefeated: '토벌 완료',
    attackBtn: 'PR 공격 / 통합',
    slainBadge: 'Slain',
    postMortemBtn: '📝 사후 분석 작성',
    capacityTitle: '팀 스프린트 Workload Capacity',
    quickActionTitle: 'CMS 빠른 리소스 제어',
    vacationBtn: '+ 연차 / 외근 신청 (HP 회복)',
    budgetChartBtn: '📊 프로젝트 예산 소진 차트',
    dailySummaryTitle: '오늘의 개발 요약',
    soundToggle: '사운드',
    themeDark: '다크',
    themeLight: '라이트',
    themeMatrix: '매트릭스'
  },
  en: {
    appTitle: 'BUG QUEST RPG',
    developer: 'Dev',
    combo: 'COMBO',
    battleLogTitle: '[ BATTLE LOG ]',
    battleFieldTitle: 'Bug Monster Battlefield',
    activeMonsters: 'Active',
    defeatedMonsters: 'Slain',
    createMonsterBtn: '+ Register Bug Monster',
    weeklyQuestsBtn: 'Weekly Quests',
    rankingsBtn: 'Leaderboard',
    skillReady: '⚡ Skill Ready (S)',
    skillActive: '⚡ Skill Active!',
    filterAll: 'All',
    filterActive: 'Active',
    filterDefeated: 'Slain',
    attackBtn: 'PR Merge Attack',
    slainBadge: 'Slain',
    postMortemBtn: '📝 Write Post-Mortem',
    capacityTitle: 'Sprint Workload Capacity',
    quickActionTitle: 'Quick CMS Resource Controls',
    vacationBtn: '+ Request Vacation (Restore HP)',
    budgetChartBtn: '📊 Budget Burndown Chart',
    dailySummaryTitle: 'Daily Dev Summary',
    soundToggle: 'Sound',
    themeDark: 'Dark',
    themeLight: 'Light',
    themeMatrix: 'Matrix'
  }
};

const isStorageAvailable = typeof window !== 'undefined' && typeof localStorage !== 'undefined' && localStorage !== null;

let currentLang: Lang = (isStorageAvailable ? (localStorage.getItem('lang') as Lang) : null) || 'ko';

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  if (isStorageAvailable) {
    localStorage.setItem('lang', lang);
  }
}

export function t(key: string): string {
  return translations[currentLang][key] || key;
}
