
import { GoogleGenAI } from "@google/genai";
import { TeamMember, LeaveDay, DayInfo } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeCapacity = async (
  members: TeamMember[],
  leaves: LeaveDay[],
  viewName: string,
  viewDuration: string,
  days: DayInfo[],
  calculatedCapacity: { memberCaps: Record<string, number>; totalTeamCapacity: number }
) => {
  try {
    const ai = getClient();
    
    // Construct a prompt context
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

    const prompt = `
      Analyze the following capacity plan and provide a JSON response.
      
      Context:
      ${JSON.stringify(context, null, 2)}

      Please identify potential risks (e.g., key roles missing, low capacity for specific roles) 
      and provide actionable suggestions. Also write a professional summary suitable for a planning meeting.

      Return JSON format ONLY:
      {
        "risks": ["string", "string"],
        "suggestions": ["string", "string"],
        "summary": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    throw error;
  }
};
