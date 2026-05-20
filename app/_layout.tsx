import { AuthContext, AuthProvider } from "@/contexts/AuthContext";
import OnboardingProvider from "@/contexts/OnboardingContext";
import SearchProvider from "@/contexts/SearchContext";
import { SearchItemProvider } from "@/contexts/SearchItemContext";
import IndexProvider from "@/contexts/IndexContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { posthog } from "@/lib/config/posthog";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, useSegments, usePathname, useGlobalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedBackground, AppLoadingSkeleton, RootLayoutContent } from "@/components";
import { useEffect, useRef } from "react";
import { PostHogProvider } from "posthog-react-native";
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
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const previousPathname = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (previousPathname.current !== pathname) {
      posthog.screen(pathname, {
        previous_screen: previousPathname.current ?? null,
        ...params,
      });
      previousPathname.current = pathname;
    }
  }, [pathname, params]);
  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        client={posthog}
        autocapture={{
          captureScreens: false,
          captureTouches: true,
          propsToCapture: ['testID'],
          maxElementsCaptured: 20,
        }}
      >
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
      </PostHogProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;