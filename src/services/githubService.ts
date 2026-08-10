export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  isEnabled: boolean;
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  state: string;
  created_at: string;
  head: {
    ref: string;
  };
  base: {
    ref: string;
  };
}

const GITHUB_CONFIG_KEY = 'github_api_config';
const inMemoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] || null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.setItem === 'function') {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
}

export function getGitHubConfig(): GitHubConfig {
  const saved = getItem(GITHUB_CONFIG_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    token: '',
    owner: '',
    repo: '',
    isEnabled: false,
  };
}

export function saveGitHubConfig(config: GitHubConfig): void {
  setItem(GITHUB_CONFIG_KEY, JSON.stringify(config));
}

/**
 * GitHub API 토큰 및 저장소 정보 검증
 */
export async function verifyGitHubConfig(config: GitHubConfig): Promise<{ success: boolean; message: string; repoName?: string }> {
  if (!config.token) {
    return { success: false, message: 'GitHub Personal Access Token(PAT)이 입력되지 않았습니다.' };
  }
  if (!config.owner || !config.repo) {
    return { success: false, message: '저장소 Owner 및 Repository 이름이 입력되지 않았습니다.' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}`, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.status === 200) {
      const data = await res.json();
      return {
        success: true,
        message: `저장소 연동 성공: ${data.full_name} (Star ${data.stargazers_count})`,
        repoName: data.full_name,
      };
    } else if (res.status === 401) {
      return { success: false, message: '인증 실패: 유효하지 않은 GitHub Token입니다.' };
    } else if (res.status === 404) {
      return { success: false, message: '저장소를 찾을 수 없거나 접근 권한이 없습니다.' };
    } else {
      return { success: false, message: `GitHub API 오류: (Status Code ${res.status})` };
    }
  } catch (err: any) {
    return { success: false, message: `네트워크 연결 오류: ${err.message}` };
  }
}

/**
 * 열린 GitHub PR 목록 가져오기
 */
export async function fetchOpenPullRequests(config: GitHubConfig): Promise<GitHubPullRequest[]> {
  if (!config.token || !config.owner || !config.repo) {
    return [];
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/pulls?state=open`, {
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Return empty on failure
  }
  return [];
}

/**
 * 실제 GitHub PR 머지 API 호출 (PUT /repos/{owner}/{repo}/pulls/{pull_number}/merge)
 */
export async function mergeGitHubPullRequest(
  config: GitHubConfig,
  pullNumber: number,
  commitTitle?: string
): Promise<{ success: boolean; message: string; sha?: string }> {
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, message: 'GitHub API 연동 설정(PAT 및 저장소 정보)이 누락되었습니다.' };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/pulls/${pullNumber}/merge`, {
      method: 'PUT',
      headers: {
        Authorization: `token ${config.token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commit_title: commitTitle || `Merge PR #${pullNumber} via Bug Tracker RPG`,
        merge_method: 'merge', // 'merge' | 'squash' | 'rebase'
      }),
    });

    const data = await res.json();

    if (res.status === 200) {
      return {
        success: true,
        message: `PR #${pullNumber}가 GitHub에서 성공적으로 머지되었습니다! (${data.message})`,
        sha: data.sha,
      };
    } else if (res.status === 405) {
      return { success: false, message: `PR #${pullNumber}를 머지할 수 없습니다. (충돌 또는 CI 검사 미통과: ${data.message})` };
    } else if (res.status === 404) {
      return { success: false, message: `PR #${pullNumber}를 찾을 수 없습니다.` };
    } else {
      return { success: false, message: `GitHub Merge 실패: ${data.message || res.statusText}` };
    }
  } catch (err: any) {
    return { success: false, message: `네트워크 오류: ${err.message}` };
  }
}
