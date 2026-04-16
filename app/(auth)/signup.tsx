import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const Signup = () => {
  //Hooks
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#121212] justify-center items-center px-6">
      <Text className="text-white text-3xl font-bold mb-4">Sign Up</Text>
      <Text className="text-gray-400 mb-8">Zde bude vytvoření účtu (přesměrováno po onboardingu).</Text>
      <TouchableOpacity 
        className="mt-6"
        onPress={() => router.replace('/(auth)/login')}
      >
        <Text className="text-gray-400 font-medium">Already have an account? <Text className="text-indigo-400">Sign in</Text></Text>
      </TouchableOpacity>
    </View>
  );
}
export default Signup;