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
//FAVORITES
export const checkIsFavorite = async (userId: string, foodId: string): Promise<boolean> => {
    const { data, error } = await supabase
        .from('user_favorites')
        .select('food_id')
        .eq('user_id', userId)
        .eq('food_id', foodId)
        .maybeSingle();
    if (error) {
        console.error("[supabase/queries/foods] Error in checkIsFavorite:", error);
        return false;
    }
    return !!data;
};
export const addToFavorites = async (userId: string, foodId: string): Promise<void> => {
    const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, food_id: foodId });
    if (error) {
        console.error("[supabase/queries/foods] Error in addToFavorites:", error);
        throw error;
    }
};
export const removeFromFavorites = async (userId: string, foodId: string): Promise<void> => {
    const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('food_id', foodId);
    if (error) {
        console.error("[supabase/queries/foods] Error in removeFromFavorites:", error);
        throw error;
    }
};