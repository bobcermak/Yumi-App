import { Toast } from "@/components";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { Stack } from "expo-router";

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
        <Stack.Screen name="create-meal/index" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="search-results/index" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="search-item/[id]" options={{ animation: 'slide_from_right' }}/>
        <Stack.Screen name="meal-log/index" options={{ animation: 'slide_from_bottom' }}/>
        <Stack.Screen name="meal-log/add-item" options={{ presentation: 'modal' }}/>
        <Stack.Screen name="users/[id]"/>
      </Stack>
    </>
  );
};
export default RootLayoutContent;