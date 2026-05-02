import { completeOnboarding } from "@/lib/helpers/authHelpers";
import supabase from "@/lib/services/supabase/client";
import { getProfile } from "@/lib/services/supabase/queries/setupUserAccount";
import { AuthContextType } from "@/types/authContextType";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session } from "@supabase/supabase-js";
import { useRouter, useSegments } from "expo-router";
import { createContext, useEffect, useState, type FC } from "react";

type AuthProviderProps = {
  children: React.ReactNode
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
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        if (mounted && session) {
          const { data: profile, error: profileError } = await getProfile(session.user.id);
          if (profileError || !profile) {
            console.warn("[Auth] Profile not found for session, signing out...");
            await supabase.auth.signOut();
            setSession(null);
            await AsyncStorage.removeItem("v1_onboarding_done");
            setHasOnboarded(false);
          } else {
            setSession(session);
            const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
            setHasOnboarded(onboarded === "true");
          }
        } else if (mounted) {
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
  const signUp = async (onboardingData?: {
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
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
      if (!emailRegex.test(email)) return { error: { message: "Please enter a valid email address." } };
      if (!passwordRegex.test(password)) return { error: { message: "Password must be at least 8 chars long with a letter and a number." } };
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError || !authData.user) return { error: authError };
      if (onboardingData) {
        const { error: onboardingError } = await completeOnboarding(authData.user.id, onboardingData);
        if (onboardingError) return { error: onboardingError };
      }
      setHasOnboarded(true);
      await AsyncStorage.setItem("v1_onboarding_done", "true");
      return { error: null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "An unexpected error occurred.";
      return { error: { message } };
    } finally {
      setIsLoading(false);
    }
  };
  const signIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? { message: error.message } : null };
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
    signInWithGoogle: async () => ({ error: { message: "Google Sign-In not configured yet. See instructions in AuthContext.tsx" } }),
    signInWithApple: async () => ({ error: { message: "Apple Sign-In not configured yet. See instructions in AuthContext.tsx" } }),
    signOut
  };
  if (!isReady) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};