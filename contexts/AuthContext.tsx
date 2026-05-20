import { completeOnboarding } from "@/lib/helpers/authHelpers";
import supabase from "@/lib/services/supabase/client";
import { getProfile, checkUsernameIfExists } from "@/lib/services/supabase/queries/setupUserAccount";
import { AuthContextType } from "@/types/authContextType";
import { Profile } from "@/types/database/dbModels";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import React, { createContext, useEffect, useState, type FC, useCallback, useRef } from "react";
import { posthog } from "@/lib/config/posthog";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: React.ReactNode
}
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  //Hooks
  const [isReady, setIsReady] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const isSigningUpRef = useRef<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, authSession) => {
      if (!mounted) return;
      if (isSigningUpRef.current) return;
      if (event === 'INITIAL_SESSION') {
        try {
          if (authSession) {
            const { data: profile, error: profileError } = await getProfile(authSession.user.id);
            if (profileError || !profile) {
              console.warn("[Auth] Profile not found for session, signing out...");
              await supabase.auth.signOut();
              setSession(null);
              setUserProfile(null);
              await AsyncStorage.removeItem("v1_onboarding_done");
              setHasOnboarded(false);
            } else {
              setSession(authSession);
              setUserProfile(profile);
              posthog.identify(authSession.user.id, {
                $set: { username: profile.username ?? null },
              });
              const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
              setHasOnboarded(onboarded === "true");
            }
          } else {
            const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
            setHasOnboarded(onboarded === "true");
          }
        } catch (e) {
          console.error("Auth initialization error:", e);
        } finally {
          if (mounted) setIsReady(true);
        }
        return;
      }
      if (authSession) {
        const { data: profile } = await getProfile(authSession.user.id);
        if (!profile) {
          await supabase.auth.signOut();
          return;
        }
        const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
        if (mounted) {
          setUserProfile(profile);
          setHasOnboarded(onboarded === "true");
          setSession(authSession);
        }
      } else {
        setSession(null);
        setUserProfile(null);
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const signUp = useCallback(async (onboardingData?: {
    fullName: string;
    username: string;
    photoUri: string | null;
    progressPhotos: string[];
    currentWeight: number;
    targetWeight: number;
    dailyCalories: number;
    activityLevel: number;
    weightUnit: "kg" | "lb";
    goalDate: string | null;
  }) => {
    setIsLoading(true);
    isSigningUpRef.current = true;
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!emailRegex.test(email)) return { error: { message: "Please enter a valid email address." } };
      if (!passwordRegex.test(password)) return { error: { message: "Password must be at least 8 chars long with a letter and a number." } };
      if (onboardingData) {
        const isTaken = await checkUsernameIfExists(onboardingData.username);
        if (isTaken) return { error: { message: "This username is already taken. Please choose a different one." } };
      }
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) return { error: authError ?? { message: "Sign up failed." } };
      if (onboardingData) {
        const { error: onboardingError } = await completeOnboarding(authData.user.id, onboardingData);
        if (onboardingError) {
          await supabase.auth.signOut();
          return { error: onboardingError };
        }
      }
      const { data: sessionData } = await supabase.auth.getSession();
      const { data: profile } = await getProfile(authData.user.id);
      setUserProfile(profile ?? null);
      setHasOnboarded(true);
      await AsyncStorage.setItem("v1_onboarding_done", "true");
      if (sessionData.session) setSession(sessionData.session);

      posthog.identify(authData.user.id, {
        $set: { username: onboardingData ? onboardingData.username : null },
        $set_once: { signup_date: new Date().toISOString() },
      });
      posthog.capture('user_signed_up', {
        has_onboarding_data: !!onboardingData,
      });
      if (onboardingData) {
        posthog.capture('onboarding_completed', {
          activity_level: onboardingData.activityLevel,
          weight_unit: onboardingData.weightUnit,
          daily_calories: onboardingData.dailyCalories,
          has_goal_date: !!onboardingData.goalDate,
          has_profile_photo: !!onboardingData.photoUri,
        });
      }

      return { error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred.";
      return { error: { message } };
    } finally {
      isSigningUpRef.current = false;
      setIsLoading(false);
    }
  }, [email, password]);
  const signIn = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) {
        posthog.identify(data.user.id);
        posthog.capture('user_logged_in', {
          method: 'password',
        });
      }
      return { error: error ? { message: error.message } : null };
    } finally {
      setIsLoading(false);
    }
  }, [email, password]);
  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      posthog.capture('user_logged_out');
      posthog.reset();
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  }, []);
  /*
    =================================================================================
    NÁVOD NA ZPROVOZNĚNÍ NATIVNÍHO GOOGLE LOGINU (VARIANTA B):
    =================================================================================
    1. Nainstaluj knihovnu: npx expo install @react-native-google-signin/google-signin
    2. V Google Cloud Console vytvoř 3 OAuth Client IDs:
       - Web Application (pro Supabase)
       - Android (vyžaduje tvé SHA-1 z Expo dashboardu)
       - iOS (vyžaduje Bundle ID)
    3. V Supabase Dashboardu (Auth -> Providers -> Google) zapni Google login
       a vlož tam Client ID a Client Secret z té "Web Application".
    4. V app.json přidej expo-google-signin plugin a Bundle ID/Package name.
    5. Spusť npx expo run:android nebo run:ios (vyžaduje Development Build).
    =================================================================================
  */
  /*
  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      // 1. Inicializace (vlož své Web Client ID z Google Console)
      // GoogleSignin.configure({ webClientId: 'TVOJE_WEB_CLIENT_ID.apps.googleusercontent.com' });
      // 2. Samotné přihlášení k Googlu
      // const { idToken } = await GoogleSignin.signIn();
      // 3. Výměna Google tokenu za Supabase session
      // const { data, error } = await supabase.auth.signInWithIdToken({
      //   provider: 'google',
      //   token: idToken,
      // });
      // return { error };
    } catch (e) {
      console.error("Google login error:", e);
      return { error: e };
    } finally {
      setIsLoading(false);
    }
  };
  */
  /*
  const signInWithApple = async () => {
    setIsLoading(true);
    try {
      // 1. Získání Apple Identity Tokenu
      // const credential = await AppleAuthentication.signInAsync({
      //   requestedScopes: [
      //     AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      //     AppleAuthentication.AppleAuthenticationScope.EMAIL,
      //   ],
      // });
      // 2. Předání tokenu Supabase
      // if (credential.identityToken) {
      //   const { data, error } = await supabase.auth.signInWithIdToken({
      //     provider: 'apple',
      //     token: credential.identityToken,
      //   });
      //   return { error };
      // }
      // return { error: { message: "No identity token found" } };
    } catch (e: unknown) {
      if (e && typeof e === 'object' && 'code' in e && e.code === 'ERR_CANCELED') return { error: null };
      return { error: e as Error };
    } finally {
      setIsLoading(false);
    }
  };
  */
  /*
    =================================================================================
    NÁVOD NA ZPROVOZNĚNÍ APPLE LOGINU:
    =================================================================================
    1. Nainstaluj knihovnu: npx expo install expo-apple-authentication
    2. V Apple Developer Portálu:
       - Vytvoř App ID s povoleným "Sign In with Apple"
       - Vytvoř Service ID a Key (.p8 soubor)
    3. V Supabase Dashboardu (Auth -> Providers -> Apple):
       - Zapni Apple login
       - Vlož Bundle ID, Team ID, Key ID a obsah .p8 souboru.
    4. V app.json přidej "expo-apple-authentication" do pluginů.
    =================================================================================
  */
  const refreshProfile = useCallback(async () => {
    if (session?.user.id) {
      const { data: profile } = await getProfile(session.user.id);
      if (profile) setUserProfile(profile);
    }
  }, [session?.user.id]);
  const value = {
    session,
    userProfile,
    refreshProfile,
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
    signInWithGoogle: async () => ({ error: { message: "Google Sign-In not configured yet. See instructions in AuthContext.tsx" } }),
    signInWithApple: async () => ({ error: { message: "Apple Sign-In not configured yet. See instructions in AuthContext.tsx" } }),
    signOut
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};