import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const Slides = () => {
  //Hooks
  const router = useRouter();

  return (
    <View className="flex-1 bg-[#121212] justify-center items-center px-6">
      <Text className="text-white text-2xl font-bold mb-2">Onboarding Slides</Text>
      <Text className="text-gray-400 text-center mb-8">Tady budou nějaké texty a ukázky výhod po potáhnutí prstem.</Text>
      
      <TouchableOpacity 
        className="bg-indigo-600 rounded-2xl w-full p-4 items-center"
        onPress={() => router.replace('/(auth)/signup')}
      >
        <Text className="text-white font-bold text-lg">Dokončit a Zaregistrovat</Text>
      </TouchableOpacity>
    </View>
  );
}
export default Slides;