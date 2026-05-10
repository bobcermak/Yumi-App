import supabase from '../supabase/client';
import type { FoodSearchResult } from '@/types/foodSearchResult';
import type { FoodCategory, FoodType } from '@/types/searchFilters';

type SearchParams = {
    query: string;
    category?: FoodCategory;
    foodType?: FoodType;
    maxResults?: number;
};
export const searchExternalFoods = async ({query, category = "all", foodType = "all", maxResults = 4,}: SearchParams): Promise<FoodSearchResult[]> => {
    try {
        const { data, error } = await supabase.functions.invoke('food-search', {
            body: { query, category, foodType, pageSize: maxResults },
        });
        if (error) {
            console.error(`[FoodSearch] Edge Function error:`, error);
            return [];
        }
        if (!data || !Array.isArray(data)) {
            return [];
        }
        return (data as FoodSearchResult[]).slice(0, maxResults);
    } catch (error) {
        console.error(`[FoodSearch] Search error:`, error);
        return [];
    }
};