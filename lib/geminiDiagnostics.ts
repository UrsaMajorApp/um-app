// Gemini diagnostics: отправляет prompt модели и парсит JSON-ответ для диагностического отчета.
import type { JsonObject, JsonValue } from '$types/index';

const GEMINI_MODEL = 'gemini-2.5-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const GEMINI_FALLBACK_PREFIX = 'GEMINI_FALLBACK:';

type GeminiResponse = {
  error?: {
    status?: string;
  };
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

function parseGeminiJson<T extends JsonValue>(text: string): T {
  return JSON.parse(
    text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim(),
  ) as T;
}

export async function generateGeminiDiagnosticJson<T extends JsonObject = JsonObject>(
  prompt: string,
): Promise<T> {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  const enabled = process.env.EXPO_PUBLIC_ENABLE_GEMINI_DIAGNOSTICS === 'true';

  if (!enabled) {
    throw new Error(`${GEMINI_FALLBACK_PREFIX} diagnostics disabled`);
  }

  if (!apiKey) {
    throw new Error(`${GEMINI_FALLBACK_PREFIX} API key missing`);
  }

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7 },
    }),
  });

  const data = (await response.json().catch(() => ({}))) as GeminiResponse;

  if (!response.ok) {
    const status = data?.error?.status || `HTTP_${response.status}`;
    throw new Error(`${GEMINI_FALLBACK_PREFIX} request failed: ${status}`);
  }

  const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
  return parseGeminiJson<T>(textOutput);
}

export function isGeminiFallbackError(error: unknown) {
  return error instanceof Error && error.message.startsWith(GEMINI_FALLBACK_PREFIX);
}
