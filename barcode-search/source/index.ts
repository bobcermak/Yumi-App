import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { computeHealthRating } from "./healthRating.ts";
import { fetchFromOpenFoodFacts } from "./openFoodFacts.ts";
import { findFoodByBarcode, insertFood } from "./db.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { barcode, userId: bodyUserId } = await req.json();
    if (!barcode) {
      return new Response(JSON.stringify({ error: "Barcode is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );
    const newFood = await fetchFromOpenFoodFacts(barcode);
    if (!newFood) {
      return new Response(JSON.stringify({ error: "Product not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const existingFood = await findFoodByBarcode(
      supabase,
      barcode,
      newFood.name,
      newFood.brand,
    );
    if (existingFood) {
      const updateData: any = {};
      if (!existingFood.barcode) updateData.barcode = barcode;
      if (!existingFood.image_url && newFood.image_url) {
        updateData.image_url = newFood.image_url;
      }
      if (Object.keys(updateData).length === 0) {
        return new Response(JSON.stringify({ ...existingFood, source: "database" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: updatedFood, error } = await supabase
        .from("foods")
        .update(updateData)
        .eq("id", existingFood.id)
        .select()
        .single();
      const resultData = error ? { ...existingFood, ...updateData } : updatedFood;
      return new Response(JSON.stringify({ ...resultData, source: "database" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    let userId: string | null = bodyUserId ?? null;
    if (!userId) {
      const authHeader = req.headers.get("Authorization");
      if (authHeader) {
        try {
          const token = authHeader.replace("Bearer ", "").trim();
          const { data: { user } } = await supabase.auth.getUser(token);
          if (user) userId = user.id;
        } catch (e) {
          console.error("Auth error:", e);
        }
      }
    }
    console.log(`[BarcodeSearch] created_by will be: ${userId ?? "NULL"}`);
    const health_rating = computeHealthRating({
      calories_per_100g: newFood.calories_per_100g,
      protein_per_100g: newFood.protein_per_100g,
      fat_per_100g: newFood.fat_per_100g,
      carbs_per_100g: newFood.carbs_per_100g,
      category: newFood.category,
      source: "openfoodfacts",
    });
    const { data: insertedFood, error: insertError } = await insertFood(supabase, {
      ...newFood,
      health_rating,
      created_by: userId,
    });
    if (insertError) {
      console.error("[BarcodeSearch] Insert error:", insertError);
      const retry = await findFoodByBarcode(supabase, barcode, newFood.name, newFood.brand);
      if (retry) {
        return new Response(JSON.stringify({ ...retry, source: "database" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    const result = insertError
      ? { ...newFood, health_rating, created_by: userId, source: "openfoodfacts" }
      : { ...insertedFood, source: "openfoodfacts" };
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});