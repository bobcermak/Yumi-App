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
  const type = MEAL_TYPE_MAP[mealType] || "breakfast";
  const factor = mealData.grams / 100;
  const totalMacros = {
    carbs: (item.carbs_per_100g || 0) * factor * mealData.count,
    fat: (item.fat_per_100g || 0) * factor * mealData.count,
    protein: (item.protein_per_100g || 0) * factor * mealData.count,
  };
  return {
    mealLog: {
      name: item.name || "Unknown Product",
      type,
      logged_at: new Date().toISOString(),
      total_calories: mealData.calories,
      total_carbs: totalMacros.carbs,
      total_fat: totalMacros.fat,
      total_protein: totalMacros.protein,
      image_url: item.image_url
    },
    ingredient: {
      name: item.name || "Unknown Product",
      amount_g: mealData.grams * mealData.count,
      calories: mealData.calories,
      carbs: totalMacros.carbs,
      fat: totalMacros.fat,
      protein: totalMacros.protein,
      food_id: item.id
    }
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