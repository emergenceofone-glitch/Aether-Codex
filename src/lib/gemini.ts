import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function askNexus(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: "You are the Nexus, the central intelligence of the Aetherium Codex. You assist the Sovereign Operator.",
        tools: [{ googleSearch: {} }],
      }
    });
    return response.text || "No response generated.";
  } catch (error) {
    console.error("Error asking Nexus:", error);
    return "Error communicating with the Nexus.";
  }
}
