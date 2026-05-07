import supabase from "../client";
import { Profile, ProfileInsert, ProgressPhotoInsert, ProfileUpdate } from "@/types/database/dbModels";
import { PostgrestError } from "@supabase/supabase-js";

//GET
export const checkUsernameIfExists = async (username: string): Promise<boolean> => {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .ilike("username", username.trim())
    .limit(1);
  return !!data && data.length > 0;
}
export const getProfile = async (id: string): Promise<{ data: Profile | null, error: PostgrestError | null }> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { data, error };
};
//POST
export const createProfile = async (profile: ProfileInsert): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from("profiles")
    .upsert(profile);
  return { error };
};
export const addProgressPhotos = async (userId: string, photos: { image_url: string, weight: number }[]): Promise<{ error: PostgrestError | null }> => {
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
export const updateCalorieLimitAndTargetDate = async (userId: string, newMax: number, newTargetDate?: string): Promise<{ error: PostgrestError | null }> => {
  const updates: ProfileUpdate = { 
    daily_calorie_limit: newMax,
    target_date: newTargetDate
  };
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
  return { error };
};