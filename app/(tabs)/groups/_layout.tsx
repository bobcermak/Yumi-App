import { Stack } from "expo-router";

export default function GroupsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
      <Stack.Screen name="index"/>
      <Stack.Screen name="friends"/>
      <Stack.Screen name="clubs/index"/>
      <Stack.Screen name="clubs/[id]/index"/>
      <Stack.Screen name="clubs/[id]/members"/>
    </Stack>
  );
}