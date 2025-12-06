

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  location: string;
  dailyCapacityHours: number; // e.g., 6 hours (after meetings)
  avatarUrl?: string;
}

export interface LeaveDay {
  id: string;
  memberId: string;
  date: string; // ISO Date string YYYY-MM-DD
  type: 'Full' | 'Half';
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

export interface CapacityOverride {
  memberId: string;
  date: string;
  hours: number;
}

export interface Holiday {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  name: string;
  locations: string[]; // ['All'] or ['US', 'UK']
}

export interface DayInfo {
  date: string; // YYYY-MM-DD
  isWeekend: boolean;
  displayDate: string;
  dayName: string;
}

export interface CapacityAnalysis {
  totalCapacity: number;
  memberCapacities: { memberId: string; hours: number }[];
  risks: string[];
  suggestions: string[];
  summary: string;
}