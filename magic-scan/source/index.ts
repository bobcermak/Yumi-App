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
    try {
      const result = await analyzeWithGemini(image)
      return new Response(
        JSON.stringify({ ...result, model: 'gemini' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (geminiError) {
      console.error('Gemini failed, trying GPT:', geminiError)
    }
    const result = await analyzeWithGPT(image)
    return new Response(
      JSON.stringify({ ...result, model: 'gpt' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Analysis failed', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})