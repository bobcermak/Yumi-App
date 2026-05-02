import { uploadImage } from "../services/supabase/queries/storage";
import { createProfile, addProgressPhotos } from "../services/supabase/queries/setupUserAccount";

export const completeOnboarding = async (userId: string, onboardingData: {
  fullName: string;
  username: string;
  photoUri: string | null;
  progressPhotos: string[];
  currentWeight: number;
  targetWeight: number;
  dailyCalories: number;
  activityLevel: number;
  weightUnit: "kg" | "lb";
  goalDate: string | null;
}) => {
  let avatarUrl = null;
  if (onboardingData.photoUri) {
    try {
      avatarUrl = await uploadImage(onboardingData.photoUri, `${userId}/avatar.webp`, "avatars");
    } catch (e) {
      console.error("[Onboarding] Avatar upload failed:", e);
    }
  }
  const profileData: ProfileInsert = {
    id: userId,
    username: onboardingData.username,
    full_name: onboardingData.fullName,
    avatar_url: avatarUrl,
    current_weight: onboardingData.currentWeight,
    goal_weight: onboardingData.targetWeight,
    daily_calorie_limit: onboardingData.dailyCalories,
    start_date: new Date().toISOString(),
    target_date: onboardingData.goalDate,
  };
  console.log("[Onboarding] Final profile data:", profileData);
  const { error: profileError } = await createProfile(profileData);
  if (profileError) {
    console.error("[Onboarding] DATABASE ERROR:", profileError);
    return { error: { message: `Database error: ${profileError.message}` } };
  }
  const validProgressPhotos = onboardingData.progressPhotos.filter((p: string) => p !== "");
  if (validProgressPhotos.length > 0) {
    try {
      const uploaded = await Promise.all(
        validProgressPhotos.map(async (uri: string, index: number) => {
          const url = await uploadImage(uri, `${userId}/init_${index}.webp`, "progress");
          return { image_url: url || "", weight: onboardingData.currentWeight };
        })
      );
      await addProgressPhotos(userId, uploaded.filter(p => p.image_url !== ""));
    } catch (e) {
      console.error("[Onboarding] Progress photos upload failed:", e);
    }
  }
  return { error: null };
};