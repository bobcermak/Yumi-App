import { AuthProvider } from "@/contexts/AuthContext";
import OnboardingProvider from "@/contexts/OnboardingContext";
import { useCachedFonts } from "@/lib/hooks/useCachedFonts";
import { DarkTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, Image, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
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

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <OnboardingProvider>
          <ThemeProvider value={customTheme}>
            <SafeAreaProvider>
              <StatusBar style="light" />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#121212' }} />
              <View pointerEvents="none" className="absolute top-0 left-0 w-full h-full">
                {[300, 700, 1100].map((y, i) => (
                  <Image
                    key={y}
                    source={require("@/assets/images/side-shadow.png")}
                    className="absolute w-[768px] h-[492px]"
                    style={{
                      top: y - 100,
                      [i % 2 === 0 ? 'right' : 'left']: 0,
                      opacity: 0.8,
                      transform: [{ rotate: i % 2 === 0 ? '0deg' : '180deg' }]
                    }}
                    resizeMode="contain"
                  />
                ))}
              </View>
              <View pointerEvents="none" className="absolute top-0 left-0 w-full h-[200px] z-[999]">
                <Image
                  source={require("@/assets/images/shadow.png")}
                  resizeMode="cover"
                  className="w-full h-full"
                />
              </View>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="(onboarding)"
                  options={{ animation: 'slide_from_left' }}
                />
                <Stack.Screen
                  name="(auth)"
                  options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="magic-scan" />
                <Stack.Screen name="quick-add" />
                <Stack.Screen name="users/[id]" />
              </Stack>
            </SafeAreaProvider>
          </ThemeProvider>
        </OnboardingProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};
export default RootLayout;