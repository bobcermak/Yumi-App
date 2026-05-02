import { ACTIVITY_MULTIPLIERS, ACTIVITY_LEVELS } from "@/types/activityLevelsType";

export const MIN_CALORIES = 600;
export const USERNAME_REGEX = /^[a-z0-9_]{3,15}$/;

export const validateFullName = (name: string) => name.trim().split(/\s+/).length >= 2;
export const validateUsername = (username: string) => USERNAME_REGEX.test(username);

export const generateSuggestions = (username: string): string[] => {
  if (!username.trim()) return [];
  const base = username.trim();
  const random1 = Math.floor(Math.random() * 99) + 1;
  const random2 = Math.floor(Math.random() * 999) + 100;
  return [`${base}_${random1}`, `${base}${random2}`, `${base}_yumi`];
};
export const toKg = (value: number, unit: "kg" | "lb") => unit === "lb" ? value * 0.453592 : value;
export const computeTDEE = (weightKg: number, activityLevel: string | number) => {
  const bmr = weightKg * 22;
  const levelId = typeof activityLevel === "number" 
    ? ACTIVITY_LEVELS[activityLevel]?.id 
    : activityLevel;
  return bmr * (ACTIVITY_MULTIPLIERS[levelId] ?? 1.55);
};
export const computeTotalKcal = (currentKg: number, targetKg: number) => (targetKg - currentKg) * 7700;
export const caloriesFromDays = (days: number, currentKg: number, targetKg: number, activityLevel: string | number) => {
  const tdee = computeTDEE(currentKg, activityLevel);
  const totalKcal = computeTotalKcal(currentKg, targetKg);
  if (days <= 0) return Math.round(tdee);
  const daily = tdee + totalKcal / days;
  return Math.max(Math.round(daily), MIN_CALORIES);
};
export const daysFromCalories = (calories: number, currentKg: number, targetKg: number, activityLevel: string | number) => {
  const tdee = computeTDEE(currentKg, activityLevel);
  const totalKcal = computeTotalKcal(currentKg, targetKg);
  const dailyDelta = calories - tdee;
  if (Math.abs(totalKcal) < 0.1) return 0;
  if (Math.sign(totalKcal) !== Math.sign(dailyDelta)) return null;
  if (Math.abs(dailyDelta) < 10) return null;
  const days = Math.ceil(totalKcal / dailyDelta);
  return days >= 0 && days < 3650 ? days : null;
};
export const dateStringFromToday = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const daysUntil = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [y, m, d] = dateString.split("-").map(Number);
  const target = new Date(y, m - 1, d);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diffTime / 86400000));
};