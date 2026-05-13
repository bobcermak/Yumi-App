import { Food } from "@/types/database/dbModels";
import { FoodSearchResult } from "@/types/foodSearchResult";
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
export const checkIsFavorite = async (userId: string, foodId: string, name?: string, brand?: string | null): Promise<boolean> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let effectiveId = foodId;
    if (!uuidRegex.test(foodId)) {
        if (!name) return false;
        const normalizedBrand = brand || '';
        const { data: existingFood } = await supabase
            .from('foods')
            .select('id')
            .eq('name', name)
            .eq('brand', normalizedBrand)
            .limit(1)
            .maybeSingle();
            
        if (!existingFood) return false;
        effectiveId = existingFood.id;
    }
    const { data, error } = await supabase
        .from('user_favorites')
        .select('food_id')
        .eq('user_id', userId)
        .eq('food_id', effectiveId)
        .maybeSingle();
        
    if (error) {
        console.error("[supabase/queries/foods] Error in checkIsFavorite:", error);
        return false;
    }
    return !!data;
};
export const addToFavorites = async (userId: string, foodId: string): Promise<void> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(foodId)) {
        console.warn("[supabase/queries/foods] Cannot add non-UUID foodId to favorites directly:", foodId);
        return;
    }
    const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, food_id: foodId });
    if (error) {
        if (error.code === '23505') return; 
        console.error("[supabase/queries/foods] Error in addToFavorites:", error);
        throw error;
    }
};
export const removeFromFavorites = async (userId: string, foodId: string): Promise<void> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(foodId)) return;
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
export const toggleFavoriteFood = async (userId: string, item: FoodSearchResult): Promise<{ isFavorite: boolean, newFoodId: string }> => {
    let foodId = item.id;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUUID = uuidRegex.test(foodId);
    const normalizedBrand = item.brand || '';
    if (!isUUID) {
        const { data: existingFood } = await supabase
            .from('foods')
            .select('id')
            .eq('name', item.name || '')
            .eq('brand', normalizedBrand)
            .limit(1)
            .maybeSingle();
        if (existingFood) {
            foodId = existingFood.id;
        } else {
            const { data: newFood, error: insertError } = await supabase
                .from('foods')
                .insert({
                    name: item.name || 'Unknown Food',
                    brand: normalizedBrand,
                    calories_per_100g: item.calories_per_100g || 0,
                    carbs_per_100g: item.carbs_per_100g || 0,
                    protein_per_100g: item.protein_per_100g || 0,
                    fat_per_100g: item.fat_per_100g || 0,
                    image_url: item.image_url,
                    health_rating: item.health_rating,
                    barcode: item.barcode,
                })
                .select('id')
                .single();
            if (insertError) {
                console.error("[supabase/queries/foods] Error saving external food:", insertError);
                throw insertError;
            }
            foodId = newFood.id;
        }
    }
    const { data: existingFav } = await supabase
        .from('user_favorites')
        .select('food_id')
        .eq('user_id', userId)
        .eq('food_id', foodId)
        .maybeSingle();
    if (existingFav) {
        const { error: deleteError } = await supabase
            .from('user_favorites')
            .delete()
            .eq('user_id', userId)
            .eq('food_id', foodId);
        
        if (deleteError) throw deleteError;
        return { isFavorite: false, newFoodId: foodId };
    } else {
        const { error: insertError } = await supabase
            .from('user_favorites')
            .insert({ user_id: userId, food_id: foodId });
            
        if (insertError) {
            if (insertError.code === '23505') return { isFavorite: true, newFoodId: foodId };
            throw insertError;
        }
        return { isFavorite: true, newFoodId: foodId };
    }
};