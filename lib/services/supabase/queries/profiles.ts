import supabase from "../client";
import { PostgrestError } from "@supabase/supabase-js";
import { format, parseISO, differenceInCalendarDays, subDays } from "date-fns";
import { getActiveDates } from "./dailyLogs";
import { getMealTimingFactor } from "@/lib/helpers/mealHelpers";

//UPDATE
export const recalculateUserRating = async (userId: string): Promise<void> => {
  const today = new Date();
  const thirtyDaysAgo = format(subDays(today, 30), "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const { data: meals } = await supabase
    .from("meal_logs")
    .select("rating, logged_at, type")
    .eq("user_id", userId)
    .not("rating", "is", null)
    .gte("logged_at", `${thirtyDaysAgo}T00:00:00`)
    .lte("logged_at", `${todayStr}T23:59:59`);
  if (!meals || meals.length === 0) return;
  const now = today.getTime();
  let totalWeight = 0;
  let weightedSum = 0;
  for (const meal of meals) {
    if (meal.rating === null || !meal.logged_at) continue;
    const mealDate = new Date(meal.logged_at);
    const daysAgo = (now - mealDate.getTime()) / (1000 * 60 * 60 * 24);
    const recencyWeight = Math.exp(-0.05 * daysAgo);
    const timingFactor = getMealTimingFactor(meal.type, mealDate.getHours());
    weightedSum += meal.rating * timingFactor * recencyWeight;
    totalWeight += recencyWeight;
  }
  if (totalWeight === 0) return;
  const newRating = Math.round((weightedSum / totalWeight) * 10) / 10;
  await supabase
    .from("profiles")
    .update({ total_rating: newRating })
    .eq("id", userId);
};
export const recalculateStreakFromLogs = async (userId: string): Promise<number> => {
  const now = new Date();
  const endDate = format(now, "yyyy-MM-dd");
  const startDate = format(subDays(now, 60), "yyyy-MM-dd");
  const { data: logs, error } = await getActiveDates(userId, startDate, endDate);
  if (error || !logs || logs.length === 0) return 0;
  const activeDates = [...new Set(logs.map(l => l.date))].sort().reverse();
  const todayStr = format(now, "yyyy-MM-dd");
  const yesterdayStr = format(subDays(now, 1), "yyyy-MM-dd");
  if (activeDates[0] !== todayStr && activeDates[0] !== yesterdayStr) {
    return 0;
  }
  let streak = 0;
  let currentDate = activeDates[0] === todayStr ? now : subDays(now, 1);
  for (let i = 0; i < activeDates.length; i++) {
    const logDateStr = activeDates[i];
    const expectedDateStr = format(currentDate, "yyyy-MM-dd");
    if (logDateStr === expectedDateStr) {
      streak++;
      currentDate = subDays(currentDate, 1);
    } else {
      break;
    }
  }
  return streak;
};
export const incrementUserStreak = async (userId: string): Promise<{ error: PostgrestError | null }> => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("streak_count, last_log_date")
    .eq("id", userId)
    .single();
  if (!profile) return { error: null };
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const newStreak = await recalculateStreakFromLogs(userId);
  const { data: logs } = await getActiveDates(userId, format(subDays(new Date(), 60), "yyyy-MM-dd"), todayStr);
  const latestDate = (logs && logs.length > 0) 
    ? [...new Set(logs.map(l => l.date))].sort().reverse()[0] 
    : null;
  const { error } = await supabase
    .from("profiles")
    .update({
      streak_count: newStreak,
      last_log_date: latestDate
    })
    .eq("id", userId);
  return { error };
};
//GET
export const getEffectiveStreak = (streakCount: number | null | undefined, lastLogDate: string | null | undefined): number => {
  const streak = Number(streakCount ?? 0);
  if (!lastLogDate) return streak;
  const now = new Date();
  const lastLog = parseISO(lastLogDate);
  const daysDiff = differenceInCalendarDays(now, lastLog);
  if (daysDiff <= 1) return streak;
  return 0;
};