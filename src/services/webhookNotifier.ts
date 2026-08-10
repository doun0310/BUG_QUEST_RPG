export interface WebhookConfig {
  slackUrl: string;
  teamsUrl: string;
  isEnabled: boolean;
}

const WEBHOOK_CONFIG_KEY = 'webhook_notifier_config';

const inMemoryStore: Record<string, string> = {};

function getItem(key: string): string | null {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      return localStorage.getItem(key);
    }
  } catch {
    // fallback
  }
  return inMemoryStore[key] || null;
}

function setItem(key: string, value: string): void {
  try {
    if (typeof localStorage !== 'undefined' && localStorage) {
      localStorage.setItem(key, value);
    }
  } catch {
    // fallback
  }
  inMemoryStore[key] = value;
}

export function getWebhookConfig(): WebhookConfig {
  try {
    const saved = getItem(WEBHOOK_CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // fallback
  }
  return {
    slackUrl: '',
    teamsUrl: '',
    isEnabled: false,
  };
}

export function saveWebhookConfig(config: WebhookConfig): void {
  try {
    setItem(WEBHOOK_CONFIG_KEY, JSON.stringify(config));
  } catch {
    // fallback
  }
}

/**
 * 몬스터 토벌 메시지를 Slack 또는 Teams Webhook URL로 전송합니다.
 */
export async function notifyMonsterDefeated(
  config: WebhookConfig,
  monsterTitle: string,
  rewardXp: number,
  slayerName: string
): Promise<{ success: boolean; message: string }> {
  if (!config.isEnabled || (!config.slackUrl && !config.teamsUrl)) {
    return { success: false, message: 'Webhook 알림이 활성화되어 있지 않거나 URL이 등록되지 않았습니다.' };
  }

  const payload = {
    text: `🎉 *[BUG TRACKER RPG]* 버그 몬스터 토벌 완료!`,
    attachments: [
      {
        color: '#34d399',
        fields: [
          { title: '몬스터명', value: monsterTitle, short: true },
          { title: '토벌자', value: slayerName, short: true },
          { title: '획득 보상', value: `+${rewardXp} XP`, short: true },
          { title: '상태', value: 'Slain (Defeated)', short: true }
        ],
        footer: 'Bug Tracker RPG & CMS Automator'
      }
    ]
  };

  try {
    let sent = false;
    if (config.slackUrl) {
      await fetch(config.slackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      sent = true;
    }

    if (config.teamsUrl) {
      await fetch(config.teamsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          '@type': 'MessageCard',
          summary: `[BUG TRACKER RPG] ${monsterTitle} 토벌 완료`,
          themeColor: '34D399',
          title: `🎉 몬스터 토벌 완료: ${monsterTitle}`,
          text: `**토벌자**: ${slayerName} | **보상**: +${rewardXp} XP`
        })
      });
      sent = true;
    }

    return { success: true, message: sent ? 'Slack/Teams 메신저로 실시간 알림이 발송되었습니다.' : '전송 실패' };
  } catch (err: any) {
    return { success: false, message: `Webhook 발송 오류: ${err.message}` };
  }
}
