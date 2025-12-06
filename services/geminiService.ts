import { TeamMember, LeaveDay, DayInfo } from "../types";

const API_URL = 'http://localhost:3000/api/analyze';

export const analyzeCapacity = async (
  members: TeamMember[],
  leaves: LeaveDay[],
  viewName: string,
  viewDuration: string,
  days: DayInfo[],
  calculatedCapacity: { memberCaps: Record<string, number>; totalTeamCapacity: number }
) => {
  try {
    // Construct the context payload
    const context = {
      planName: viewName,
      duration: viewDuration,
      teamSize: members.length,
      totalCapacityHours: calculatedCapacity.totalTeamCapacity,
      members: members.map(m => ({
        name: m.name,
        role: m.role,
        availableHours: calculatedCapacity.memberCaps[m.id],
        standardDaily: m.dailyCapacityHours
      })),
      leaveSummary: leaves.map(l => ({
        memberId: l.memberId,
        date: l.date,
        type: l.type
      }))
    };

    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ context })
    });

    if (!response.ok) {
        throw new Error(`Backend Error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Analysis request failed. Ensure the backend server is running at http://localhost:3000", error);
    throw error;
  }
};