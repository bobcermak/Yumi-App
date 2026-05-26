import { PROMPT } from './prompt.ts';

const sanitizeJsonEmojis = (text: string): string => {
  return text.replace(/"emoji"\s*:\s*(?!")([^,\}\n\r]+)/g, (_match, value) => {
    return `"emoji": "${value.trim()}"`;
  });
};
const extractJson = (text: string): Record<string, unknown> => {
  const start = text.indexOf('<<<JSON_START>>>')
  const end = text.indexOf('<<<JSON_END>>>')
  if (start !== -1 && end !== -1) {
    return JSON.parse(sanitizeJsonEmojis(text.slice(start + 16, end).trim()))
  }
  const match = text.match(/\{[\s\S]*\}/)
  if (match) return JSON.parse(sanitizeJsonEmojis(match[0]))
  throw new Error('Could not extract JSON from Gemini response')
}
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent`
const callGemini = (base64Image: string, apiKey: string) =>
  fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: PROMPT }, { inline_data: { mime_type: 'image/jpeg', data: base64Image } }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 1024 }
    })
  })
export const analyzeWithGemini = async (base64Image: string): Promise<Record<string, unknown>> => {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const response = await callGemini(base64Image, apiKey)
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini ${response.status}: ${body}`)
  }
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  return extractJson(text)
}