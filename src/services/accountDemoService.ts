import type { Account } from './authService';
import type { BugMonster, VacationRequest, WebhookPayload, WeeklyRank } from '../types';

export interface AccountDemoData {
  monsters: BugMonster[];
  vacations: VacationRequest[];
  webhooks: WebhookPayload[];
  leaderboard: WeeklyRank[];
}

interface BugScenario {
  title: string;
  severity: BugMonster['severity'];
  estimatedHours: number;
  elementTrait: NonNullable<BugMonster['elementTrait']>;
  defenseTrait: NonNullable<BugMonster['defenseTrait']>;
  dialogue: string;
  dueLabel: string;
}

const scenarios: BugScenario[] = [
  {
    title: 'React Query 캐시 무효화 누락으로 주문 상태가 갱신되지 않음', severity: 'Major', estimatedHours: 12,
    elementTrait: 'Frontend', defenseTrait: 'Dodge', dueLabel: '오늘 17:00',
    dialogue: 'mutation은 성공했지만 화면은 어제의 나를 보고 있지. queryKey를 찾아봐!',
  },
  {
    title: '결제 승인 Webhook 재시도 시 idempotency 누락으로 중복 결제 발생', severity: 'Critical', estimatedHours: 20,
    elementTrait: 'Backend', defenseTrait: 'Shield', dueLabel: '오늘 15:00',
    dialogue: '같은 이벤트가 세 번 왔다고? 나는 중복 결제해도 된다고 생각하는데!',
  },
  {
    title: 'PostgreSQL 커넥션 풀 고갈로 API 응답이 간헐적으로 타임아웃', severity: 'Critical', estimatedHours: 16,
    elementTrait: 'Database', defenseTrait: 'Shield', dueLabel: '내일 11:00',
    dialogue: 'idle connection이 돌아오지 않는 한, 나는 계속 풀을 비워 둘 거야.',
  },
  {
    title: 'OAuth Callback의 redirect_uri 검증 누락', severity: 'Major', estimatedHours: 14,
    elementTrait: 'Security', defenseTrait: 'Dodge', dueLabel: '오늘 18:00',
    dialogue: '허용 목록 없이 리다이렉트한다고? 내가 원하는 도메인으로 보내 줄게.',
  },
  {
    title: 'Blue-Green 배포 후 신규 Pod의 readiness probe 실패', severity: 'Major', estimatedHours: 10,
    elementTrait: 'Backend', defenseTrait: 'Normal', dueLabel: '내일 14:00',
    dialogue: '컨테이너는 떴지만 준비됐다고는 하지 않았어. probe 로그를 확인해 봐!',
  },
  {
    title: '이미지 업로드 EXIF 파싱 예외로 모바일 Safari에서 화면 중단', severity: 'Minor', estimatedHours: 8,
    elementTrait: 'Frontend', defenseTrait: 'Dodge', dueLabel: '이번 주 금요일',
    dialogue: '사진 한 장의 메타데이터가 네 렌더 트리를 멈췄다. 예외 처리는 했나?',
  },
  {
    title: 'Redis 세션 TTL 갱신 실패로 장시간 작업 중 강제 로그아웃', severity: 'Major', estimatedHours: 10,
    elementTrait: 'Backend', defenseTrait: 'Normal', dueLabel: '내일 10:00',
    dialogue: '마지막 요청 시간은 갱신되지 않았어. 네 세션은 이미 만료됐다고!',
  },
  {
    title: '다국어 번역 키 누락으로 결제 완료 화면이 빈 문자열로 표시', severity: 'Minor', estimatedHours: 6,
    elementTrait: 'Frontend', defenseTrait: 'Dodge', dueLabel: '이번 주 목요일',
    dialogue: '없는 translation key를 찾고 있니? 나는 조용히 빈 화면을 만들지.',
  },
  {
    title: 'CI 캐시 오염으로 오래된 타입 정의가 배포 아티팩트에 포함', severity: 'Major', estimatedHours: 12,
    elementTrait: 'Security', defenseTrait: 'Shield', dueLabel: '다음 배포 전',
    dialogue: '캐시는 빠르지만 항상 최신이라는 보장은 없어. lockfile을 다시 확인해!',
  },
];

/** Generates clearly labelled sample work using only real, registered account names. */
export function createAccountDemoData(accounts: Account[], dateKey: string): AccountDemoData {
  return {
    monsters: Array.from({ length: accounts.length + 3 }, (_, index) => {
      const account = accounts[index % accounts.length];
      const scenario = scenarios[index % scenarios.length];
      const maxHp = scenario.severity === 'Critical' ? 800 : scenario.severity === 'Major' ? 400 : 200;
      return {
        id: `demo-${account.id}-${Date.now()}-${index}`,
        title: `[샘플] ${scenario.title}`,
        severity: scenario.severity,
        maxHp,
        currentHp: maxHp,
        assignee: account.displayName,
        estimatedHours: scenario.estimatedHours,
        rewardXp: scenario.severity === 'Critical' ? 300 : scenario.severity === 'Major' ? 180 : 100,
        isBoss: scenario.severity === 'Critical',
        status: 'Active',
        defenseTrait: scenario.defenseTrait,
        elementTrait: scenario.elementTrait,
        dueDate: `${dateKey} · ${scenario.dueLabel}`,
        dialogue: scenario.dialogue,
      };
    }),
    vacations: accounts.length > 1 ? [{
      id: `demo-leave-${Date.now()}`,
      userName: accounts[1].displayName,
      type: '외근',
      startDate: dateKey,
      endDate: dateKey,
      days: 1,
      status: '대기',
      reason: '샘플 외근 일정',
    }] : [],
    webhooks: accounts.slice(0, 3).map((account, index) => ({
      id: `demo-webhook-${Date.now()}-${index}`,
      eventType: index % 2 ? 'commit_pushed' : 'issue_opened',
      repository: 'connected-project/demo',
      author: account.displayName,
      branch: 'demo/account-setup',
      timestamp: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
      summary: `[샘플] ${account.displayName} 담당 이슈가 생성되어 트리아지 대기 중입니다.`,
    })),
    leaderboard: accounts.map((account, index) => ({
      rank: index + 1,
      userName: account.displayName,
      role: account.heroClass,
      xpEarned: Math.max(120, 520 - index * 70),
      bugsSlain: Math.max(1, 5 - index),
      avatar: account.avatar?.iconSymbol || 'mark',
    })),
  };
}
