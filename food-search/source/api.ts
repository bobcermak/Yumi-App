import { mapToYumiCategory } from "./utils.ts";
import { BRAND_KEYWORDS } from "./constants.ts";

export const translateQuery = async (query: string, msKey: string, msRegion: string): Promise<{ text: string }> => {
  if (!query || query.trim() === "") return { text: query };
  const qLower = query.toLowerCase();
  if (BRAND_KEYWORDS.some(brand => qLower.includes(brand))) {
      return { text: query };
  }
  try {
    const res = await fetch("https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=cs&to=en", {
      method: "POST",
      headers: { 
        "Ocp-Apim-Subscription-Key": msKey, 
        "Ocp-Apim-Subscription-Region": msRegion, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify([{ Text: query }]),
    });
    const data = await res.json();
    return { text: data[0].translations[0].text };
  } catch { return { text: query }; }
};
export const fetchFoodImages = async (query: string, pixabayKey: string, unsplashKey: string): Promise<string[]> => {
  const qLower = query.toLowerCase();
  const exclude = "-animal -pet -wildlife -zoo -bird -tech -phone -computer";
  const isBrandQuery = BRAND_KEYWORDS.some(brand => qLower.includes(brand));
  const context = isBrandQuery ? "product" : "food ingredient";
  const pixQuery = encodeURIComponent(`${query} ${context} ${exclude}`);
  const unsQuery = encodeURIComponent(`${query} food photography dish`);
  const images: string[] = [];
  try {
    const res = await fetch(`https://pixabay.com/api/?key=${pixabayKey}&q=${pixQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=30`);
    const data = await res.json();
    if (data.hits) images.push(...data.hits.map((h: any) => h.largeImageURL || h.webformatURL));
  } catch {}
  if (images.length < 10 && unsplashKey) {
    try {
      const res = await fetch(`https://api.unsplash.com/search/photos?query=${unsQuery}&client_id=${unsplashKey}&per_page=20&orientation=landscape`);
      const data = await res.json();
      if (data.results) images.push(...data.results.map((r: any) => r.urls.regular));
    } catch {}
  }
  return images;
};
export const searchOFF = async (query: string, region: string, category: string) => {
  let url = `https://${region}.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=20&fields=id,code,product_name,product_name_cs,product_name_en,brands,nutriments,image_url,image_front_url,image_front_small_url,categories`;
  if (category && category !== "all") url += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(category)}`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Yumi-App/1.0 (bohuslavcermak62@gmail.com)" } });
    const data = await res.json();
    return (data.products || []).map((p: any) => {
      const rawCat = p.categories ? p.categories.split(",")[0].trim() : "";
      const offImage = p.image_front_url || p.image_url || p.image_front_small_url || null;
      return {
        id: `off_${p.id || p.code}`,
        name: p.product_name_cs || p.product_name || p.product_name_en || "Neznámé",
        brand: p.brands?.split(",")[0].trim() || null,
        calories_per_100g: p.nutriments?.energy_kcal_100g || (p.nutriments?.energy_100g ? p.nutriments.energy_100g / 4.184 : 0),
        fat_per_100g: p.nutriments?.fat_100g || 0,
        carbs_per_100g: p.nutriments?.carbohydrates_100g || 0,
        protein_per_100g: p.nutriments?.proteins_100g || 0,
        image_url: offImage, 
        barcode: p.code || p.id || null,
        czech_name: p.product_name_cs || p.product_name || null,
        source: "openfoodfacts",
        category: mapToYumiCategory(rawCat, category, "openfoodfacts"),
        foodCategory: rawCat 
      };
    });
  } catch { return []; }
};
export const searchUSDA = async (query: string, key: string, foodType: string, category: string): Promise<any[]> => {
  let url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&api_key=${key}&pageSize=30`;
  if (foodType === "raw" || category === "fruits" || category === "vegetables" || foodType === "homemade") {
    url += `&dataType=Foundation&dataType=SR%20Legacy`;
  }
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.foods || []).map((f: any) => {
      const getNut = (n: string, unit?: string) => {
        const match = f.foodNutrients?.find((nut: any) => {
          const nameMatch = nut.nutrientName.toLowerCase().includes(n.toLowerCase());
          if (unit) return nameMatch && (nut.unitName || "").toLowerCase() === unit.toLowerCase();
          return nameMatch;
        });
        return match?.value || 0;
      };
      const rawCat = f.foodCategory || "";
      return {
        id: `usda_${f.fdcId}`,
        name: f.description,
        brand: f.brandOwner ?? f.brandName ?? null,
        calories_per_100g: getNut("Energy", "kcal"),
        fat_per_100g: getNut("Total lipid (fat)"),
        carbs_per_100g: getNut("Carbohydrate, by difference"),
        protein_per_100g: getNut("Protein"),
        image_url: null,
        barcode: null,
        czech_name: null,
        source: "usda",
        category: mapToYumiCategory(rawCat, category, "usda"),
        foodCategory: rawCat
      };
    });
  } catch { return []; }
};
export const fetchSingleQuery = async (cs: string, en: string, category: string, foodType: string, keys: any): Promise<any[]> => {
  if (category === "fruits" || category === "vegetables") return await searchUSDA(en, keys.usda, "raw", category);
  if (foodType === "packaged" || foodType === "branded") return await searchOFF(cs, "cz", category);
  if (foodType === "homemade" || foodType === "raw") return await searchUSDA(en, keys.usda, "homemade", category);
  const offRes = await searchOFF(cs, "cz", category);
  if (offRes.length > 0) return offRes;
  return await searchUSDA(en, keys.usda, "all", category);
};