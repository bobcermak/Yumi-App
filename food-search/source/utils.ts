export const normalizeText = (text: any): string => {
  if (!text) return "";
  return String(text).normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "") 
    .replace(/[.,\-()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};
export const mapToYumiCategory = (rawCat: string, reqCategory: string, source: string): string => {
  if (reqCategory && reqCategory !== "all") return reqCategory;
  const c = rawCat.toLowerCase();
  if (c.includes("fruit")) return "fruits";
  if (c.includes("vegetable") || c.includes("squash") || c.includes("pumpkin") || c.includes("radish") || c.includes("mushroom")) return "vegetables";
  if (source === "openfoodfacts") return "packaged";
  return "other";
};
const PRODUCE_BLACKLIST = [
  "juice", "smoothie", "drink", "nectar", "sauce", "puree", "jam", "jelly", "preserve",
  "dried", "canned", "frozen", "cooked", "baked", "fried", "syrup", "powder", "extract",
  "pizza", "burger", "sandwich", "pasta", "soup", "stew", "snack", "candy", "cookie", 
  "cake", "pie", "bread", "roll", "wrap", "taco", "burrito", "dish", "meal", "dressing", 
  "dip", "mix", "blend"
];
export const scoreResult = (food: any, query: string, category: string = ""): number => {
  const nQuery = normalizeText(query);
  const nName = normalizeText(food.name ?? "");
  const nBrand = normalizeText(food.brand ?? "");
  const combined = `${nBrand} ${nName}`.trim();
  if (category === "fruits" || category === "vegetables") {
    if (PRODUCE_BLACKLIST.some(b => new RegExp(`\\b${b}\\b`).test(combined))) return 0;
    const isFruit = category === "fruits";
    const usdaCat = (food.foodCategory || "").toLowerCase();
    const isExactUsdaCategory = isFruit 
      ? usdaCat.includes("fruits and fruit juices")
      : usdaCat.includes("vegetables and vegetable products") || usdaCat.includes("legumes");
    const keywords = isFruit 
      ? ["fruit", "berry", "apple", "banana", "strawberry", "blueberry", "watermelon", "melon", "cherry", "pear", "plum", "peach", "grape", "orange", "lemon", "mango", "pineapple", "kiwi", "apricot"]
      : ["vegetable", "broccoli", "carrot", "tomato", "cucumber", "spinach", "lettuce", "pepper", "onion", "garlic", "potato", "cabbage", "cauliflower", "zucchini", "eggplant", "bean", "pea", "corn", "mushroom", "kale", "celery", "squash", "pumpkin", "radish"];
    const hasKeyword = isExactUsdaCategory || keywords.some(k => new RegExp(`\\b${k}\\b`).test(combined));
    if (!hasKeyword) return 0;
  }
  let score = 0;
  const qFirst = nQuery.split(" ")[0];
  const nFirst = nName.split(" ")[0];
  const isPluralMatch = (w1: string, w2: string) => {
    if (!w1 || !w2) return false;
    return w1 === w2 || 
           w1 + "s" === w2 || w2 + "s" === w1 || 
           w1 + "es" === w2 || w2 + "es" === w1 || 
           w1.replace(/y$/, "ies") === w2 || w2.replace(/y$/, "ies") === w1;
  };
  if (nName === nQuery || nBrand === nQuery) score = 100;
  else if (isPluralMatch(qFirst, nFirst) && nName.includes("raw")) score = 95; 
  else if (nBrand.startsWith(nQuery)) score = 90;
  else if (nName.startsWith(nQuery) || isPluralMatch(qFirst, nFirst)) score = 85;
  else if (nBrand.includes(nQuery)) score = 70;
  else if (nName.includes(nQuery)) score = 60;
  else if (combined.includes(nQuery)) score = 50;
  else {
    const queryWords = nQuery.split(/\s+/);
    const matchedWords = queryWords.filter((w) => {
      return combined.includes(w) || combined.includes(w + "s") || combined.includes(w.replace(/y$/, "ies"));
    });
    score = (matchedWords.length / queryWords.length) * 40;
  }
  if ((category === "fruits" || category === "vegetables") && combined.includes("raw")) {
    score += 20;
  }
  const nameTokens = nName.split(/[\s,]+/).filter(Boolean).length;
  if (nameTokens <= 2) score += 15;
  else if (nameTokens <= 4) score += 5;
  return score;
};
export const computeHealthRating = (food: {
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
  category?: string;
  source?: string;
}): number => {
  const cal = food.calories_per_100g || 0;
  const protein = food.protein_per_100g || 0;
  const fat = food.fat_per_100g || 0;
  const carbs = food.carbs_per_100g || 0;
  const category = (food.category || "").toLowerCase();
  const source = (food.source || "").toLowerCase();
  if (cal === 0 && protein === 0 && fat === 0 && carbs === 0) return 5.0;
  let score = 5.0;
  if (cal <= 30) score += 2.0;
  else if (cal <= 60) score += 1.5;
  else if (cal <= 100) score += 1.0;
  else if (cal <= 150) score += 0.5;
  else if (cal <= 250) score += 0.0;
  else if (cal <= 400) score -= 1.0;
  else if (cal <= 500) score -= 2.0;
  else score -= 3.0;
  if (protein >= 20) score += 1.5;
  else if (protein >= 10) score += 1.0;
  else if (protein >= 5) score += 0.5;
  if (fat >= 30) score -= 2.0;
  else if (fat >= 20) score -= 1.0;
  else if (fat >= 10) score -= 0.5;
  if (carbs >= 60) score -= 1.0;
  else if (carbs >= 40) score -= 0.5;
  if (category === "fruits") score += 1.5;
  else if (category === "vegetables") score += 2.0;
  if (source === "openfoodfacts") score -= 0.5;
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};