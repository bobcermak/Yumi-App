import { Food } from "@/types/database/dbModels";
import supabase from "../client";

//GET
export const getPopularFoods = async (limit: number = 10): Promise<Food[]> => {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .order('log_count', { ascending: false })
        .limit(limit);
    if (error) {
        console.error("[supabase/queries/foods] Error in getPopularFoods:", error);
        throw error;
    }
    return data || [];
};
export const getUserPopularFoods = async (userId: string, limit: number = 10): Promise<Food[]> => {
    const { data: favorites, error: favError } = await supabase
        .from('user_favorites')
        .select('food_id')
        .eq('user_id', userId)
        .limit(limit);
    if (favError) {
        console.error("[supabase/queries/foods] Error in getUserPopularFoods (favorites):", favError);
        throw favError;
    }
    if (!favorites || favorites.length === 0) return [];
    const foodIds = favorites.map(f => f.food_id);
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .in('id', foodIds);

    if (error) {
        console.error("[supabase/queries/foods] Error in getUserPopularFoods (foods):", error);
        throw error;
    }
    return data || [];
};