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

  //State - User Data
  const [fullName, setFullName] = useState<string>("");
  const [nickname, setNickname] = useState<string>("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  //Validation & Fetching
  const fetchNicknameStatus = useCallback(() => checkNicknameIfExists(nickname), [nickname]);
  
  const { data: nicknameTakenResult, loading: isNicknameLoading, refetch: refetchNickname, reset: resetNicknameStatus } = useFetch(
    fetchNicknameStatus,
    false
  );

  const nicknameTaken = !!nicknameTakenResult;

  //Computed
  const currentIndex = SLIDES.findIndex((slide) => pathname.includes(slide));
  const totalSteps = SLIDES.length;

  //Debounce nickname check
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

  //Generate suggestions when nickname is taken
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

  //Functions - Navigation
  const handleContinue = useCallback(() => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < SLIDES.length) {
      router.push(`/(onboarding)/(slides)/${SLIDES[nextIndex]}` as any);
    }
  }, [currentIndex, router]);

  const handleBack = useCallback(() => {
    if (router.canGoBack()) router.back();
  }, [router]);

  //Functions - Submit
  const handleFinish = useCallback(() => {
    //TODO: Save data to database / API
    console.log("Onboarding finished:", { fullName, nickname, photoUri });
    router.replace("/(tabs)");
  }, [fullName, nickname, photoUri, router]);

  //Memoized Value
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