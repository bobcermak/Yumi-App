import { AuthContext, AuthProvider } from "@/contexts/AuthContext";
import OnboardingProvider from "@/contexts/OnboardingContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Redirect, Stack, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AnimatedBackground } from "@/components";
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

  if (!fontsLoaded) return null;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AuthContext.Consumer>
          {(auth) => {
            if (!auth?.isReady) {
              return (
                <View className="flex-1 bg-[#121212] items-center justify-center">
                  <ActivityIndicator size="large" color="#FFFFFF"/>
                </View>
              );
            }
            const { session, hasOnboarded } = auth;
            const inTabsGroup = segments[0] === "(tabs)";
            if (session && hasOnboarded && !inTabsGroup) return <Redirect href="/(tabs)"/>;
            if ((!session || !hasOnboarded) && inTabsGroup) return <Redirect href="/(onboarding)"/>;
            return (
              <OnboardingProvider>
                <ThemeProvider value={customTheme}>
                  <SafeAreaProvider>
                    <StatusBar style="light" />
                    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212' }}/>
                    <AnimatedBackground/>
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_left' }}/>
                      <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }}/>
                      <Stack.Screen name="(tabs)" options={{ animation: 'fade' }}/>
                      <Stack.Screen name="magic-scan/index"/>
                      <Stack.Screen name="quick-add/index"/>
                      <Stack.Screen name="users/[id]"/>
                    </Stack>
                  </SafeAreaProvider>
                </ThemeProvider>
              </OnboardingProvider>
            );
          }}
        </AuthContext.Consumer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;