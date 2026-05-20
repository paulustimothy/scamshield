import { GoogleGenAI } from "@google/genai";

// Gather all configured API keys
const keys: string[] = [];
if (process.env.GEMINI_API_KEY) {
  // Support comma-separated keys
  keys.push(...process.env.GEMINI_API_KEY.split(',').map(k => k.trim()).filter(Boolean));
}

// Also check for GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.
let index = 1;
while (process.env[`GEMINI_API_KEY_${index}`]) {
  const key = process.env[`GEMINI_API_KEY_${index}`]?.trim();
  if (key && !keys.includes(key)) {
    keys.push(key);
  }
  index++;
}

// Fallback to empty string if no keys provided, which will fail gracefully at the SDK layer
if (keys.length === 0) {
  keys.push("");
}

// Create a pool of client instances
const clients = keys.map(key => new GoogleGenAI({ apiKey: key }));

// Main helper to execute API calls with key rotation and model fallback
async function executeWithFallback<T>(
  fnName: 'generateContent' | 'generateContentStream',
  params: any
): Promise<T> {
  const originalModel = params.model || 'gemini-2.0-flash';
  
  // Define model fallbacks: if the requested model fails, try gemini-2.5-flash, then gemini-flash-latest.
  const modelsToTry = [originalModel];
  if (originalModel !== 'gemini-2.5-flash') {
    modelsToTry.push('gemini-2.5-flash');
  }
  if (originalModel !== 'gemini-flash-latest') {
    modelsToTry.push('gemini-flash-latest');
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let keyIdx = 0; keyIdx < clients.length; keyIdx++) {
      const client = clients[keyIdx];
      const modelParams = {
        ...params,
        model,
      };

      try {
        console.log(`[Gemini Client] Attempting ${fnName} using key index ${keyIdx} and model "${model}"...`);
        const result = await (client.models[fnName] as any)(modelParams);
        return result;
      } catch (error: any) {
        lastError = error;
        const errorMsg = error?.message || (typeof error === 'object' ? JSON.stringify(error) : String(error));
        console.warn(
          `[Gemini Client] Error with key index ${keyIdx} and model "${model}": ${errorMsg.substring(0, 300)}`
        );
        
        // Continue loop to try the next key or next model fallback
      }
    }
  }

  // If we reach here, all attempts failed
  throw lastError || new Error(`Gemini API call failed after trying all API keys and model fallbacks.`);
}

// Construct a transparent proxy/wrapper object matching the SDK shape
const ai = {
  models: {
    generateContent: (params: any) => executeWithFallback<any>('generateContent', params),
    generateContentStream: (params: any) => executeWithFallback<any>('generateContentStream', params),
  },
};

export const geminiModel = ai.models;
export default ai;
