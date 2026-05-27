import { PROMPT } from './prompt.ts';
import { extractAndParseJson } from './json-utils.ts';

export const analyzeWithGPT = async (base64Image: string): Promise<Record<string, unknown>> => {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) throw new Error('OPENAI_API_KEY not set')
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          {
            type: 'image_url',
            image_url: { url: `data:image/jpeg;base64,${base64Image}` }
          }
        ]
      }]
    })
  })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`GPT ${response.status}: ${body}`)
  }
  const data = await response.json()
  const text = data.choices[0].message.content
  return extractAndParseJson(text, 'GPT')
}