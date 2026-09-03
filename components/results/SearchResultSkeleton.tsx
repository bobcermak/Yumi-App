import { useEffect, useState } from "react";
import { Animated, View } from "react-native";

const SearchResultSkeleton = () => {
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
    <Animated.View style={{ opacity: fadeAnim }} className="w-[362px] self-center flex-row items-center py-2 px-4">
      <View className="w-12 h-12 rounded-lg mr-3 bg-white/10" />
      <View className="flex-1 mr-20 gap-2 justify-center">
        <View className="h-4 bg-white/10 rounded-md w-3/4" />
        <View className="h-3 bg-white/10 rounded-md w-1/2" />
      </View>
      <View className="items-end gap-2 justify-center">
        <View className="h-4 bg-white/10 rounded-md w-12" />
        <View className="h-3 bg-white/10 rounded-md w-10" />
      </View>
    </Animated.View>
  );
};
export default SearchResultSkeleton;