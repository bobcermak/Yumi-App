import { PROMPT } from './prompt.ts';

const extractJson = (text: string): Record<string, unknown> => {
  const start = text.indexOf('<<<JSON_START>>>')
  const end = text.indexOf('<<<JSON_END>>>')
  if (start !== -1 && end !== -1) {
    return JSON.parse(text.slice(start + 16, end).trim())
  }
  const match = text.match(/\{[\s\S]*\}/)
  if (match) return JSON.parse(match[0])
  throw new Error('Could not extract JSON from GPT response')
}
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
  return extractJson(text)
}