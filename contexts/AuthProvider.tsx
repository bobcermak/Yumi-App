import React, { createContext, useEffect, useState, FC } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import supabase from "@/lib/services/supabase/client";
import { Session } from "@supabase/supabase-js";
import { AuthContextType } from "@/types/authContextType";

type AuthProviderProps = {
  children: React.ReactNode;
}
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  //Hooks
  const [isReady, setIsReady] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);
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
      if (!inOnboardingGroup) {
        router.replace('/(onboarding)');
      }
    }
  }, [isReady, session, hasOnboarded, segments]);
  const value = {
    session,
    isReady,
    hasOnboarded,
    setHasOnboarded: (value: boolean) => {
      setHasOnboarded(value);
      AsyncStorage.setItem("v1_onboarding_done", value ? "true" : "false");
    }
  };
  if (!isReady) return null;
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};