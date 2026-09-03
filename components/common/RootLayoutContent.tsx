import { Toast } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { preloadStaticProduce } from "@/lib/services/food-search/cache";
import { Stack } from "expo-router";
import { useEffect } from "react";

const RootLayoutContent = () => {
  const { toast } = useIndexContext();
  const { session, hasOnboarded } = useAuth();

  useEffect(() => {
    preloadStaticProduce();
  }, []);

  return (
    <>
      <Toast toast={toast} />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
        <Stack.Protected guard={!session && !hasOnboarded}>
          <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_left' }}/>
        </Stack.Protected>
        <Stack.Protected guard={!session}>
          <Stack.Screen name="(auth)" options={{ animation: 'slide_from_right' }}/>
        </Stack.Protected>
        <Stack.Protected guard={!!session}>
          <Stack.Screen name="(tabs)" options={{ animation: 'fade' }}/>
          <Stack.Screen name="magic-scan" options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="quick-add" options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="create-meal" options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="search-results" options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="search-item/[id]" options={{ animation: 'slide_from_right' }}/>
          <Stack.Screen name="meal-log" options={{ animation: 'slide_from_bottom' }}/>
          <Stack.Screen name="meal-log/add-item" options={{ presentation: 'modal' }}/>
          <Stack.Screen name="users/[id]"/>
        </Stack.Protected>
      </Stack>
    </>
  );
};
export default RootLayoutContent;