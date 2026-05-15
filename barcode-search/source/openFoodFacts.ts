export const fetchFromOpenFoodFacts = async (barcode: string) => {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`);
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  const p = data.product;
  const n = p.nutriments || {};
  return {
    name: p.product_name_cs || p.product_name || p.product_name_en || "Unknown Product",
    brand: p.brands ? p.brands.split(",")[0].trim() : null,
    calories_per_100g: Math.round(n["energy-kcal_100g"] || n["energy-kcal"] || 0),
    protein_per_100g: n.proteins_100g || 0,
    carbs_per_100g: n.carbohydrates_100g || 0,
    fat_per_100g: n.fat_100g || 0,
    image_url: p.image_front_url || p.image_url || null,
    barcode,
    is_public: true,
    czech_name: p.product_name_cs || null,
    category: "packaged",
  };
};