import { AuthContext, AuthProvider } from "@/contexts/AuthContext";
import OnboardingProvider from "@/contexts/OnboardingContext";
import SearchProvider from "@/contexts/SearchContext";
import IndexProvider from "@/contexts/IndexContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedBackground, Toast } from "@/components";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { preloadStaticProduce } from "@/lib/services/food-search/cache";
import { useEffect } from "react";
import "./globals.css";

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "transparent"
  }
};
const RootLayoutContent = () => {
  const { toast } = useIndexContext();
  return (
    <>
      <Toast toast={toast} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_left' }}/>
        <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }}/>
        <Stack.Screen name="magic-scan/index"/>
        <Stack.Screen name="quick-add/index"/>
        <Stack.Screen name="search-results/index" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="search-item/[id]" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="meal-log/index" options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="meal-log/add-item" options={{ presentation: 'modal' }}/>
        <Stack.Screen name="users/[id]"/>
      </Stack>
    </>
  );
};
const RootLayout = () => {
  //Hooks
  const fontsLoaded = useCachedFonts();
  const segments = useSegments();

  useEffect(() => {
    preloadStaticProduce();
  }, []);
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthContext.Consumer>
          {(auth) => {
            if (!auth?.isReady) {
              return (
                <View className="flex-1 bg-black items-center justify-center">
                  <ActivityIndicator size="large" color="#C5E384"/>
                </View>
              );
            }
            const { session, hasOnboarded } = auth;
            const inAuthGroup = segments[0] === "(auth)";
            const inOnboardingGroup = segments[0] === "(onboarding)";
            if (session && hasOnboarded) {
              if (inAuthGroup || inOnboardingGroup) {
                return <Redirect href="/(tabs)"/>;
              }
            } else {
              if (!inAuthGroup && !inOnboardingGroup) {
                return <Redirect href="/(onboarding)"/>;
              }
            }
            return (
              <OnboardingProvider>
                <IndexProvider>
                  <SearchProvider>
                    <ThemeProvider value={customTheme}>
                      <SafeAreaProvider>
                        <StatusBar style="light" />
                        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212' }}/>
                        <AnimatedBackground/>
                        <RootLayoutContent />
                      </SafeAreaProvider>
                    </ThemeProvider>
                  </SearchProvider>
                </IndexProvider>
              </OnboardingProvider>
            );
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;