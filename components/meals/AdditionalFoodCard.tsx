import type { FoodSearchResult } from "@/types/foodSearchResult";
import { Minus as MinusIcon, Plus, X } from "phosphor-react-native";
import { type FC, useEffect, useRef, useState } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";
import ReAnimated, { FadeInDown, FadeInRight, FadeOutRight } from "react-native-reanimated";
import { Icon } from "@/components";

type AdditionalFoodCardProps = {
  food: FoodSearchResult;
  mealType: string;
  onDone: () => void;
  onCountChange?: (count: number) => void;
  isLoading?: boolean;
};

const AdditionalFoodCard: FC<AdditionalFoodCardProps> = ({ food, mealType, onDone, onCountChange, isLoading }) => {
  const [count, setCount] = useState(1);
  const [isCountOpen, setIsCountOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!isLoading) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.7, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [isLoading, fadeAnim]);

  const handleCountChange = (newCount: number) => {
    setCount(newCount);
    onCountChange?.(newCount);
  };

  return (
    <ReAnimated.View entering={FadeInDown.duration(250).springify()} style={{ marginTop: 16 }}>
      {isCountOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setIsCountOpen(false)}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }}
        />
      )}
      <View className="flex-row items-center bg-white/5 border border-white/10 p-3 rounded-[20px]">
        {isLoading ? (
          <Animated.View style={{ opacity: fadeAnim, flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.1)" }} />
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
              <View style={{ height: 16, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 6, width: "70%" }} />
              <View style={{ height: 12, backgroundColor: "rgba(255,255,255,0.07)", borderRadius: 6, width: "45%" }} />
            </View>
            <View style={{ width: 44, height: 32, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.07)", marginLeft: 16, marginRight: 8 }} />
            <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.07)" }} />
          </Animated.View>
        ) : (
          <>
            <Image
              source={food.image_url ? { uri: food.image_url } : require("@/assets/images/not-found-meal.webp")}
              style={{ width: 44, height: 44, borderRadius: 10 }}
              resizeMode="cover"
            />
            <View className="flex-1 ml-3">
              <Text className="text-white font-nunito-700 text-lg" numberOfLines={1}>
                {food.name}
              </Text>
              <Text className="text-yellow font-nunito-600 text-sm">
                Added to {mealType}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, zIndex: 20, marginLeft: 12 }}>
              <View style={{ alignItems: "flex-end" }}>
                {isCountOpen && (
                  <ReAnimated.View
                    entering={FadeInRight.springify()}
                    exiting={FadeOutRight.duration(250)}
                    className="absolute -top-14 right-0 flex-row items-center bg-[#2B2B2B] border border-white/10 rounded-[15px] px-2 gap-1"
                    style={{ shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
                  >
                    <TouchableOpacity
                      onPress={() => handleCountChange(Math.max(1, count - 1))}
                      className="p-3"
                      disabled={count <= 1}
                    >
                      <MinusIcon size={20} color={count <= 1 ? "#FFFFFF30" : "white"} weight="bold" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleCountChange(count + 1)}
                      className="p-3"
                    >
                      <Plus size={20} color="white" weight="bold" />
                    </TouchableOpacity>
                  </ReAnimated.View>
                )}
                <TouchableOpacity
                  onPress={() => setIsCountOpen((prev) => !prev)}
                  activeOpacity={0.25}
                  className={`justify-center items-center rounded-[10px] px-3 py-2 border border-white/10 ${isCountOpen ? "bg-yellow" : "bg-[#2B2B2B]"}`}
                >
                  <Text className={`font-nunito-500 text-base ${isCountOpen ? "text-dark" : "text-white/50"}`}>
                    x<Text className={`font-nunito-700 text-lg ${isCountOpen ? "text-dark" : "text-white"}`}>{count}</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              <Icon onPress={onDone} className="bg-dark/25 border border-white/10 w-8 h-8" shadowColor="#000000">
                <X size={14} color="white" weight="bold" />
              </Icon>
            </View>
          </>
        )}
      </View>
    </ReAnimated.View>
  );
};

export default AdditionalFoodCard;
