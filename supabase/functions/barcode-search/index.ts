import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { barcode } = await req.json()
    
    if (!barcode) {
      return new Response(JSON.stringify({ error: 'Barcode is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[BarcodeSearch] Scanning: ${barcode}`)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Check local DB first
    const { data: existingFood, error: dbError } = await supabase
      .from('foods')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle()

    if (existingFood) {
      console.log(`[BarcodeSearch] Found in DB: ${existingFood.name}`)
      return new Response(JSON.stringify({ ...existingFood, source: 'database' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Not in DB, fetch from OpenFoodFacts (only)
    console.log(`[BarcodeSearch] Fetching from OpenFoodFacts: ${barcode}`)
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    const offRes = await fetch(offUrl)
    const offData = await offRes.json()

    if (offData.status !== 1 || !offData.product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const p = offData.product
    const n = p.nutriments || {}

    // Map OFF data to our Food schema (matching supabase.types.ts)
    const newFood = {
      name: p.product_name || p.product_name_en || 'Unknown Product',
      brand: p.brands ? p.brands.split(',')[0].trim() : null,
      calories_per_100g: n['energy-kcal_100g'] || n['energy-kcal'] || 0,
      protein_per_100g: n.proteins_100g || 0,
      carbs_per_100g: n.carbohydrates_100g || 0,
      fat_per_100g: n.fat_100g || 0,
      image_url: p.image_url || p.image_front_url || null,
      barcode: barcode,
      log_count: 1
    }

    // 3. Create food in DB
    const { data: insertedFood, error: insertError } = await supabase
      .from('foods')
      .insert(newFood)
      .select()
      .single()

    if (insertError) {
      console.error('[BarcodeSearch] Insert error:', insertError)
      // Return mapped data anyway if DB fails
      return new Response(JSON.stringify({ ...newFood, source: 'openfoodfacts' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`[BarcodeSearch] Created new entry: ${insertedFood.name} | ${insertedFood.calories_per_100g} kcal`)
    return new Response(JSON.stringify({ ...insertedFood, source: 'openfoodfacts' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('[BarcodeSearch] Fatal error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})