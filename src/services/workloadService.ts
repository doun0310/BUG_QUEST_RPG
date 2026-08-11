import type { BugMonster, TeamMemberCapacity, VacationRequest } from '../types';

/** Members are shown in the workload board only while they own an active issue. */
export function getAssignedWorkloadMembers(members: TeamMemberCapacity[], issues: BugMonster[]): TeamMemberCapacity[] {
  const activeAssignees = new Set(
    issues
      .filter(issue => issue.status === 'Active')
      .map(issue => issue.assignee.trim())
      .filter(Boolean)
  );
  return members.filter(member => activeAssignees.has(member.userName));
}

/** Derives live workload from active issues and approved absences. */
export function recalculateWorkload(members: TeamMemberCapacity[], vacations: VacationRequest[], issues: BugMonster[]): TeamMemberCapacity[] {
  return members.map(member => {
    const vacationDays = vacations
      .filter(v => v.userName === member.userName && v.status === '승인')
      .reduce((sum, v) => sum + v.days, 0);
    const baselineHours = Math.floor(member.totalSprintDays * member.workingHoursPerDay * member.deepWorkLimitRatio);
    const vacationHours = Math.floor(vacationDays * member.workingHoursPerDay * member.deepWorkLimitRatio);
    const availableHours = Math.max(0, baselineHours - vacationHours);
    const assignedHours = issues
      .filter(issue => issue.status === 'Active' && issue.assignee === member.userName)
      .reduce((sum, issue) => sum + (issue.estimatedHours ?? 8), 0);
    return { ...member, vacationDays, availableHours, assignedHours, isOverloaded: assignedHours > availableHours };
  });
}
