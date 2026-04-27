import { OnboardingContextType } from "@/types/onboardingContextType";
import { usePathname, useRouter } from "expo-router";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import useFetch from "@/lib/hooks/useFetch";
import { checkNicknameIfExists } from "@/lib/services/supabase/queries/setupUserAccount";
import { generateSuggestions, toKg, caloriesFromDays, daysFromCalories, dateStringFromToday, daysUntil, MIN_CALORIES } from "@/lib/helpers/onBoardingHelpers";

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

  const currentKg = useMemo(() => toKg(currentWeight, weightUnit), [currentWeight, weightUnit]);
  const targetKg = useMemo(() => toKg(targetWeight, weightUnit), [targetWeight, weightUnit]);
  const updateCaloriesFromDate = useCallback((date: string) => {
    const days = daysUntil(date);
    const cal = caloriesFromDays(days, currentKg, targetKg, activityLevel);
    setDailyCaloriesRaw(cal);
  }, [currentKg, targetKg, activityLevel]);
  const updateDateFromCalories = useCallback((calories: number) => {
    const days = daysFromCalories(calories, currentKg, targetKg, activityLevel);
    if (days !== null) {
      setGoalDateRaw(dateStringFromToday(days));
    }
  }, [currentKg, targetKg, activityLevel]);
  const setDailyCalories = useCallback((calories: number) => {
    setDailyCaloriesRaw(calories);
    const effectiveCalories = Math.max(calories, MIN_CALORIES);
    updateDateFromCalories(effectiveCalories);
  }, [updateDateFromCalories]);
  const setGoalDate = useCallback((date: string | null) => {
    setGoalDateRaw(date);
    if (date) updateCaloriesFromDate(date);
  }, [updateCaloriesFromDate]);
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
  //Functions
  const handleContinue = useCallback(() => {
    const next = currentIndex + 1;
    if (next < SLIDES.length) router.push(`/(onboarding)/(slides)/${SLIDES[next]}` as any);
  }, [currentIndex, router]);
  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);
  const handleFinish = useCallback(() => {
    router.replace("/(tabs)");
  }, [router]);
  const value = useMemo<OnboardingContextType>(() => ({
    fullName, setFullName,
    nickname, setNickname,
    photoUri, setPhotoUri,
    nicknameTaken, isNicknameLoading, suggestions,
    currentWeight, setCurrentWeight,
    targetWeight, setTargetWeight,
    weightUnit, setWeightUnit,
    activityLevel, setActivityLevel,
    dailyCalories, setDailyCalories,
    goalDate, setGoalDate,
    currentIndex, totalSteps,
    handleContinue, handleBack, handleFinish,
  }), [
    fullName, nickname, photoUri, nicknameTaken, isNicknameLoading, suggestions,
    currentWeight, targetWeight, weightUnit, activityLevel, dailyCalories, setDailyCalories,
    goalDate, setGoalDate, currentIndex, totalSteps, handleContinue, handleBack, handleFinish
  ]);
  return <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>;
};
export default OnboardingProvider;