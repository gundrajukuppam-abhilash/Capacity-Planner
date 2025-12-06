
import { TeamMember, LeaveDay, SprintSettings, DayInfo, CapacityOverride } from './types';

// Helper to format date as YYYY-MM-DD
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getSprintDays = (startDateStr: string, durationWeeks: number): DayInfo[] => {
  const start = new Date(startDateStr);
  const totalDays = durationWeeks * 7;
  const days: DayInfo[] = [];

  for (let i = 0; i < totalDays; i++) {
    const current = addDays(start, i);
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    days.push({
      date: formatDateISO(current),
      isWeekend,
      displayDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
    });
  }
  return days;
};

export const calculateCapacity = (
  members: TeamMember[],
  leaves: LeaveDay[],
  overrides: CapacityOverride[],
  days: DayInfo[],
  includeWeekends: boolean = false
) => {
  const memberCaps: Record<string, number> = {};
  let totalTeamCapacity = 0;

  members.forEach(member => {
    let memberHours = 0;

    days.forEach(day => {
      // Skip weekends if configured
      if (day.isWeekend && !includeWeekends) return;

      const override = overrides.find(o => o.memberId === member.id && o.date === day.date);
      const leave = leaves.find(l => l.memberId === member.id && l.date === day.date);
      
      // Determine base hours for this day
      let dailyHours = override ? override.hours : member.dailyCapacityHours;

      // Apply Leave Logic
      if (leave && leave.status === 'approved') {
        if (leave.type === 'Full') {
          dailyHours = 0;
        } else if (leave.type === 'Half') {
          dailyHours = dailyHours / 2;
        }
      }

      memberHours += dailyHours;
    });

    memberCaps[member.id] = memberHours;
    totalTeamCapacity += memberHours;
  });

  return { memberCaps, totalTeamCapacity };
};
