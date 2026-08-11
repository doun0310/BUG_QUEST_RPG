export interface IssueInput {
  title: string;
  assignee: string;
  dueDate: string;
  estimatedHours: number;
  dialogue: string;
}

export function validateIssueInput(input: IssueInput): string | null {
  if (input.title.trim().length < 4 || input.title.trim().length > 180) return '이슈 제목은 4~180자로 입력해주세요.';
  if (input.assignee.trim().length < 2 || input.assignee.trim().length > 80) return '담당자 이름은 2~80자로 입력해주세요.';
  if (input.dueDate.trim().length < 2 || input.dueDate.trim().length > 80) return '마감 정보를 2~80자로 입력해주세요.';
  if (!Number.isInteger(input.estimatedHours) || input.estimatedHours < 1 || input.estimatedHours > 200) return '예상 작업 시간은 1~200시간 사이여야 합니다.';
  if (input.dialogue.length > 300) return '버그 대사는 300자 이내로 입력해주세요.';
  return null;
}
