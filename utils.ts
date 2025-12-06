
import { TeamMember, LeaveDay, DayInfo, CapacityOverride, Holiday } from './types';

// Helper to format date as YYYY-MM-DD
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getDaysInRange = (startDateStr: string, endDateStr: string): DayInfo[] => {
  if (!startDateStr || !endDateStr) return [];
  
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Safety check: if invalid date or start > end
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return [];
  }

  const days: DayInfo[] = [];

  // Loop until current date exceeds end date
  const current = new Date(start);
  while (current <= end) {
    const dayOfWeek = current.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    days.push({
      date: formatDateISO(current),
      isWeekend,
      displayDate: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dayName: current.toLocaleDateString('en-US', { weekday: 'short' }),
    });
    
    // Increment by 1 day
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export const calculateCapacity = (
  members: TeamMember[],
  leaves: LeaveDay[],
  overrides: CapacityOverride[],
  holidays: Holiday[],
  days: DayInfo[],
  includeWeekends: boolean = false
) => {
  const memberCaps: Record<string, number> = {};
  let totalTeamCapacity = 0;

  members.forEach(member => {
    let memberHours = 0;

    days.forEach(day => {
      // 0. Pre-check: No capacity before start date
      if (member.startDate && day.date < member.startDate) {
        return;
      }

      // 1. Base Logic: Skip weekends if configured
      if (day.isWeekend && !includeWeekends) return;

      const override = overrides.find(o => o.memberId === member.id && o.date === day.date);
      const leave = leaves.find(l => l.memberId === member.id && l.date === day.date);
      
      // Check for Holiday with safe location access
      const memberLoc = (member.location || '').toLowerCase();
      const isHoliday = holidays.some(h => {
        const isDateInRange = day.date >= h.startDate && day.date <= h.endDate;
        const isLocationMatch = h.locations.includes('All') || h.locations.map(l => l.toLowerCase()).includes(memberLoc);
        return isDateInRange && isLocationMatch;
      });

      // 2. Determine base hours
      // Default to member capacity, unless it's a holiday (then 0)
      let dailyHours = isHoliday ? 0 : member.dailyCapacityHours;

      // 3. Apply Override (Takes highest precedence for setting value)
      if (override) {
        dailyHours = override.hours;
      }

      // 4. Apply Leave Logic (Reduces capacity)
      if (leave && leave.status === 'approved') {
        if (leave.type === 'Full') {
          dailyHours = 0;
        } else if (leave.type === 'Half') {
          // Re-establish base for calculation if no override was present
          const baseForCalc = override ? override.hours : (isHoliday ? 0 : member.dailyCapacityHours);
          dailyHours = baseForCalc / 2;
        }
      }

      memberHours += dailyHours;
    });

    memberCaps[member.id] = memberHours;
    totalTeamCapacity += memberHours;
  });

  return { memberCaps, totalTeamCapacity };
};
