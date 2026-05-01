import { createContext, useEffect, useState, type FC } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import supabase from "@/lib/services/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/authContextType";
import { createProfile, addProgressPhotos } from "@/lib/services/supabase/queries/setupUserAccount";
import { uploadImage } from "@/lib/services/supabase/storage";

type AuthProviderProps = {
  children: React.ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  //Hooks
  const [isReady, setIsReady] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadState = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted) {
          setSession(data.session);
          const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
          setHasOnboarded(onboarded === "true");
        }
      } catch (e) {
        console.error("Auth initialization error:", e);
      } finally {
        if (mounted) setIsReady(true);
      }
    };
    loadState();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      if (mounted) setSession(authSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!isReady || !segments || !router) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    if (session) {
      if (!inTabsGroup) {
        router.replace('/(tabs)');
      }
    } else if (hasOnboarded) {
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      if (!inOnboardingGroup && !inAuthGroup) {
        router.replace('/(onboarding)');
      }
    }
  }, [isReady, session, hasOnboarded, segments]);
  const signUp = async (onboardingData?: any) => {
    setIsLoading(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!emailRegex.test(email)) {
        return { error: { message: "Please enter a valid email address." } };
      }
      if (!passwordRegex.test(password)) {
        return { error: { message: "Password must be at least 8 characters long and contain at least one letter and one number." } };
      }
      console.log("[Auth] Starting signUp for:", email);
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) {
        console.error("[Auth] SignUp Error:", authError);
        return { error: authError };
      }
      const userId = authData.user.id;
      console.log("[Auth] Auth successful, User ID:", userId);
      if (onboardingData) {
        let avatarUrl = null;
        if (onboardingData.photoUri) {
          console.log("[Auth] Uploading profile photo...");
          avatarUrl = await uploadImage(onboardingData.photoUri, `${userId}/avatar.webp`, "avatars");
        }
        console.log("[Auth] Creating profile record...");
        const { error: profileError } = await createProfile({
          id: userId,
          username: onboardingData.nickname,
          full_name: onboardingData.fullName,
          avatar_url: avatarUrl,
          current_weight: onboardingData.currentWeight,
          goal_weight: onboardingData.targetWeight,
          daily_calorie_limit: onboardingData.dailyCalories,
        });
        if (profileError) {
          console.error("[Auth] Profile Creation Error:", profileError);
          return { error: profileError };
        }
        const validProgressPhotos = onboardingData.progressPhotos.filter((p: string) => p !== "");
        if (validProgressPhotos.length > 0) {
          console.log(`[Auth] Uploading ${validProgressPhotos.length} progress photos...`);
          const uploadedProgressPhotos = await Promise.all(
            validProgressPhotos.map(async (uri: string, index: number) => {
              const url = await uploadImage(uri, `${userId}/init_${index}.webp`, "progress");
              return { image_url: url || "", weight: onboardingData.currentWeight };
            })
          );
          
          console.log("[Auth] Adding progress photo records...");
          const { error: photoError } = await addProgressPhotos(userId, uploadedProgressPhotos.filter(p => p.image_url !== ""));
          if (photoError) console.error("[Auth] Progress photo insertion error:", photoError);
        }
      }
      setHasOnboarded(true);
      await AsyncStorage.setItem("v1_onboarding_done", "true");
      console.log("[Auth] SignUp process completed successfully");
      return { error: null };
    } catch (e: any) {
      console.error("[Auth] Unexpected SignUp Error:", e);
      return { error: e };
    } finally {
      setIsLoading(false);
    }
  };
  const signIn = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } finally {
      setIsLoading(false);
    }
  };
  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };
  const value = {
    session,
    isReady,
    isLoading,
    hasOnboarded,
    email,
    setEmail,
    password,
    setPassword,
    setHasOnboarded: (value: boolean) => {
      setHasOnboarded(value);
      AsyncStorage.setItem("v1_onboarding_done", value ? "true" : "false");
    },
    signUp,
    signIn,
    signOut
  };
  if (!isReady) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};