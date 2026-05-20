import supabase from '../supabase/client';
import type { FoodSearchResult } from '@/types/foodSearchResult';
import type { FoodCategory, FoodType } from '@/types/searchFilters';

type SearchParams = {
    query: string,
    category?: FoodCategory,
    foodType?: FoodType,
    maxResults?: number
};
const invokeWithRetry = async (fnName: string, body: object): Promise<{ data: any; error: any }> => {
    const { data, error } = await supabase.functions.invoke(fnName, { body });
    if (error?.name === 'FunctionsFetchError') {
        await new Promise(r => setTimeout(r, 1500));
        return supabase.functions.invoke(fnName, { body });
    }
    return { data, error };
};
export const searchExternalFoods = async ({ query, category = "all", foodType = "all", maxResults = 4 }: SearchParams): Promise<FoodSearchResult[]> => {
    try {
        const { data, error } = await invokeWithRetry('food-search', { query, category, foodType, pageSize: maxResults });
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
export const searchExternalFoodsExtended = async ({ query, category = "all", foodType = "all", maxResults = 6 }: SearchParams): Promise<FoodSearchResult[]> => {
    try {
        const { data, error } = await invokeWithRetry('food-search-extended', { query, category, foodType, pageSize: maxResults });
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