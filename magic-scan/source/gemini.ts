import { PROMPT } from './prompt.ts';

export async function analyzeWithGemini(base64Image: string): Promise<object> {
  const apiKey = Deno.env.get('GEMINI_API_KEY')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
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
  if (!response.ok) throw new Error(`Gemini failed: ${response.status}`)
  const data = await response.json()
  const text = data.candidates[0].content.parts[0].text
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}