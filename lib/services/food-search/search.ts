import supabase from '../supabase/client';
import type { FoodSearchResult } from '@/types/foodSearchResult';

//Promise
export const searchExternalFoods = async (query: string, maxResults: number = 10): Promise<FoodSearchResult[]> => {
    try {
        console.log(`[FoodSearch] Searching via Edge Function for: "${query}"`);
        const { data, error } = await supabase.functions.invoke('food-search', {
            body: { query, pageSize: maxResults }
        });
        if (error) {
            console.error(`[FoodSearch] Edge Function error:`, error);
            return [];
        }
        if (!data || !Array.isArray(data)) {
            return [];
        }
        return data as FoodSearchResult[];
    } catch (error) {
        console.error(`[FoodSearch] Search error:`, error);
        return [];
    }
};