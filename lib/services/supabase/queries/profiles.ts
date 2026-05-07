import supabase from "../client";
import { PostgrestError } from "@supabase/supabase-js";
import { format, isYesterday, isToday, parseISO } from "date-fns";

//UPDATE
export const incrementUserStreak = async (userId: string): Promise<{ error: PostgrestError | null }> => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_log_date")
    .eq("id", userId)
    .single();
  if (!profile) return { error: null };
  const todayStr = format(new Date(), "yyyy-MM-dd");
  if (profile.last_log_date && isToday(parseISO(profile.last_log_date))) {
    return { error: null };
  }
  let newStreak = 1;
  if (profile.last_log_date && isYesterday(parseISO(profile.last_log_date))) {
    newStreak = (profile.streak_count || 0) + 1;
  }
  const { error } = await supabase
    .from("profiles")
    .update({
      streak_count: newStreak,
      last_log_date: todayStr
    })
    .eq("id", userId);
  return { error };
};