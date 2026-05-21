import supabase from "@/lib/services/supabase/client";

export type MagicScanComponent = {
  emoji?: string;
  name: string;
  weight_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
};
export type MagicScanResult = {
  name: string;
  weight_g: number;
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  components: MagicScanComponent[];
  model: string;
};
export class NotFoodError extends Error {
  constructor() {
    super("NOT_FOOD");
  }
}
export const analyzeFood = async (base64Image: string): Promise<MagicScanResult> => {
  const { data, error } = await supabase.functions.invoke("magic-scan", {
    body: { image: base64Image },
  });
  if (error) throw error;
  if (data?.is_food === false) throw new NotFoodError();
  if (!data?.name) throw new Error("Invalid response from analysis");
  return data as MagicScanResult;
}