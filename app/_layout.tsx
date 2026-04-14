import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "./globals.css";

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <>
        <StatusBar style="light"/>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="movies/[id]" />
        </Stack>
      </>
    </SafeAreaProvider>
  )
}
export default RootLayout;