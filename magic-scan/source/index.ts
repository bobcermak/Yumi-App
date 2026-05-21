import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from './cors.ts';
import { analyzeWithGemini } from './gemini.ts';
import { analyzeWithGPT } from './gpt.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  try {
    const { image } = await req.json()
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }
    let result: Record<string, unknown>
    let model: string
    try {
      result = await analyzeWithGemini(image) as Record<string, unknown>
      model = 'gemini'
    } catch (geminiError) {
      const msg = geminiError instanceof Error ? geminiError.message : String(geminiError)
      const isRateLimit = msg.includes('429')
      console.error(`Gemini failed (${isRateLimit ? 'rate limit' : 'error'}), falling back to GPT:`, msg)
      result = await analyzeWithGPT(image) as Record<string, unknown>
      model = 'gpt'
    }
    return new Response(
      JSON.stringify({ ...result, model }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('Magic scan failed:', msg)
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})