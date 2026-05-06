import supabase from "../client";
import { ProfileInsert, ProgressPhotoInsert, ProfileUpdate } from "@/types/database/dbModels";

//GET
export const checkUsernameIfExists = async (username: string): Promise<boolean> => {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", username.trim())
    .limit(1);
  return !!data && data.length > 0;
}
export const getProfile = async (id: string) => {
  return await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();
};
//POST
export const createProfile = async (profile: ProfileInsert) => {
  const { error } = await supabase
    .from("profiles")
    .upsert(profile);
  return { error };
};
export const addProgressPhotos = async (userId: string, photos: { image_url: string, weight: number }[]) => {
  const records: ProgressPhotoInsert[] = photos.map((p) => ({
    user_id: userId,
    image_url: p.image_url,
    weight: p.weight,
  }));
  const { error } = await supabase
    .from("progress_photos")
    .insert(records);
  return { error };
};
//UPDATE
export const updateCalorieLimitAndTargetDate = async (userId: string, newMax: number, newTargetDate?: string) => {
  const updates: ProfileUpdate = { 
    daily_calorie_limit: newMax 
  };
  if (newTargetDate) {
    updates.target_date = newTargetDate;
  }
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
  return { error };
};