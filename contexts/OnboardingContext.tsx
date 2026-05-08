import { caloriesFromDays, computeTDEE, computeTotalKcal, dateStringFromToday, daysFromCalories, daysUntil, generateSuggestions, toKg } from "@/lib/helpers/onBoardingHelpers";
import { useFetch } from "@/lib/hooks/useFetch";
import { checkUsernameIfExists } from "@/lib/services/supabase/queries/setupUserAccount";
import { OnboardingContextType } from "@/types/onboardingContextType";
import { usePathname, useRouter, type Href } from "expo-router";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from "react";

const SLIDES = ["user-information", "calculate-weight", "activity-level", "results-weight", "take-photo"];

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

type OnboardingProviderProps = {
  children: ReactNode
};
const OnboardingProvider: FC<OnboardingProviderProps> = ({ children }) => {
  //Hooks
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<string[]>(["", "", ""]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(70);
  const [targetWeight, setTargetWeight] = useState<number>(65);
  const [weightUnit, setWeightUnit] = useState<"KG" | "LB">("KG");
  const [activityLevel, setActivityLevel] = useState<number>(2);
  const [dailyCalories, setDailyCaloriesRaw] = useState<number>(2000);
  const [goalDate, setGoalDateRaw] = useState<string | null>(null);
  //Fetch
  const fetchUsernameStatus = useCallback(() => checkUsernameIfExists(username), [username]);
  const { data: usernameTakenResult, loading: isUsernameLoading, refetch: refetchUsername, reset: resetUsernameStatus } = useFetch(fetchUsernameStatus, false);

  //Calculations
  const currentKg = useMemo(() => toKg(currentWeight, weightUnit === 'KG' ? 'kg' : 'lb'), [currentWeight, weightUnit]);
  const targetKg = useMemo(() => toKg(targetWeight, weightUnit === 'KG' ? 'kg' : 'lb'), [targetWeight, weightUnit]);
  const updateCaloriesFromDate = useCallback((date: string) => {
    const days = daysUntil(date);
    const tdee = computeTDEE(currentKg, activityLevel);
    const totalKcal = computeTotalKcal(currentKg, targetKg);
    if (days <= 0) {
      setDailyCaloriesRaw(Math.round(tdee));
      return false;
    }
    const rawDaily = tdee + totalKcal / days;
    let cal = rawDaily;
    let isClamped = false;
    if (rawDaily < 600) { cal = 600; isClamped = true; }
    if (rawDaily > 8000) { cal = 8000; isClamped = true; }
    if (isClamped) {
      const realDays = daysFromCalories(cal, currentKg, targetKg, activityLevel);
      if (realDays !== null) {
        setGoalDateRaw(dateStringFromToday(realDays));
        const exactRaw = tdee + totalKcal / realDays;
        setDailyCaloriesRaw(Math.round(Math.max(600, Math.min(8000, exactRaw))));
      } else {
        setDailyCaloriesRaw(Math.round(cal));
      }
    } else {
      setDailyCaloriesRaw(Math.round(cal));
    }
    return isClamped;
  }, [currentKg, targetKg, activityLevel]);
  const setDailyCalories = useCallback((calories: number) => {
    const tdee = computeTDEE(currentKg, activityLevel);
    const totalKcal = computeTotalKcal(currentKg, targetKg);
    let days = daysFromCalories(calories, currentKg, targetKg, activityLevel);
    let finalCal = calories;
    if (days === null || days > 730) {
      days = 730;
      const exactRaw = tdee + totalKcal / days;
      finalCal = Math.round(exactRaw);
    }
    setDailyCaloriesRaw(Math.max(600, Math.min(8000, finalCal)));
    setGoalDateRaw(dateStringFromToday(days));
  }, [currentKg, targetKg, activityLevel]);
  const setGoalDate = useCallback((date: string | null) => {
    setGoalDateRaw(date);
    if (date) return updateCaloriesFromDate(date);
    return false;
  }, [updateCaloriesFromDate]);
  const toggleWeightUnit = useCallback((unit: 'KG' | 'LB') => {
    if (unit === weightUnit) return;
    const newMin = unit === 'KG' ? 15 : 33;
    const newMax = unit === 'KG' ? 200 : 440;
    if (unit === 'LB') {
      setCurrentWeight(prev => Math.max(newMin, Math.min(newMax, Math.round(prev * 2.20462))));
      setTargetWeight(prev => Math.max(newMin, Math.min(newMax, Math.round(prev * 2.20462))));
    } else {
      setCurrentWeight(prev => Math.max(newMin, Math.min(newMax, Math.round(prev / 2.20462))));
      setTargetWeight(prev => Math.max(newMin, Math.min(newMax, Math.round(prev / 2.20462))));
    }
    setWeightUnit(unit);
  }, [weightUnit]);
  const deleteProgressPhoto = useCallback((index: number) => {
    setProgressPhotos(prev => {
      const next = [...prev];
      next[index] = "";
      return next;
    });
  }, []);
  useEffect(() => {
    if (pathname.includes("results-weight")) {
      if (!goalDate) {
        const DEFAULT_DAYS = 90;
        const cal = caloriesFromDays(DEFAULT_DAYS, currentKg, targetKg, activityLevel);
        setDailyCaloriesRaw(cal);
        setGoalDateRaw(dateStringFromToday(DEFAULT_DAYS));
      } else {
        updateCaloriesFromDate(goalDate);
      }
    }
  }, [pathname, currentKg, targetKg, activityLevel]);
  const usernameTaken = !!usernameTakenResult;
  useEffect(() => {
    if (username.trim().length >= 2) {
      resetUsernameStatus();
      setSuggestions([]);
      const t = setTimeout(refetchUsername, 300);
      return () => clearTimeout(t);
    }
    resetUsernameStatus();
    setSuggestions([]);
  }, [username, refetchUsername, resetUsernameStatus]);
  useEffect(() => {
    if (!isUsernameLoading) {
      setSuggestions(usernameTakenResult ? generateSuggestions(username.trim()) : []);
    }
  }, [usernameTakenResult, isUsernameLoading, username]);
  const currentIndex = SLIDES.findIndex((s) => pathname.includes(s));
  const totalSteps = SLIDES.length;
  const handleContinue = useCallback(() => {
    const next = currentIndex + 1;
    if (next < SLIDES.length) {
      const nextPath = `/(onboarding)/(slides)/${SLIDES[next]}` as Href;
      router.push(nextPath);
    }
  }, [currentIndex, router]);
  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);
  const handleFinish = useCallback(() => {
    router.replace("/(auth)/signup");
  }, [router]);
  const value = useMemo<OnboardingContextType>(() => ({
    fullName, setFullName,
    username, setUsername,
    photoUri, setPhotoUri,
    progressPhotos, setProgressPhotos, deleteProgressPhoto,
    usernameTaken, isUsernameLoading, suggestions,
    currentWeight, setCurrentWeight,
    targetWeight, setTargetWeight,
    weightUnit, setWeightUnit, toggleWeightUnit,
    activityLevel, setActivityLevel,
    dailyCalories, setDailyCalories,
    goalDate, setGoalDate,
    currentIndex, totalSteps,
    handleContinue, handleBack, handleFinish,
  }), [
    fullName, username, photoUri, progressPhotos, deleteProgressPhoto, usernameTaken, isUsernameLoading, suggestions,
    currentWeight, targetWeight, weightUnit, toggleWeightUnit, activityLevel, dailyCalories, setDailyCalories,
    goalDate, setGoalDate, currentIndex, totalSteps, handleContinue, handleBack, handleFinish
  ]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
export default OnboardingProvider;