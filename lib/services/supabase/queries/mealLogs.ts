import supabase from "../client";
import { MealLog, MealLogInsert, MealIngredientInsert } from "@/types/database/dbModels";

export const logMeal = async (userId: string, mealData: Omit<MealLogInsert, "user_id">, ingredients: Omit<MealIngredientInsert, "meal_log_id">[]): Promise<MealLog> => {
    const { data: mealLog, error: mealError } = await supabase
        .from('meal_logs')
        .insert({ ...mealData, user_id: userId })
        .select()
        .single();
    if (mealError) {
        console.error("[supabase/queries/mealLogs] Error inserting meal log:", mealError);
        throw mealError;
    }
    if (ingredients.length > 0) {
        const ingredientsWithLogId = ingredients.map(ing => ({
            ...ing,
            meal_log_id: mealLog.id
        }));
        const { error: ingError } = await supabase
            .from('meal_ingredients')
            .insert(ingredientsWithLogId);
        if (ingError) {
            console.error("[supabase/queries/mealLogs] Error inserting meal ingredients:", ingError);
            throw ingError;
        }
    }
    return mealLog;
};