import supabase from '../supabase/client';
import type { FoodSearchResult } from '@/types/foodSearchResult';

export const searchFoodByBarcode = async (barcode: string): Promise<FoodSearchResult | null> => {
  if (!barcode) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const { data, error } = await supabase.functions.invoke('barcode-search', {
      body: { barcode, userId: session?.user?.id ?? null },
    });
    if (error) {
      console.warn(`[BarcodeService] Edge Function error:`, error);
      return null;
    }
    if (!data || data.error) {
      console.warn(`[BarcodeService] No data or error in response:`, data?.error);
      return null;
    }
    const result = data as FoodSearchResult;
    console.log(`[BarcodeService] Success! Found: ${result.name}`);
    console.log(`[BarcodeService] Details: ${result.calories_per_100g} cal | Brand: ${result.brand || 'N/A'}`);
    return result;
  } catch (error) {
    console.warn(`[BarcodeService] Unexpected error:`, error);
    return null;
  }
};