import { MealIngredientInsert, MealLog, MealLogInsert, DailyLog, MealLogWithIngredients } from "@/types/database/dbModels";
import supabase from "../client";
import { format } from "date-fns";

// RECALCULATE
export const recalculateDailyLog = async (userId: string, date: string): Promise<void> => {
    // 1. Get all meal logs for this day
    const { data: meals, error: mealsError } = await supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('logged_at', `${date}T00:00:00`)
        .lte('logged_at', `${date}T23:59:59`);

    if (mealsError) throw mealsError;

    // 2. Sum up totals
    const totals = (meals || []).reduce((acc, meal) => ({
        calories: acc.calories + (meal.total_calories || 0),
        carbs: acc.carbs + (meal.total_carbs || 0),
        protein: acc.protein + (meal.total_protein || 0),
        fat: acc.fat + (meal.total_fat || 0),
    }), { calories: 0, carbs: 0, protein: 0, fat: 0 });

    // 3. Upsert into daily_logs
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

// LOG
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
    
    // Recalculate daily totals
    const dateStr = format(new Date(mealLog.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
    
    return mealLog;
};

// DELETE
export const deleteMealLog = async (userId: string, mealId: string): Promise<void> => {
    // Get meal info before deleting for recalculation
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

    // Recalculate daily totals
    const dateStr = format(new Date(meal.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
};

// UPDATE
export const updateMealLog = async (userId: string, mealId: string, updates: Partial<MealLog>): Promise<void> => {
    const { data: meal, error: updateError } = await supabase
        .from('meal_logs')
        .update(updates)
        .eq('id', mealId)
        .eq('user_id', userId)
        .select()
        .single();

    if (updateError) throw updateError;

    // Also update calories in meal_ingredients if total_calories was updated
    if (updates.total_calories !== undefined) {
        const { data: ings } = await supabase
            .from('meal_ingredients')
            .select('id')
            .eq('meal_log_id', mealId);
        const perItem = Math.round(updates.total_calories / (ings?.length || 1));
        await supabase
            .from('meal_ingredients')
            .update({ calories: perItem })
            .eq('meal_log_id', mealId);
    }

    // Recalculate daily totals
    const dateStr = format(new Date(meal.logged_at!), 'yyyy-MM-dd');
    await recalculateDailyLog(userId, dateStr);
};

// GET FOR DAY
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