import { Food } from "@/types/database/dbModels";
import { FoodSearchResult } from "@/types/foodSearchResult";
import { computeHealthRating } from "@/lib/helpers/mealHelpers";
import supabase from "../client";
import { uploadImage } from "./storage";

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
//INCREMENT
export const incrementFoodLogCount = async (foodIds: string[]): Promise<void> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validIds = [...new Set(foodIds.filter(id => uuidRegex.test(id)))];
    if (validIds.length === 0) return;
    await Promise.allSettled(
        validIds.map(async (id) => {
            const { data } = await supabase
                .from('foods')
                .select('log_count')
                .eq('id', id)
                .single();
            if (data) {
                await supabase
                    .from('foods')
                    .update({ log_count: (data.log_count || 0) + 1 })
                    .eq('id', id);
            }
        })
    );
};
//INSERT
export const upsertExternalFood = async (item: FoodSearchResult, isDrink?: boolean): Promise<string> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(item.id)) return item.id;
    const normalizedBrand = item.brand || '';
    const { data: existingFood } = await supabase
        .from('foods')
        .select('id, image_url')
        .eq('name', item.name || '')
        .eq('brand', normalizedBrand)
        .limit(1)
        .maybeSingle();
    if (existingFood) {
        if (!existingFood.image_url && item.image_url) {
            await supabase.from('foods').update({ image_url: item.image_url }).eq('id', existingFood.id);
        }
        return existingFood.id;
    }
    const { data: newFood, error: insertError } = await supabase
        .from('foods')
        .insert({
            name: item.name || 'Unknown Food',
            brand: normalizedBrand,
            calories_per_100g: Math.round(item.calories_per_100g || 0),
            carbs_per_100g: Math.round(item.carbs_per_100g || 0),
            protein_per_100g: Math.round(item.protein_per_100g || 0),
            fat_per_100g: Math.round(item.fat_per_100g || 0),
            image_url: item.image_url ?? null,
            health_rating: item.health_rating,
            barcode: item.barcode,
            category: isDrink ? 'Drink' : (item.category ?? null),
            is_drink: isDrink ?? false,
        })
        .select('id')
        .single();
    if (insertError) {
        if (insertError.code === '23505') {
            const { data: existingByName } = await supabase
                .from('foods')
                .select('id')
                .eq('name', item.name || 'Unknown Food')
                .limit(1)
                .maybeSingle();
            if (existingByName) return existingByName.id;
        }
        console.error("[supabase/queries/foods] Error upserting external food:", insertError);
        throw insertError;
    }
    return newFood.id;
};
export const insertScannedFood = async (
  userId: string,
  data: {
    name: string;
    calories_per_100g: number;
    protein_per_100g: number;
    fat_per_100g: number;
    carbs_per_100g: number;
    health_rating?: number | null;
    is_drink?: boolean;
  },
  photoUri?: string | null
): Promise<{ id: string; imageUrl: string | null }> => {
  const { data: existing } = await supabase
    .from('foods')
    .select('id, image_url')
    .eq('name', data.name)
    .eq('created_by', userId)
    .limit(1)
    .maybeSingle();
  if (existing) {
    let imageUrl = existing.image_url ?? null;
    if (photoUri && !existing.image_url) {
      try {
        imageUrl = await uploadImage(photoUri, `${existing.id}.jpg`, 'foods');
        if (imageUrl) await supabase.from('foods').update({ image_url: imageUrl }).eq('id', existing.id);
      } catch (err) {
        console.error('[foods] Image upload failed for existing food:', err);
        imageUrl = null;
      }
    }
    return { id: existing.id, imageUrl };
  }
  const { data: newFood, error } = await supabase
    .from('foods')
    .insert({
      name: data.name,
      czech_name: data.name,
      brand: '',
      category: data.is_drink ? 'Drink' : 'Meal',
      is_drink: data.is_drink ?? false,
      created_by: userId,
      calories_per_100g: Math.round(data.calories_per_100g),
      protein_per_100g: Math.round(data.protein_per_100g),
      fat_per_100g: Math.round(data.fat_per_100g),
      carbs_per_100g: Math.round(data.carbs_per_100g),
      health_rating: data.health_rating ?? null,
    })
    .select('id')
    .single();
  if (error) throw error;
  let imageUrl: string | null = null;
  if (photoUri) {
    try {
      imageUrl = await uploadImage(photoUri, `${newFood.id}.jpg`, 'foods');
      if (imageUrl) await supabase.from('foods').update({ image_url: imageUrl }).eq('id', newFood.id);
    } catch (err) {
      console.error('[foods] Image upload failed:', err);
    }
  }
  return { id: newFood.id, imageUrl };
};
export const getUserCreatedFoods = async (userId: string): Promise<Food[]> => {
    const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('created_by', userId)
        .eq('category', 'Custom Meal')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
};
export const createCustomFood = async (
    userId: string,
    data: {
        name: string;
        calories_per_100g: number;
        protein_per_100g: number;
        fat_per_100g: number;
        carbs_per_100g: number;
    },
    photoUri?: string | null
): Promise<{ id: string; imageUrl: string | null }> => {
    const health_rating = computeHealthRating({
        calories_per_100g: data.calories_per_100g,
        protein_per_100g: data.protein_per_100g,
        fat_per_100g: data.fat_per_100g,
        carbs_per_100g: data.carbs_per_100g,
    });
    const { data: newFood, error } = await supabase
        .from('foods')
        .insert({
            name: data.name,
            brand: '',
            category: 'Custom Meal',
            created_by: userId,
            calories_per_100g: Math.round(data.calories_per_100g),
            protein_per_100g: Math.round(data.protein_per_100g),
            fat_per_100g: Math.round(data.fat_per_100g),
            carbs_per_100g: Math.round(data.carbs_per_100g),
            health_rating,
        })
        .select('id')
        .single();
    if (error) throw error;
    let imageUrl: string | null = null;
    if (photoUri) {
        try {
            imageUrl = await uploadImage(photoUri, `${newFood.id}.jpg`, 'foods');
            if (imageUrl) await supabase.from('foods').update({ image_url: imageUrl }).eq('id', newFood.id);
        } catch (err) {
            console.error('[foods] createCustomFood image upload failed:', err);
        }
    }
    return { id: newFood.id, imageUrl };
};
export const toggleFavoriteFood = async (userId: string, item: FoodSearchResult): Promise<{ isFavorite: boolean, newFoodId: string }> => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let foodId = uuidRegex.test(item.id) ? item.id : await upsertExternalFood(item);
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
        await incrementFoodLogCount([foodId]);
        return { isFavorite: true, newFoodId: foodId };
    }
};