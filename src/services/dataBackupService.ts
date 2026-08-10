import { getGitHubConfig, saveGitHubConfig } from './githubService';

export interface BackupData {
  version: string;
  exportedAt: string;
  userState: any;
  monstersState: any;
  vacationsState: any;
  questsState: any;
  githubConfig: any;
}

/**
 * 애플리케이션의 현재 전체 상태를 JSON 파일로 다운로드합니다.
 */
export function exportAppData(state: {
  userState: any;
  monstersState: any;
  vacationsState: any;
  questsState: any;
}): void {
  const backup: BackupData = {
    version: '1.2.0',
    exportedAt: new Date().toISOString(),
    userState: state.userState,
    monstersState: state.monstersState,
    vacationsState: state.vacationsState,
    questsState: state.questsState,
    githubConfig: getGitHubConfig(),
  };

  const jsonStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const dateStr = new Date().toISOString().slice(0, 10);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bug-tracker-rpg-backup-${dateStr}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 업로드된 JSON 백업 파일을 검증하고 파싱된 데이터를 반환합니다.
 */
export function parseBackupFile(fileContent: string): { success: boolean; data?: BackupData; message: string } {
  try {
    const data = JSON.parse(fileContent);
    if (!data || typeof data !== 'object') {
      return { success: false, message: '올바른 JSON 데이터 포맷이 아닙니다.' };
    }
    if (!data.userState || !data.monstersState) {
      return { success: false, message: '백업 데이터에 필수 요소(userState, monstersState)가 누락되었습니다.' };
    }

    if (data.githubConfig) {
      saveGitHubConfig(data.githubConfig);
    }

    return {
      success: true,
      data,
      message: '백업 데이터를 성공적으로 검증하였습니다.',
    };
  } catch (err: any) {
    return { success: false, message: `JSON 파싱 실패: ${err.message}` };
  }
}
