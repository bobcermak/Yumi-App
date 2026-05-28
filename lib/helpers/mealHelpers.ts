import { MealType } from "@/types/database/dbModels";
import { FoodSearchResult } from "@/types/foodSearchResult";

export const getMealTimingFactor = (type: string, hour: number): number => {
  switch (type) {
    case "breakfast":
      if (hour >= 5 && hour < 10) return 1.0;
      if (hour >= 10 && hour < 12) return 0.9;
      return 0.75;
    case "morning_snack":
      if (hour >= 9 && hour < 13) return 1.0;
      if (hour >= 7 && hour < 15) return 0.9;
      return 0.8;
    case "lunch":
      if (hour >= 11 && hour < 15) return 1.0;
      if (hour >= 10 && hour < 17) return 0.9;
      return 0.8;
    case "afternoon_snack":
      if (hour >= 14 && hour < 19) return 1.0;
      if (hour >= 12 && hour < 21) return 0.9;
      return 0.8;
    case "dinner":
      if (hour >= 17 && hour < 21) return 1.0;
      if (hour >= 15 && hour < 23) return 0.85;
      return 0.65;
    default:
      return 1.0;
  }
};
export const MEAL_TYPES = [
  "Breakfast",
  "Morning Snack",
  "Lunch",
  "Afternoon Snack",
  "Dinner",
];
export const MEAL_TYPE_MAP: Record<string, MealType> = {
  Breakfast: "breakfast",
  "Morning Snack": "morning_snack",
  Lunch: "lunch",
  "Afternoon Snack": "afternoon_snack",
  Dinner: "dinner",
};
export const prepareMealLogData = (
  item: FoodSearchResult,
  mealData: { grams: number; count: number; calories: number },
  mealType: string,
) => {
  const { grams, count } = mealData;
  const type = MEAL_TYPE_MAP[mealType] || "breakfast";
  const factor = grams / 100;
  const singleCalories = Math.round((item.calories_per_100g || 0) * factor);
  const singleMacros = {
    carbs: (item.carbs_per_100g || 0) * factor,
    fat: (item.fat_per_100g || 0) * factor,
    protein: (item.protein_per_100g || 0) * factor,
  };
  const rating = item.health_rating ?? computeHealthRating({
    calories_per_100g: item.calories_per_100g || 0,
    protein_per_100g: item.protein_per_100g || 0,
    fat_per_100g: item.fat_per_100g || 0,
    carbs_per_100g: item.carbs_per_100g || 0,
  });
  const foodId =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      item.id,
    )
      ? item.id
      : null;
  const totalIngredient = {
    name: item.name || "Unknown Product",
    amount_g: Math.round(grams * count),
    calories: singleCalories * count,
    carbs: Math.round(singleMacros.carbs * count),
    fat: Math.round(singleMacros.fat * count),
    protein: Math.round(singleMacros.protein * count),
    food_id: foodId,
  };
  return {
    mealLog: {
      name: item.name || "Unknown Product",
      type,
      logged_at: new Date().toISOString(),
      total_calories: singleCalories * count,
      total_carbs: Math.round(singleMacros.carbs * count),
      total_fat: Math.round(singleMacros.fat * count),
      total_protein: Math.round(singleMacros.protein * count),
      image_url: item.image_url,
      rating,
    },
    ingredients: [totalIngredient],
  };
};
export const calculateMacros = (factor: number, per100g: number) =>
  factor * per100g;
export const calculateTotalValue = (
  valuePer100g: number,
  grams: number,
  count: number = 1,
) => {
  return Math.round(valuePer100g * (grams / 100) * count);
};
export const formatMacroDisplay = (
  value: number,
  isPercentaged: boolean,
  totalMacros: number,
) => {
  if (isPercentaged) {
    return `${totalMacros > 0 ? Math.round((value / totalMacros) * 100) : 0}%`;
  }
  return `${(value || 0).toFixed(1)}g`;
};
export const getMacroRatio = (value: number, total: number) => {
  return total > 0 ? value / total : 0.33;
};
export const cleanNumericInput = (val: string) => val.replace(/[^0-9]/g, "");
export const computeHealthRating = (food: {
  calories_per_100g: number;
  protein_per_100g: number;
  fat_per_100g: number;
  carbs_per_100g: number;
}): number => {
  const cal = food.calories_per_100g || 0;
  const protein = food.protein_per_100g || 0;
  const fat = food.fat_per_100g || 0;
  const carbs = food.carbs_per_100g || 0;
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
  return Math.min(10, Math.max(0, Math.round(score * 10) / 10));
};
export const getRatingColor = (rating?: number | null): string => {
  if (rating === undefined || rating === null) return "#FFFFFF30";
  if (rating >= 8) return "#84C754";
  if (rating >= 6) return "#C5E384";
  if (rating >= 4) return "#ED8936";
  return "#E53E3E";
};