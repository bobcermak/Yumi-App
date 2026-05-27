import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "./cors.ts";
import { DEFAULTS_EN, DEFAULTS_CS, HARDCODED_IMAGES } from "./constants.ts";
import { scoreResult, computeHealthRating } from "./utils.ts";
import { translateQuery, fetchSingleQuery, fetchFoodImages } from "./api.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    const body = await req.json();
    const rawQuery = body.query || "";
    const category = (body.category || "all").toLowerCase().trim();
    const foodType = (body.foodType || "all").toLowerCase().trim();
    const isProduce = category === "fruits" || category === "vegetables";
    const isEmptyQuery = rawQuery.trim().length < 2;
    const keys = {
      usda: Deno.env.get("USDA_API_KEY") || "",
      pix: Deno.env.get("PIXABAY_API_KEY") || "",
      unsplash: Deno.env.get("UNSPLASH_ACCESS_KEY") || "",
      msKey: Deno.env.get("MS_TRANSLATOR_KEY") || "",
      msRegion: Deno.env.get("MS_TRANSLATOR_REGION") || "",
    };
    let userId = null;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    if (authHeader && supabaseUrl && supabaseAnonKey) {
      try {
        const token = authHeader.replace("Bearer ", "").trim();
        const authClient = createClient(supabaseUrl, supabaseAnonKey);
        const { data: { user } } = await authClient.auth.getUser(token);
        if (user) userId = user.id;
      } catch (e) { console.error("Auth error:", e); }
    }
    let results: any[] = [];
    const seen = new Set<string>();
    if (isEmptyQuery) {
      let tasks: { en: string; cs: string; cat: string }[] = [];
      if (isProduce) {
        tasks = DEFAULTS_EN[category].map((en, i) => ({ 
          en, cs: DEFAULTS_CS[category][i], cat: category 
        }));
      } else if (category === "all") {
        tasks = [
          { en: "Banana", cs: "Banán", cat: "fruits" },
          { en: "Apple", cs: "Jablko", cat: "fruits" },
          { en: "Strawberry", cs: "Jahoda", cat: "fruits" },
          { en: "Broccoli", cs: "Brokolice", cat: "vegetables" },
          { en: "Carrot", cs: "Mrkev", cat: "vegetables" },
        ];
      }
      if (tasks.length > 0) {
        const partResults = await Promise.all(tasks.map(t => fetchSingleQuery(t.cs, t.en, t.cat, foodType, keys)));
        for (let i = 0; i < partResults.length; i++) {
          const t = tasks[i];
          const scored = partResults[i].map((f: any) => ({ ...f, _score: scoreResult(f, t.en, t.cat) })).filter(f => f._score > 0).sort((a: any, b: any) => b._score - a._score);
          const best = scored[0];
          if (best && !seen.has(best.id)) { 
            seen.add(best.id); 
            best._imgTerm = HARDCODED_IMAGES[t.en] || t.en; 
            best.czech_name = t.cs; 
            results.push(best); 
          }
        }
      }
    } else {
      const t = await translateQuery(rawQuery.trim(), keys.msKey, keys.msRegion);
      const rawRes = await fetchSingleQuery(rawQuery.trim(), t.text, category, foodType, keys);
      results = rawRes.map((f: any) => ({ 
        ...f, 
        _score: Math.max(scoreResult(f, rawQuery.trim(), category), scoreResult(f, t.text, category)) 
      })).filter(f => f._score > 0).sort((a: any, b: any) => b._score - a._score);
      results.forEach(r => { 
        r._imgTerm = t.text;
        if (!r.czech_name) r.czech_name = rawQuery.trim(); 
      });
    }
    let finalResults = results.slice(0, 10).map(({ _score, ...f }: any) => ({
      ...f,
      health_rating: computeHealthRating(f),
    }));
    if (finalResults.length > 0) {
      const usedImgs = new Set<string>();
      finalResults.forEach(r => { 
        if (r.image_url && r.image_url.startsWith("http")) usedImgs.add(r.image_url); 
        else r.image_url = null;
      });
      const needsImg = finalResults.filter(r => !r.image_url);
      if (needsImg.length > 0) {
        const imgQueries = [...new Set(needsImg.map(r => r._imgTerm || r.name.split(',')[0].replace(/[^a-zA-Z\s]/g, "").trim()))];
        const imgPool = new Map();
        await Promise.all(imgQueries.map(async (q) => {
          const imgs = await fetchFoodImages(q, keys.pix, keys.unsplash);
          imgPool.set(q, imgs);
        }));
        finalResults = finalResults.map(r => {
          if (r.image_url) { delete r._imgTerm; return r; }
          const term = r._imgTerm || r.name.split(',')[0].replace(/[^a-zA-Z\s]/g, "").trim();
          const available = (imgPool.get(term) || []).filter(img => !usedImgs.has(img));
          const selected = available.length > 0 ? available[0] : (imgPool.get(term) || [])[0];
          if (selected) usedImgs.add(selected);
          r.image_url = selected || null;
          delete r._imgTerm;
          return r;
        });
      }
    }
    if (finalResults.length > 0) {
      const supabaseAdminKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || supabaseAnonKey;
      if (supabaseUrl && supabaseAdminKey) {
        const supabaseAdmin = createClient(supabaseUrl, supabaseAdminKey);
        const uniqueFinalResults = Array.from(new Map(finalResults.map((r: any) => [r.name, r])).values());
        const incomingNames = uniqueFinalResults.map((r: any) => r.name);
        const { data: existingFoods } = await supabaseAdmin.from("foods").select("id, name, barcode, image_url").in("name", incomingNames);
        const existingMap = new Map<string, any>(existingFoods?.map((f: any) => [f.name, f]) || []);
        const toInsert: any[] = [];
        const toUpdate: any[] = [];
        const uploadImage = async (imageUrl: string, name: string): Promise<string | null> => {
          try {
            const res = await fetch(imageUrl, { signal: AbortSignal.timeout(5000) });
            if (!res.ok) return null;
            const buffer = await res.arrayBuffer();
            if (buffer.byteLength > 400_000) return null;
            // Deterministic path — no timestamp, so the same food never creates duplicate files
            const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 40);
            const path = `${slug}.jpg`;
            const { error } = await supabaseAdmin.storage.from('foods').upload(path, new Uint8Array(buffer), { contentType: 'image/jpeg', upsert: true });
            if (error) return null;
            return supabaseAdmin.storage.from('foods').getPublicUrl(path).data.publicUrl;
          } catch { return null; }
        };
        for (const r of uniqueFinalResults as any[]) {
          const existing: any = existingMap.get(r.name);
          if (!existing) {
            const storageUrl = r.image_url ? await uploadImage(r.image_url, r.name) : null;
            toInsert.push({
              created_by: userId,
              name: r.name,
              brand: r.brand || null,
              calories_per_100g: Math.round(r.calories_per_100g || 0),
              protein_per_100g: r.protein_per_100g || 0,
              carbs_per_100g: r.carbs_per_100g || 0,
              fat_per_100g: r.fat_per_100g || 0,
              image_url: storageUrl || r.image_url || null,
              barcode: r.barcode || null,
              czech_name: r.czech_name || null,
              category: r.foodCategory || r.category || null,
              is_public: true,
              health_rating: computeHealthRating(r)
            });
          } else {
            const updates: Record<string, any> = {};
            if (!existing.barcode && r.barcode) updates.barcode = r.barcode;
            if (!existing.image_url && r.image_url) {
              const storageUrl = await uploadImage(r.image_url, r.name);
              if (storageUrl) updates.image_url = storageUrl;
            }
            if (Object.keys(updates).length > 0) toUpdate.push({ id: existing.id, ...updates });
          }
        }
        if (toInsert.length > 0) {
          const { error: insertError } = await supabaseAdmin.from("foods").upsert(toInsert, { onConflict: 'name', ignoreDuplicates: true });
          if (insertError) console.error("[DB Insert Error]:", insertError);
        }
        if (toUpdate.length > 0) {
          for (const { id, ...fields } of toUpdate) {
            const { error: updateError } = await supabaseAdmin.from("foods").update(fields).eq("id", id);
            if (updateError) console.error("[DB Update Error]:", updateError);
          }
        }
      }
    }
    return new Response(JSON.stringify(finalResults), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});