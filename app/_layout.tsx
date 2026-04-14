import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./globals.css";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="magic-scan" />
        <Stack.Screen name="quick-add" />
        <Stack.Screen name="users/[id]" />
      </Stack>
    </SafeAreaProvider>
  );
}
// ─────────────────────────────────────────────────────────────────────────────
// 🔐 PRODUCTION FLOW
// Odkomentovat až budou hotové: app/(onboarding)/index.tsx + app/(auth)/login.tsx
// ─────────────────────────────────────────────────────────────────────────────

// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Stack, useRouter } from "expo-router";
// import { useEffect, useState } from "react";
// import { SafeAreaProvider } from "react-native-safe-area-context";
// import { StatusBar } from "expo-status-bar";
// import "./globals.css";
//
// const ONBOARDING_KEY = "yumi_onboarding_done";
//
// // TODO: Nahradit Supabase auth hookem
// // import { useSession } from "@/lib/auth";
// function useAuth() {
//   // ← změň na true pro přeskočení loginu při testování
//   const [isLoggedIn] = useState(false);
//   return { isLoggedIn };
// }
//
// export default function RootLayout() {
//   const router = useRouter();
//   const { isLoggedIn } = useAuth();
//   const [isReady, setIsReady] = useState(false);
//
//   useEffect(() => {
//     const bootstrap = async () => {
//       const onboardingDone = await AsyncStorage.getItem(ONBOARDING_KEY);
//
//       if (!isLoggedIn) {
//         if (!onboardingDone) {
//           router.replace("/(onboarding)"); // 1. spuštění → onboarding
//         } else {
//           router.replace("/(auth)/login"); // vrací se → login
//         }
//       } else {
//         router.replace("/(tabs)");         // přihlášen → home
//       }
//
//       setIsReady(true);
//     };
//     bootstrap();
//   }, [isLoggedIn]);
//
//   if (!isReady) return null; // expo-splash-screen drží splash dokud není ready
//
//   return (
//     <SafeAreaProvider>
//       <StatusBar style="light" />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(onboarding)" />
//         <Stack.Screen name="(auth)" />
//         <Stack.Screen name="(tabs)" />
//         <Stack.Screen name="magic-scan" />
//         <Stack.Screen name="quick-add" />
//         <Stack.Screen name="users/[id]" />
//       </Stack>
//     </SafeAreaProvider>
//   );
// }