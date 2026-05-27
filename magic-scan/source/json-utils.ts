import { jsonrepair } from "npm:jsonrepair";

const extractJsonString = (text: string, source: string): string => {
  const start = text.indexOf('<<<JSON_START>>>');
  const end = text.indexOf('<<<JSON_END>>>');
  if (start !== -1 && end !== -1) {
    return text.slice(start + 16, end).trim();
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return match[0];
  throw new Error(`Could not extract JSON from ${source} response`);
};
export const extractAndParseJson = (text: string, source: string): Record<string, unknown> => {
  const jsonStr = extractJsonString(text, source);
  try {
    return JSON.parse(jsonStr);
  } catch (firstError) {
    try {
      return JSON.parse(jsonrepair(jsonStr));
    } catch {
      console.error(`[${source}] Raw JSON that failed to parse:\n${jsonStr}`);
      throw firstError;
    }
  }
};