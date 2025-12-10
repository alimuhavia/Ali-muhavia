import { GoogleGenAI } from "@google/genai";
import { AttendanceLog, Student } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateDailyInsight = async (
  stats: any,
  logs: AttendanceLog[],
  students: Student[]
): Promise<string> => {
  try {
    const prompt = `
      You are an AI assistant for a school administrator. Analyze the following academy data for today:
      
      Dashboard Stats: ${JSON.stringify(stats)}
      Recent Attendance Logs (Last 5): ${JSON.stringify(logs.slice(0, 5))}
      Student Status Overview: Active (${students.filter(s => s.status === 'Active').length}), Pending Fees (${students.filter(s => s.feeStatus !== 'Paid').length})
      
      Provide a concise 3-bullet point summary of health, safety, and financial risks. 
      Focus on anomalies like high absenteeism, late arrivals, or revenue gaps.
      Return plain text.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No insights available at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "AI insights service is currently unavailable. Please check your connection or API key.";
  }
};

export const analyzeSecuritySnapshot = async (imageBase64: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
                    { text: "Analyze this security camera frame. Describe the person's appearance (clothing, estimated age, gender) and whether they look suspicious or are carrying any visible objects. Keep it brief and objective." }
                ]
            }
        });
        return response.text || "Analysis complete.";
    } catch (error) {
        console.error("Gemini Vision Error", error);
        return "Could not analyze image.";
    }
}
