export interface LcovSummary {
  totalFiles: number;
  linesFound: number;
  linesHit: number;
  coveragePercent: number;
  message: string;
}

/**
 * LCOV (lcov.info) 파일 텍스트를 분석하여 라인 커버리지 퍼센티지(%)를 계산합니다.
 */
export function parseLcovContent(lcovText: string): LcovSummary {
  if (!lcovText || typeof lcovText !== 'string') {
    return {
      totalFiles: 0,
      linesFound: 0,
      linesHit: 0,
      coveragePercent: 0,
      message: '유효하지 않은 LCOV 파일 내용입니다.'
    };
  }

  let totalFiles = 0;
  let linesFound = 0;
  let linesHit = 0;

  const lines = lcovText.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('SF:')) {
      totalFiles += 1;
    } else if (trimmed.startsWith('LF:')) {
      const count = parseInt(trimmed.substring(3), 10);
      if (!isNaN(count)) linesFound += count;
    } else if (trimmed.startsWith('LH:')) {
      const count = parseInt(trimmed.substring(3), 10);
      if (!isNaN(count)) linesHit += count;
    }
  }

  const coveragePercent = linesFound > 0 ? Math.round((linesHit / linesFound) * 100) : 0;

  return {
    totalFiles,
    linesFound,
    linesHit,
    coveragePercent,
    message: `LCOV 분석 완료: 총 ${totalFiles}개 파일, 커버리지 ${coveragePercent}% (${linesHit}/${linesFound} lines)`
  };
}
