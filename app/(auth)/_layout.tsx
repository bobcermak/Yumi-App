import { Stack } from "expo-router";
import { View } from "react-native";

const AuthLayout = () => {
  return (
    <View className="flex-1 mt-[56px] w-[380px] px-1 mx-auto z-0">
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "transparent" } }}>
        <Stack.Screen name="login"/>
        <Stack.Screen name="signup"/>
      </Stack>
    </View>
  );
}
export default AuthLayout;