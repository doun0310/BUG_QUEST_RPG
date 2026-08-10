import type { BugMonster } from './types';
import { showToast } from './toastManager';

export interface AIDebugReport {
  summary: string;
  rootCauseHypothesis: string;
  recommendedActionItems: string[];
  unitTestRecommendation: string;
  estimatedFixTimeHours: number;
}

/**
 * Simulates or calls AI (LLM) API to generate interactive debugging guide
 * for the given Bug Monster based on its severity and element trait.
 */
export async function generateAIDebugGuide(monster: BugMonster): Promise<AIDebugReport> {
  showToast(`🤖 [AI Engine] ${monster.title} 이슈 원인 및 디버깅 리포트 분석 중...`, 'info');

  return new Promise((resolve) => {
    setTimeout(() => {
      const trait = monster.elementTrait || 'Backend';
      
      let report: AIDebugReport;

      switch (trait) {
        case 'Security':
          report = {
            summary: 'JWT 인증 토큰 갱신 시 무한 루프 및 HTTP 401 예외 재발생 패턴 검출',
            rootCauseHypothesis: 'Axios/Fetch 인터셉터 내 Refresh Token 만료 시 처리 로직 미비로 실패 요청 재시도가 무한 호출됨.',
            recommendedActionItems: [
              'Axios response interceptor 내 isRefreshing 락(Flag) 추가',
              'Refresh Token 만료 시 즉시 세션 파기 후 /login 페이지 리다이렉트',
              '인증 실패 횟수 제한(Max Retry: 3회) 가드 설정'
            ],
            unitTestRecommendation: 'Mock Server 응답 401 반환 시 인터셉터가 1회만 재시도하는지 Unit Test 작성',
            estimatedFixTimeHours: 1.5
          };
          break;
        case 'Frontend':
          report = {
            summary: 'UI Z-Index 레이어 겹침 및 CSS Backdrop Filter 렌더링 성능 이슈',
            rootCauseHypothesis: '상위 Container의 transform/opacity 속성으로 인해 새로운 Stacking Context가 생성되어 발생.',
            recommendedActionItems: [
              'Modal 포털(Portal) 사용으로 body 직하단으로 레이어 분리',
              'z-index 하드코딩 제거 및 CSS 변수 레이어 가이드 바인딩',
              'will-change: transform으로 GPU 가속 유도'
            ],
            unitTestRecommendation: 'Modal 컴포넌트 마운트 시 DOM 최하단 렌더링 여부 검증',
            estimatedFixTimeHours: 0.8
          };
          break;
        case 'Database':
          report = {
            summary: 'DB 커넥션 풀 누수 및 트랜잭션 Deadlock 발생',
            rootCauseHypothesis: '비동기 쿼리 실행 후 connection.release()가 try-finally 블록 외부에 위치함.',
            recommendedActionItems: [
              '모든 DB Connection 획득부를 try-finally 문 내에 배치하여 반납 보장',
              'HikariCP / DB Pool maxConnections 모니터링 수치 조정',
              '트랜잭션 쿼리 수행 순서를 PK 오름차순으로 통일'
            ],
            unitTestRecommendation: '동시성 커넥션 50개 생성 시 풀 고갈 없이 정상 반납되는지 스트레스 테스트',
            estimatedFixTimeHours: 2.0
          };
          break;
        case 'Backend':
        default:
          report = {
            summary: '메모리 누수(Memory Leak) 및 GC Sweep 오버헤드 감지',
            rootCauseHypothesis: '전역 객체/클로저 내 이벤트 리스너 또는 대용량 배열 참조가 해제되지 않음.',
            recommendedActionItems: [
              'Heap Snapshot 프로파일링으로 지워지지 않은 이벤트 리스너 찾아 unbind',
              '대용량 데이터 조회 시 스트리밍(Stream/Cursor) 처리 도입',
              'Node.js --max-old-space-size 모니터링 적용'
            ],
            unitTestRecommendation: 'Garbage Collection 유도 후 메모리 사용량이 정상 범위로 복귀하는지 검증',
            estimatedFixTimeHours: 2.5
          };
          break;
      }

      showToast(`✅ [AI Engine] ${monster.title} AI 디버깅 가이드 생성 완료!`, 'success');
      resolve(report);
    }, 600);
  });
}
