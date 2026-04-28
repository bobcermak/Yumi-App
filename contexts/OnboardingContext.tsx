import { OnboardingContextType } from "@/types/onboardingContextType";
import { usePathname, useRouter } from "expo-router";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import useFetch from "@/lib/hooks/useFetch";
import { checkNicknameIfExists } from "@/lib/services/supabase/queries/setupUserAccount";
import { generateSuggestions, toKg, caloriesFromDays, daysFromCalories, dateStringFromToday, daysUntil, computeTDEE, computeTotalKcal } from "@/lib/helpers/onBoardingHelpers";

const SLIDES = ["user-information", "calculate-weight", "activity-level", "results-weight", "take-photo"];

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

type OnboardingProviderProps = { children: ReactNode };
const OnboardingProvider: FC<OnboardingProviderProps> = ({ children }) => {
  //Hooks
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [progressPhotos, setProgressPhotos] = useState<string[]>(["", "", ""]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lb">("kg");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [dailyCalories, setDailyCaloriesRaw] = useState(2000);
  const [goalDate, setGoalDateRaw] = useState<string | null>(null);
  //Fetch
  const fetchNicknameStatus = useCallback(() => checkNicknameIfExists(nickname), [nickname]);
  const { data: nicknameTakenResult, loading: isNicknameLoading, refetch: refetchNickname, reset: resetNicknameStatus } = useFetch(fetchNicknameStatus, false);

  //Calculations
  const currentKg = useMemo(() => toKg(currentWeight, weightUnit), [currentWeight, weightUnit]);
  const targetKg = useMemo(() => toKg(targetWeight, weightUnit), [targetWeight, weightUnit]);
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
    let cal = calories;
    const isLosing = totalKcal < 0;
    const isGaining = totalKcal > 0;
    if (isLosing && cal >= tdee) cal = tdee - 10;
    else if (isGaining && cal <= tdee) cal = tdee + 10;
    cal = Math.max(600, Math.min(8000, cal));
    let days = daysFromCalories(cal, currentKg, targetKg, activityLevel);
    if (days === null) {
      days = 3649;
      const exactRaw = tdee + totalKcal / days;
      cal = Math.max(600, Math.min(8000, exactRaw));
    }
    setDailyCaloriesRaw(Math.round(cal));
    setGoalDateRaw(dateStringFromToday(days));
  }, [currentKg, targetKg, activityLevel]);
  const setGoalDate = useCallback((date: string | null) => {
    setGoalDateRaw(date);
    if (date) return updateCaloriesFromDate(date);
    return false;
  }, [updateCaloriesFromDate]);
  const toggleWeightUnit = useCallback((unit: 'kg' | 'lb') => {
    if (unit === weightUnit) return;
    const newMin = unit === 'kg' ? 15 : 33;
    const newMax = unit === 'kg' ? 200 : 440;
    if (unit === 'lb') {
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
  const nicknameTaken = !!nicknameTakenResult;
  useEffect(() => {
    if (nickname.trim().length >= 2) {
      const t = setTimeout(refetchNickname, 500);
      return () => clearTimeout(t);
    }
    resetNicknameStatus();
    setSuggestions([]);
  }, [nickname, refetchNickname, resetNicknameStatus]);
  useEffect(() => {
    if (!isNicknameLoading) {
      setSuggestions(nicknameTakenResult ? generateSuggestions(nickname.trim()) : []);
    }
  }, [nicknameTakenResult, isNicknameLoading, nickname]);
  const currentIndex = SLIDES.findIndex((s) => pathname.includes(s));
  const totalSteps = SLIDES.length;
  const handleContinue = useCallback(() => {
    const next = currentIndex + 1;
    if (next < SLIDES.length) router.push(`/(onboarding)/(slides)/${SLIDES[next]}` as any);
  }, [currentIndex, router]);
  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);
  const handleFinish = useCallback(() => {
    router.replace("/(auth)/signup");
  }, [router]);
  const value = useMemo<OnboardingContextType>(() => ({
    fullName, setFullName,
    nickname, setNickname,
    photoUri, setPhotoUri,
    progressPhotos, setProgressPhotos, deleteProgressPhoto,
    nicknameTaken, isNicknameLoading, suggestions,
    currentWeight, setCurrentWeight,
    targetWeight, setTargetWeight,
    weightUnit, setWeightUnit, toggleWeightUnit,
    activityLevel, setActivityLevel,
    dailyCalories, setDailyCalories,
    goalDate, setGoalDate,
    currentIndex, totalSteps,
    handleContinue, handleBack, handleFinish,
  }), [
    fullName, nickname, photoUri, progressPhotos, deleteProgressPhoto, nicknameTaken, isNicknameLoading, suggestions,
    currentWeight, targetWeight, weightUnit, toggleWeightUnit, activityLevel, dailyCalories, setDailyCalories,
    goalDate, setGoalDate, currentIndex, totalSteps, handleContinue, handleBack, handleFinish
  ]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
export default OnboardingProvider;