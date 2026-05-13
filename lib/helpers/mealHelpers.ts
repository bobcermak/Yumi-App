import { MealType } from "@/types/database/dbModels";
import { FoodSearchResult } from "@/types/foodSearchResult";

export const MEAL_TYPES = ["Breakfast", "Morning Snack", "Lunch", "Afternoon Snack", "Dinner"];
export const MEAL_TYPE_MAP: Record<string, MealType> = {
  "Breakfast": "breakfast",
  "Morning Snack": "morning_snack",
  "Lunch": "lunch",
  "Afternoon Snack": "afternoon_snack",
  "Dinner": "dinner"
};
export const prepareMealLogData = (item: FoodSearchResult, mealData: { grams: number, count: number, calories: number }, mealType: string) => {
  const { grams, count } = mealData;
  const type = MEAL_TYPE_MAP[mealType] || "breakfast";
  const factor = grams / 100;
  const singleCalories = Math.round((item.calories_per_100g || 0) * factor);
  const singleMacros = {
    carbs: (item.carbs_per_100g || 0) * factor,
    fat: (item.fat_per_100g || 0) * factor,
    protein: (item.protein_per_100g || 0) * factor,
  };
  const foodId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id) ? item.id : null;
  const singleIngredient = {
    name: item.name || "Unknown Product",
    amount_g: grams,
    calories: singleCalories,
    carbs: singleMacros.carbs,
    fat: singleMacros.fat,
    protein: singleMacros.protein,
    food_id: foodId,
  };
  return {
    mealLog: {
      name: item.name || "Unknown Product",
      type,
      logged_at: new Date().toISOString(),
      total_calories: singleCalories * count,
      total_carbs: singleMacros.carbs * count,
      total_fat: singleMacros.fat * count,
      total_protein: singleMacros.protein * count,
      image_url: item.image_url
    },
    ingredients: Array.from({ length: count }, () => ({ ...singleIngredient }))
  };
};
export const calculateMacros = (factor: number, per100g: number) => factor * per100g;
export const calculateTotalValue = (valuePer100g: number, grams: number, count: number = 1) => {
  return Math.round((valuePer100g * (grams / 100)) * count);
};
export const formatMacroDisplay = (value: number, isPercentaged: boolean, totalMacros: number) => {
  if (isPercentaged) {
    return `${totalMacros > 0 ? Math.round((value / totalMacros) * 100) : 0}%`;
  }
  return `${(value || 0).toFixed(1)}g`;
};
export const getMacroRatio = (value: number, total: number) => {
  return total > 0 ? value / total : 0.33;
};
export const cleanNumericInput = (val: string) => val.replace(/[^0-9]/g, '');
export const getRatingColor = (rating?: number | null): string => {
  if (rating === undefined || rating === null) return "#FFFFFF30";
  if (rating >= 8) return "#84C754";
  if (rating >= 6) return "#C5E384";
  if (rating >= 4) return "#ED8936";
  return "#E53E3E";
};