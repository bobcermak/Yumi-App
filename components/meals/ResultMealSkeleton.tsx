import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

const ResultMealSkeleton = () => {
  //Refs
  const [fadeAnim] = useState(() => new Animated.Value(0.25));
  //Effects
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        flex: 1
      }}
      className="self-center rounded-[20px] overflow-hidden bg-dark border border-white/10 pb-5 w-[362px]"
    >
      <View className="w-[362px] h-[200px] bg-white/10" />
      <View className="absolute top-4 left-4 w-16 h-7 bg-white/10 rounded-[10px]" />
      <View className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full" />
      <View className="px-4 mt-6 flex-row justify-between items-center">
        <View className="h-7 bg-white/10 rounded-lg w-[180px]" />
        <View className="h-10 bg-white/10 rounded-[10px] w-[60px]" />
      </View>
      <View className="px-4 mt-4 flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className="h-10 bg-white/10 rounded-lg w-[90px]" />
          <View className="h-6 bg-white/10 rounded-lg w-[30px]" />
          <View className="w-7 h-7 bg-white/10 rounded-full" />
        </View>
        <View className="h-10 bg-white/10 rounded-[10px] w-[90px]" />
      </View>
      <View className="px-4 mt-6 flex-row gap-[2px]">
        <View className="h-4 bg-white/10 rounded-tl-[2px] rounded-bl-[2px] flex-1" />
        <View className="h-4 bg-white/10 w-[80px]" />
        <View className="h-4 bg-white/10 rounded-tr-[2px] rounded-br-[2px] w-[60px]" />
      </View>
      <View className="mt-6 flex-row justify-center gap-10">
        {[0, 1, 2].map((i) => (
          <View key={i} className="items-center gap-2">
            <View className="h-5 bg-white/10 rounded-md w-[60px]" />
            <View className="h-6 bg-white/10 rounded-md w-[50px]" />
          </View>
        ))}
      </View>
    </Animated.View>
  );
};
export default ResultMealSkeleton;