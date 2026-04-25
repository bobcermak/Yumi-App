import { OnboardingContextType } from "@/types/onboardingContextType";
import { usePathname, useRouter } from "expo-router";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import useFetch from "@/lib/hooks/useFetch";
import { checkNicknameIfExists } from "@/lib/services/supabase/queries/setupUserAccount";
import { generateSuggestions } from "@/lib/helpers/onBoardingHelpers";

const SLIDES = ["user-information", "calculate-weight", "results-weight", "take-photo"];

export const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

type OnboardingProviderProps = {
  children: ReactNode;
}
const OnboardingProvider: FC<OnboardingProviderProps> = ({ children }) => {
  //Hooks
  const router = useRouter();
  const pathname = usePathname();
  const [fullName, setFullName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentWeight, setCurrentWeight] = useState<number>(70);
  const [targetWeight, setTargetWeight] = useState<number>(65);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lb'>('kg');
  const [goalDate, setGoalDate] = useState<string | null>(null);

  //Fetch
  const fetchNicknameStatus = useCallback(() => checkNicknameIfExists(nickname), [nickname]);
  const { data: nicknameTakenResult, loading: isNicknameLoading, refetch: refetchNickname, reset: resetNicknameStatus } = useFetch(
    fetchNicknameStatus,
    false
  );
  const nicknameTaken = !!nicknameTakenResult;
  
  const currentIndex = SLIDES.findIndex((slide) => pathname.includes(slide));
  const totalSteps = SLIDES.length;
  
  useEffect(() => {
    if (nickname.trim().length >= 2) {
      const timeout = setTimeout(() => {
        refetchNickname();
      }, 500);
      return () => clearTimeout(timeout);
    } else {
      resetNicknameStatus();
      setSuggestions([]);
    }
  }, [nickname, refetchNickname, resetNicknameStatus]);
  useEffect(() => {
    if (!isNicknameLoading) {
      if (nicknameTakenResult) {
        setSuggestions(generateSuggestions(nickname.trim()));
      } else {
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
    }
  }, [nicknameTakenResult, isNicknameLoading, nickname]);
  //Functions
  const handleContinue = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < SLIDES.length) {
      router.push(`/(onboarding)/(slides)/${SLIDES[nextIndex]}` as any);
    }
  }, [currentIndex, router]);
  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);
  const handleFinish = useCallback(() => {
    console.log("Onboarding finished:", { fullName, nickname, photoUri });
    router.replace("/(tabs)");
  }, [fullName, nickname, photoUri, router]);
  //Memorized Value
  const value = useMemo<OnboardingContextType>(() => ({
    fullName,
    setFullName,
    nickname,
    setNickname,
    photoUri,
    setPhotoUri,
    nicknameTaken,
    isNicknameLoading,
    suggestions,
    currentWeight,
    setCurrentWeight,
    targetWeight,
    setTargetWeight,
    weightUnit,
    setWeightUnit,
    goalDate,
    setGoalDate,
    currentIndex,
    totalSteps,
    handleContinue,
    handleBack,
    handleFinish,
  }), [
    fullName, 
    nickname, 
    photoUri, 
    nicknameTaken, 
    isNicknameLoading, 
    suggestions, 
    currentWeight,
    targetWeight,
    weightUnit,
    goalDate,
    currentIndex, 
    totalSteps, 
    handleContinue, 
    handleBack, 
    handleFinish
  ]);
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};
export default OnboardingProvider;