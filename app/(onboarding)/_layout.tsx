import { Stack } from "expo-router";

const OnboardingLayout = () => {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="(slides)"/>
    </Stack>
  );
}
export default OnboardingLayout;