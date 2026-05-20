import { PROMPT } from './prompt.ts';

const extractJson = (text: string): Record<string, unknown> => {
  const start = text.indexOf('<<<JSON_START>>>')
  const end = text.indexOf('<<<JSON_END>>>')
  if (start === -1 || end === -1) throw new Error('Missing JSON markers in Gemini response')
  return JSON.parse(text.slice(start + 16, end).trim())
}
export const analyzeWithGemini = async (base64Image: string): Promise<Record<string, unknown>> => {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: PROMPT },
            { inline_data: { mime_type: 'image/jpeg', data: base64Image } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
      })
    }
  )
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Gemini ${response.status}: ${body}`)
  }
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  return extractJson(text)
}