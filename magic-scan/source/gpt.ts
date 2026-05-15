import { PROMPT } from './prompt.ts';

export async function analyzeWithGPT(base64Image: string): Promise<object> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      max_tokens: 500,
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
  if (!response.ok) throw new Error(`GPT failed: ${response.status}`)
  const data = await response.json()
  const text = data.choices[0].message.content
  return JSON.parse(text.replace(/```json|```/g, '').trim())
}