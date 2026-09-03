import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

const PopularMealSkeleton = () => {
  //Refs
  const [fadeAnim] = useState(() => new Animated.Value(0.3));
  //Animations
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);
  return (
    <Animated.View 
      className="bg-dark rounded-[15px] overflow-hidden w-[200px] mr-4"
      style={{
        height: 184,
        opacity: fadeAnim,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      }}
    >
      <View className="w-full h-[90px] bg-white/10" />
      <View className="mt-2 px-4 pb-3 flex-row justify-between gap-2 items-center flex-1">
        <View className="gap-2 flex-1 justify-center">
          <View className="h-5 bg-white/10 rounded-md w-3/4" />
          <View className="h-4 bg-white/10 rounded-md w-1/2" />
        </View>
        <View className="w-5 h-5 bg-white/10 rounded-full" />
      </View>
    </Animated.View>
  );
};
export default PopularMealSkeleton;