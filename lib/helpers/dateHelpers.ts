export const getTodayString = () => new Date().toISOString().split('T')[0];
export const formatCalendarDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};
export const getMealTypeByTime = (): string => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 10) return "Breakfast";
  if (hour >= 10 && hour < 12) return "Morning Snack";
  if (hour >= 12 && hour < 15) return "Lunch";
  if (hour >= 15 && hour < 18) return "Afternoon Snack";
  return "Dinner";
};
