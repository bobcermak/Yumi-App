export const findFoodByBarcode = async (
  supabase: any,
  barcode: string,
  name?: string,
  brand?: string | null,
) => {
  const { data: byBarcode } = await supabase
    .from("foods")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  if (byBarcode) return byBarcode;
  if (name) {
    let q = supabase.from("foods").select("*").ilike("name", name.trim());
    if (brand && brand.length > 0) {
      q = q.ilike("brand", brand);
    } else {
      q = q.or("brand.is.null,brand.eq.");
    }
    const { data: byName } = await q.maybeSingle();
    if (byName) return byName;
  }
  return null;
};
export const insertFood = async (supabase: any, food: any) => {
  const { data, error } = await supabase
    .from("foods")
    .insert(food)
    .select()
    .single();
  return { data, error };
};