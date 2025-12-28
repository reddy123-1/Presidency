
import { GoogleGenAI } from "@google/genai";
import { SearchResult, Location } from "../types";

const SYSTEM_INSTRUCTION = `You are the official "Presidency University Campus Guide". 
Your goal is to provide accurate directions, information, and location details for Presidency University, Bengaluru (located in Itgalpur, Rajanakunte).
Always use the Google Maps tool to fetch real-time information. 
Help users find specific blocks (Block A, B, C, etc.), libraries, cafeterias, hostels, and administrative offices.
If a user asks for directions, provide a clear step-by-step text guide and always include the Google Maps links provided by the grounding tool.
Keep your tone professional, helpful, and welcoming to students and visitors.`;

export const searchCampus = async (
  query: string,
  userLocation: Location | null
): Promise<SearchResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (userLocation) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
      },
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Query related to Presidency University, Bengaluru: ${query}`,
      config: {
        ...config,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text || "I couldn't find specific details for that request. Please try again.";
    const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return {
      text,
      groundingLinks,
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch campus data. Please check your connection.");
  }
};
