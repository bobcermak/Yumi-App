import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, DarkTheme } from "@react-navigation/native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import supabase from "@/lib/services/supabase/client";
import { Session } from "@supabase/supabase-js";
import "./globals.css";

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#121212"
  }
};
const _Layout = () => {
  //Hooks
  const router = useRouter();
  const segments = useSegments();
  const [isReady, setIsReady] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        const onboarded = await AsyncStorage.getItem("v1_onboarding_done");
        setHasOnboarded(onboarded === "true");
      } catch (e) {
        console.error("Boot routing error:", e);
      } finally {
        setIsReady(true);
      }
    };
    loadState();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, authSession) => {
      setSession(authSession);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  useEffect(() => {
    if (!isReady) return;
    const inAuthGroup = segments[0] === '(auth)';
    const inOnboardingGroup = segments[0] === '(onboarding)';
    const inTabsGroup = segments[0] === '(tabs)';
    if (session) {
      if (!inTabsGroup) router.replace('/(tabs)');
    } else if (hasOnboarded) {
      if (!inAuthGroup) router.replace('/(auth)/login');
    } else {
      if (!inOnboardingGroup) router.replace('/(onboarding)');
    }
  }, [isReady, session, hasOnboarded, segments]);
  if (!isReady) return null;
  return (
    <ThemeProvider value={customTheme}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)"/>
          <Stack.Screen name="(onboarding)"/>
          <Stack.Screen name="(tabs)"/>  
          <Stack.Screen name="magic-scan"/>
          <Stack.Screen name="quick-add"/>
          <Stack.Screen name="users/[id]"/>
        </Stack>
      </SafeAreaProvider>
    </ThemeProvider>
  )
}
export default _Layout;