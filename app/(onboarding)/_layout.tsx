import { Stack } from "expo-router";
import OnboardingProvider from "@/contexts/OnboardingContext";

const OnboardingLayout = () => {
  return (
    <OnboardingProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index"/>
        <Stack.Screen name="(slides)"/>
      </Stack>
    </OnboardingProvider>
  );
}
export default OnboardingLayout;