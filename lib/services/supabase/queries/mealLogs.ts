import { MealIngredientInsert, MealLog, MealLogInsert, MealLogWithIngredients } from "@/types/database/dbModels";
import supabase from "../client";
import { incrementFoodLogCount } from "./foods";
import { format } from "date-fns";

//Upsert
export const recalculateDailyLog = async (userId: string, date: string): Promise<void> => {
    const { data: meals, error: mealsError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00`)
        .lte('logged_at', `${date}T23:59:59`);
    if (mealsError) throw mealsError;
    const totals = (meals || []).reduce((acc, meal) => ({
        calories: acc.calories + (meal.total_calories || 0),
        carbs: acc.carbs + (meal.total_carbs || 0),
        protein: acc.protein + (meal.total_protein || 0),
        fat: acc.fat + (meal.total_fat || 0),
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });
    const { error: upsertError } = await supabase
        .from('daily_logs')
        .upsert({
            user_id: userId,
            date: date,
            calories_current: Math.round(totals.calories),
            carbs_current: Math.round(totals.carbs),
            protein_current: Math.round(totals.protein),
            fats_current: Math.round(totals.fat),
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id,date' });
    if (upsertError) throw upsertError;
};
//INSERT
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
    const foodIds = ingredients.map(ing => ing.food_id).filter((id): id is string => !!id);
    incrementFoodLogCount(foodIds).catch(err =>
        console.warn('[mealLogs] incrementFoodLogCount failed (non-critical):', err)
    );
    const dateStr = format(new Date(mealLog.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
    return mealLog;
};
//DELETE
export const deleteMealLog = async (userId: string, mealId: string): Promise<void> => {
    const { data: meal, error: fetchError } = await supabase
        .from('meal_logs')
        .select('logged_at')
        .eq('id', mealId)
        .single();
    if (fetchError) throw fetchError;
    const { error: deleteError } = await supabase
        .from('meal_logs')
        .delete()
        .eq('id', mealId)
        .eq('user_id', userId);
    if (deleteError) throw deleteError;
    const dateStr = format(new Date(meal.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
};
//UPDATE
export const updateMealLog = async (userId: string, mealId: string, updates: Partial<MealLog>): Promise<void> => {
    const { data: meal, error: updateError } = await supabase
        .from('meal_logs')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single();
    if (updateError) throw updateError;
    if (updates.total_calories !== undefined) {
        const { data: ings } = await supabase
            .from('meal_ingredients')
            .select('id')
            .eq('meal_log_id', mealId);
        const perItem = Math.round((updates.total_calories || 0) / (ings?.length || 1));
        await supabase
            .from('meal_ingredients')
            .update({ calories: perItem })
            .eq('meal_log_id', mealId);
    }
    const dateStr = format(new Date(meal.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
};
type SingleServing = {
    name: string;
    food_id: string | null;
    amount_g: number;
    calories: number;
    carbs: number;
    fat: number;
    protein: number;
};
export const updateMealLogCount = async (
    userId: string,
    mealId: string,
    count: number,
    serving: SingleServing,
    loggedAt: string,
): Promise<void> => {
    const totals = {
        total_calories: serving.calories * count,
        total_carbs: Math.round(serving.carbs * count),
        total_fat: Math.round(serving.fat * count),
        total_protein: Math.round(serving.protein * count),
    };
    const { error: updateError } = await supabase
        .from('meal_logs')
        .update(totals)
        .eq('id', mealId)
        .eq('user_id', userId);
    if (updateError) throw updateError;
    await supabase.from('meal_ingredients').delete().eq('meal_log_id', mealId);
    const newIngredients = Array.from({ length: count }, () => ({
        meal_log_id: mealId,
        name: serving.name,
        food_id: serving.food_id,
        amount_g: serving.amount_g,
        calories: serving.calories,
        carbs: serving.carbs,
        fat: serving.fat,
        protein: serving.protein,
    }));
    await supabase.from('meal_ingredients').insert(newIngredients);
    const dateStr = format(new Date(loggedAt), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
};
//GET
export const getMealLogsForDay = async (userId: string, date: string): Promise<MealLogWithIngredients[]> => {
    const { data, error } = await supabase
        .from('meal_logs')
        .select('*, meal_ingredients(*)')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00`)
        .lte('logged_at', `${date}T23:59:59`)
        .order('logged_at', { ascending: true });

    if (error) {
        console.error("[supabase/queries/mealLogs] Error fetching meal logs:", error);
        throw error;
    }
    return (data || []) as MealLogWithIngredients[];
};