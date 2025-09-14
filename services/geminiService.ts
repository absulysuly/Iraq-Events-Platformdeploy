import { GoogleGenAI, Type } from "@google/genai";
import type { City, Category, AISuggestionResponse, Event, AIItineraryResponse, Language } from '../types';

// --- IMPORTANT FOR LOCAL DEVELOPMENT ---
// To enable the AI features, you need a Gemini API Key.
// 1. Go to Google AI Studio (aistudio.google.com)
// 2. Click "Get API key" and create a new API key.
// 3. Replace the placeholder string below with your actual key.
const API_KEY = process.env.API_KEY || "REPLACE_WITH_YOUR_GEMINI_API_KEY";

if (!API_KEY || API_KEY === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
  const warningStyle = 'color: orange; font-size: 14px; font-weight: bold;';
  console.warn('%cWARNING: Gemini API Key is not set.', warningStyle);
  console.warn("AI features will be disabled. To enable them, get a key from aistudio.google.com and add it to `services/geminiService.ts`.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateEventDetailsFromPrompt = async (
    prompt: string,
    cities: City[],
    categories: Category[]
): Promise<AISuggestionResponse> => {
    if (!API_KEY || API_KEY === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        throw new Error("AI features are disabled. Please configure your Gemini API Key in `services/geminiService.ts`.");
    }

    const cityContext = cities.map(c => ({ id: c.id, name: c.name.en }));
    const categoryContext = categories
      .filter(c => c.id !== 'all')
      .map(c => ({ id: c.id, name: c.translation_key?.replace(/_/g, ' ') || c.name.en }));

    try {
        const textModel = 'gemini-2.5-flash';
        const systemInstruction = `You are an expert event planner for Iraq and the Kurdistan Region. Your task is to take a user's rough idea and transform it into a structured event object.
        - Generate a compelling, professional-sounding title and a detailed, engaging description.
        - You MUST provide the title and description in three languages: English (en), Arabic (ar), and Kurdish (ku).
        - Based on the user's prompt, select the most appropriate cityId and categoryId from the provided lists.
        - Create a simple, descriptive prompt suitable for an AI image generator like DALL-E to create a cover photo for the event.
        - Respond ONLY with a valid JSON object that adheres to the provided schema.

        Available cities: ${JSON.stringify(cityContext)}
        Available categories: ${JSON.stringify(categoryContext)}
        `;

        const textResponse = await ai.models.generateContent({
            model: textModel,
            contents: `User's event idea: "${prompt}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: {
                            type: Type.OBJECT,
                            properties: {
                                en: { type: Type.STRING },
                                ar: { type: Type.STRING },
                                ku: { type: Type.STRING }
                            },
                            required: ["en", "ar", "ku"]
                        },
                        description: {
                            type: Type.OBJECT,
                            properties: {
                                en: { type: Type.STRING },
                                ar: { type: Type.STRING },
                                ku: { type: Type.STRING }
                            },
                            required: ["en", "ar", "ku"]
                        },
                        suggestedCategoryId: { type: Type.STRING },
                        suggestedCityId: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["title", "description", "suggestedCategoryId", "suggestedCityId", "imagePrompt"]
                },
            },
        });
        
        const suggestions = JSON.parse(textResponse.text.trim());
        const { title, description, suggestedCategoryId, suggestedCityId, imagePrompt } = suggestions;
        
        const imageModel = 'imagen-4.0-generate-001';
        const imageResponse = await ai.models.generateImages({
            model: imageModel,
            prompt: imagePrompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
            },
        });

        const generatedImageBase64 = imageResponse.generatedImages[0].image.imageBytes;

        if (!generatedImageBase64) {
            throw new Error("Image generation failed.");
        }

        return {
            title,
            description,
            suggestedCategoryId,
            suggestedCityId,
            generatedImageBase64,
        };
    } catch (error) {
        console.error("Error getting AI suggestions:", error);
        throw new Error("Failed to generate AI suggestions. Please try again.");
    }
};

export const generateItineraryFromPrompt = async (
  prompt: string,
  events: Event[],
  lang: Language
): Promise<AIItineraryResponse> => {
    if (!API_KEY || API_KEY === "REPLACE_WITH_YOUR_GEMINI_API_KEY") {
        throw new Error("AI features are disabled. Please configure your Gemini API Key in `services/geminiService.ts`.");
    }
    
    const eventContext = events.map(e => ({
        id: e.id,
        title: e.title[lang] || e.title.en,
        description: (e.description[lang] || e.description.en).substring(0, 100) + '...',
        date: e.date,
        cityId: e.cityId,
        categoryId: e.categoryId
    }));

    try {
        const model = 'gemini-2.5-flash';
        const systemInstruction = `You are a helpful and creative travel planner for Iraq. Your task is to generate a personalized itinerary based on the user's request and a provided list of upcoming events.
        - Analyze the user's prompt to understand their interests, duration, location, and vibe (e.g., family-friendly, adventurous, relaxed).
        - Create a logical and engaging plan. You can suggest general activities (like visiting a bazaar or a park) but you MUST incorporate at least one, and preferably more, events from the provided list if they are relevant.
        - When you include an event from the list, you MUST include its 'eventId' in the corresponding plan item. For general activities without a matching event, omit the 'eventId'.
        - Structure the output as a JSON object that strictly follows the provided schema.
        - Provide the 'itineraryTitle' in English (en), Arabic (ar), and Kurdish (ku).
        - The 'plan' items should be ordered chronologically.

        Available Events: ${JSON.stringify(eventContext)}
        `;

        const response = await ai.models.generateContent({
            model,
            contents: `User's itinerary request: "${prompt}"`,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        itineraryTitle: {
                            type: Type.OBJECT,
                            properties: {
                                en: { type: Type.STRING },
                                ar: { type: Type.STRING },
                                ku: { type: Type.STRING }
                            },
                            required: ["en", "ar", "ku"]
                        },
                        plan: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    day: { type: Type.STRING, description: "e.g., 'Day 1', 'Friday Morning', 'Evening'" },
                                    title: { type: Type.STRING, description: "Title for this part of the plan" },
                                    description: { type: Type.STRING, description: "A brief description of the activity." },
                                    eventId: { type: Type.STRING, description: "The ID of the event from the context list, if applicable." }
                                },
                                required: ["day", "title", "description"]
                            }
                        }
                    },
                    required: ["itineraryTitle", "plan"]
                },
            },
        });

        const itinerary = JSON.parse(response.text.trim());
        return itinerary;

    } catch (error) {
        console.error("Error generating AI itinerary:", error);
        throw new Error("Failed to generate AI itinerary. The model might be unable to fulfill the request with the current events. Please try a different prompt.");
    }
};