import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

const MyMealSkeleton = () => {
  const fadeAnim = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 900, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, [fadeAnim]);
  return (
    <Animated.View
      className="bg-dark rounded-[15px] p-3 flex-row items-center border border-white/10"
      style={{ opacity: fadeAnim }}
    >
      <View className="w-[60px] h-[60px] rounded-[10px] bg-white/10" />
      <View className="flex-1 ml-4 gap-2">
        <View className="h-4 bg-white/10 rounded-md w-3/4" />
        <View className="h-3 bg-white/10 rounded-md w-1/2" />
      </View>
    </Animated.View>
  );
};
export default MyMealSkeleton;