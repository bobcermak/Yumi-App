import { AuthContext, AuthProvider } from "@/contexts/AuthContext";
import OnboardingProvider from "@/contexts/OnboardingContext";
import SearchProvider from "@/contexts/SearchContext";
import { SearchItemProvider } from "@/contexts/SearchItemContext";
import IndexProvider from "@/contexts/IndexContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedBackground, AppLoadingSkeleton, RootLayoutContent } from "@/components";
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
              return <AppLoadingSkeleton/>;
            }
            const { session, hasOnboarded } = auth;
            const inAuthGroup = segments[0] === "(auth)";
            const inOnboardingGroup = segments[0] === "(onboarding)";
            if (session) {
              if (inAuthGroup || inOnboardingGroup) {
                return <Redirect href="/(tabs)"/>;
              }
            } else if (hasOnboarded) {
              if (!inAuthGroup) {
                return <Redirect href="/(auth)/login"/>;
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
                    <SearchItemProvider>
                      <ThemeProvider value={customTheme}>
                        <SafeAreaProvider>
                          <StatusBar style="light" />
                          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212' }}/>
                          <AnimatedBackground/>
                          <RootLayoutContent />
                        </SafeAreaProvider>
                      </ThemeProvider>
                    </SearchItemProvider>
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