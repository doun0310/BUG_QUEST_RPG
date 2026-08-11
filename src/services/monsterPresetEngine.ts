export interface GeneratedMonsterPreset {
  elementTrait: 'Frontend' | 'Backend' | 'Database' | 'Security';
  dialogue: string;
  monsterImage: string;
  defenseTrait: 'Shield' | 'Dodge' | 'Normal';
  traitDescription: string;
}

// 속성별 자동 외형 픽셀 몬스터 세트
const AVATAR_MAP = {
  Frontend: [
    'pixel-monster-v2-0-0', 'pixel-monster-v2-0-1', 'pixel-monster-v2-0-2', 'pixel-monster-v2-0-3',
  ],
  Backend: [
    'pixel-monster-v2-1-0', 'pixel-monster-v2-1-1', 'pixel-monster-v2-1-2', 'pixel-monster-v2-1-3',
  ],
  Database: [
    'pixel-monster-v2-2-0', 'pixel-monster-v2-2-1',
  ],
  Security: [
    'pixel-monster-v2-2-2', 'pixel-monster-v2-2-3',
  ],
};

// 속성 및 버그 키워드에 따른 개발자 위트 대사 풀
const DIALOGUE_MEMES = {
  Frontend: [
    'useEffect 의존성 배열에 나를 넣었냐?! 무한 루프의 늪에 빠져라!',
    'z-index를 999999로 설정해도 날 가릴 순 없을 걸?!',
    'Safari 브라우저에서만 레이아웃이 박살 나는 기적을 보여주마!',
    'Flexbox 줄바꿈 하나로 자식 요소들을 전부 찌그러뜨려 주마!',
    'CSS backdrop-filter 렌더링 지연으로 60fps를 깨뜨려 주겠다!'
  ],
  Backend: [
    'OOM(Out Of Memory) 노란 불이 켜졌다! 커넥션 풀을 전부 고갈시켜 주마!',
    'N+1 쿼리 폭탄을 투하했다! 응답 속도가 10초로 급증할 것이다!',
    '비동기 async/await에서 catch를 누락했더구나! Unhandled Rejection의 매운맛을 봐라!',
    '스프레드시트 10만 줄을 RAM에 통째로 올린 건 바로 너다!',
    '스프링 데드락(Deadlock)에 걸려 영원히 대기 상태에 빠져라!'
  ],
  Database: [
    'WHERE 절 없이 UPDATE 문을 쳤더구나?! 전체 데이터베이스를 날려 주마!',
    '인덱스를 타지 않는 Full Table Scan의 묵직함을 맛보아라!',
    '트랜잭션 커밋을 깜빡했더냐?! 영원한 Lock의 결계에 갇혀라!',
    'Redis 캐시 세션이 만료되는 순간 DB 폭주를 감당할 수 있겠느냐?!',
    'Primary Key 중복 충돌로 데이터 정합성을 무너뜨려 주겠다!'
  ],
  Security: [
    'Access-Control-Allow-Origin 헤더도 없이 나를 호출하다니 배짱이 두둑하구나!',
    'JWT 토큰 만료 시간이 지났다! 401 Unauthorized의 절망을 느껴라!',
    'SQL Injection 문자열을 검증 없이 바인딩했더냐?!',
    'XSS 스크립트가 실행되어 쿠키가 탈취되는 순간을 목격하라!',
    'HTTPS SSL Certificate 유효기간이 지났다! 보안 경고 창을 받아라!'
  ]
};

/**
 * 버그 제목(Title)과 위험도(Severity)를 분석하여 특성에 맞는 외형, 속성, 도발 대사, 방어 특성을 100% 자동 생성합니다.
 */
export function generateMonsterPreset(title: string, severity: 'Minor' | 'Major' | 'Critical'): GeneratedMonsterPreset {
  const lowerTitle = title.toLowerCase();

  // 1. 키워드 분석으로 Element Trait 결정
  let elementTrait: 'Frontend' | 'Backend' | 'Database' | 'Security' = 'Backend';

  if (/react|vue|css|flex|grid|z-index|ui|style|layout|render|dom|safari|chrome|pixel|button|input|font/i.test(lowerTitle)) {
    elementTrait = 'Frontend';
  } else if (/sql|db|database|query|index|table|lock|deadlock|migration|postgres|mysql|redis|mongo|orm/i.test(lowerTitle)) {
    elementTrait = 'Database';
  } else if (/auth|jwt|token|cors|security|xss|injection|ssl|cert|permission|401|403|login|password/i.test(lowerTitle)) {
    elementTrait = 'Security';
  } else {
    elementTrait = 'Backend';
  }

  // 2. 맥락 맞춤형 도발 대사 자동 선정
  const memeList = DIALOGUE_MEMES[elementTrait];
  let dialogue = memeList[Math.floor(Math.random() * memeList.length)];

  if (severity === 'Critical') {
    dialogue = `🔥 [CRITICAL BOSS] ${dialogue}`;
  }

  // 3. 외형 이미지 자동 지정
  const images = AVATAR_MAP[elementTrait];
  const monsterImage = images[Math.floor(Math.random() * images.length)];

  // 4. 방어 특성(Defense Trait) 자동 지정
  let defenseTrait: 'Shield' | 'Dodge' | 'Normal' = 'Normal';
  let traitDescription = '일반 몬스터';

  if (elementTrait === 'Security') {
    defenseTrait = 'Shield';
    traitDescription = '보안 장벽 (피해량 20% 감소)';
  } else if (elementTrait === 'Frontend') {
    defenseTrait = 'Dodge';
    traitDescription = '리렌더링 회피 (20% 확률로 완전 회피)';
  }

  return {
    elementTrait,
    dialogue,
    monsterImage,
    defenseTrait,
    traitDescription,
  };
}
