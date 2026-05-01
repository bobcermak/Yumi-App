import supabase from "../client";

//GET
export const checkNicknameIfExists = async (username: string): Promise<boolean> => {
    const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username.trim())
        .limit(1);

    return !!data && data.length > 0;
}
//POST
export type ProfileData = {
  id: string,
  username: string,
  full_name: string,
  avatar_url?: string | null,
  current_weight: number,
  goal_weight: number,
  daily_calorie_limit: number
};
export const createProfile = async (profile: ProfileData) => {
  const { error } = await supabase
    .from("profiles")
    .insert([
      {
        id: profile.id,
        username: profile.username,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        current_weight: profile.current_weight,
        goal_weight: profile.goal_weight,
        daily_calorie_limit: profile.daily_calorie_limit,
      },
    ]);
  return { error };
};
export const addProgressPhotos = async (userId: string, photos: { image_url: string, weight: number }[]) => {
  const { error } = await supabase
    .from("progress_photos")
    .insert(
      photos.map((p) => ({
        user_id: userId,
        image_url: p.image_url,
        weight: p.weight,
      }))
    );
  return { error };
};