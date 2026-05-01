import { AuthProvider } from "@/contexts/AuthProvider";
import OnboardingProvider from "@/contexts/OnboardingContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "./globals.css";
import { Image, View, ActivityIndicator } from "react-native";

const customTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#121212"
  }
};
const RootLayout = () => {
  //Hooks
  const fontsLoaded = useCachedFonts();

  if (!fontsLoaded) {
    return <ActivityIndicator/>;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnboardingProvider>
          <ThemeProvider value={customTheme}>
            <SafeAreaProvider>
              <StatusBar style="light"/>
              <View pointerEvents="none" className="absolute top-0 left-0 w-full h-[200px] z-[999]">
                <Image
                  source={require("@/assets/images/shadow.png")}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
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
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;