import { Button, Icon, ResultMeal } from "@/components";
import MealLogIngredientCard from "@/components/meals/MealLogIngredientCard";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import type { MagicScanResult } from "@/lib/services/food-search/magic-scan";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretDown, CaretLeft, Heart, PencilSimple, Plus, Sparkle } from "phosphor-react-native";
import { useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MealLog = () => {
  //Router
  const router = useRouter();
  const insets = useSafeAreaInsets();
  //Params
  const { scanResult: scanResultParam, photoUri: photoUriParam } = useLocalSearchParams<{
    scanResult: string;
    photoUri: string;
  }>();
  const result: MagicScanResult | null = scanResultParam
    ? (JSON.parse(scanResultParam) as MagicScanResult)
    : null;
  //Hooks
  const [mealType, setMealType] = useState<string>(MEAL_TYPES[2]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoading] = useState(false);
  const [components, setComponents] = useState(result?.components ?? []);
  const [mealData, setMealData] = useState<{
    grams: number;
    count: number;
    calories: number;
    waterMl: number;
  } | null>(null);
  const arrowRotation = useSharedValue(0);
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));
  //Functions
  const toggleDropdown = () => {
    const next = !isDropdownOpen;
    setIsDropdownOpen(next);
    arrowRotation.value = withTiming(next ? 180 : 0, { duration: 250 });
  };
  if (!result) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white font-nunito-700 text-xl">No scan result</Text>
      </View>
    );
  }
  const safeWeight = result.weight_g > 0 ? result.weight_g : 100;
  const cal100 = (result.calories / safeWeight) * 100;
  const carbs100 = (result.carbs_g / safeWeight) * 100;
  const protein100 = (result.protein_g / safeWeight) * 100;
  const fat100 = (result.fat_g / safeWeight) * 100;
  return (
    <View style={{ flex: 1 }} onTouchStart={() => isDropdownOpen && setIsDropdownOpen(false)}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 148 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View
          className="flex-row w-[380px] self-center justify-between items-center py-4 z-50"
          style={{ marginTop: insets.top + 16 }}
        >
          <Icon onPress={() => router.back()} className="bg-yellow w-12 h-12">
            <CaretLeft size={24} color="#1D1D1D" weight="regular" />
          </Icon>
          <View className="relative items-center w-[160px]">
            <TouchableOpacity
              onPress={toggleDropdown}
              activeOpacity={0.25}
              className="flex-row items-center justify-center gap-2 w-full"
            >
              <Text className="font-nunito-700 text-xl text-white" numberOfLines={1}>
                {mealType}
              </Text>
              <Animated.View style={animatedArrowStyle}>
                <CaretDown size={20} color="white" weight="bold" />
              </Animated.View>
            </TouchableOpacity>
            {isDropdownOpen && (
              <Animated.View
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(250)}
                className="absolute top-[44px] bg-dark rounded-[15px] w-[200px] border border-white/10 overflow-hidden z-[100]"
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 20,
                  left: -20,
                }}
              >
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.25}
                    onPress={() => {
                      setMealType(type);
                      setIsDropdownOpen(false);
                      arrowRotation.value = withTiming(0, { duration: 250 });
                    }}
                    className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? "bg-yellow/30" : ""}`}
                  >
                    <Text className={`font-nunito-700 text-lg ${mealType === type ? "text-yellow" : "text-white"}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>
          <Icon
            onPress={() => setIsFavorite((v) => !v)}
            className="bg-dark w-12 h-12"
            shadowColor="#000000"
            disabled={isFavoriteLoading}
          >
            {isFavoriteLoading ? (
              <ActivityIndicator size="small" color="#C5E384"/>
            ) : (
              <Heart
                size={24}
                color={isFavorite ? "#C5E384" : "white"}
                weight={isFavorite ? "fill" : "regular"}
              />
            )}
          </Icon>
        </View>
        <Animated.View entering={FadeInDown.duration(250)} className="w-[362px] self-center mt-2 mb-5">
          <Button
            className="rounded-[30px] mx-0 w-full py-5"
            textClassName="text-xl"
            onPress={() => {}}
          >
            Record
          </Button>
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(60).duration(250)} className="w-[362px] self-center mb-3">
          <Text className="text-white font-nunito-800 text-xl mb-3">My Meal</Text>
          <View className="flex-row items-center justify-between bg-dark rounded-[14px] px-4 py-3 border border-white/10 mb-3">
            <Text className="text-white/60 font-nunito-600 text-base">Not Right?</Text>
            <TouchableOpacity
              activeOpacity={0.25}
              onPress={() => router.back()}
              className="flex-row items-center gap-1 bg-yellow rounded-[10px] px-3 py-2"
            >
              <Sparkle size={16} color="#1D1D1D" weight="fill" />
              <Text className="text-dark font-nunito-700 text-sm">Replace</Text>
            </TouchableOpacity>
          </View>
          <ResultMeal
            imgSrc={photoUriParam || ""}
            title={result.name}
            calories_per_100g={cal100}
            carbs_per_100g={carbs100}
            protein_per_100g={protein100}
            fat_per_100g={fat100}
            initialGrams={safeWeight}
            initialCount={1}
            isFavorite={isFavorite}
            isFavoriteLoading={isFavoriteLoading}
            onToggleFavorite={() => setIsFavorite((v) => !v)}
            onDataChange={setMealData}
          />
        </Animated.View>
        {components.length > 0 && (
          <Animated.View entering={FadeInDown.delay(120).duration(250)} className="w-[362px] self-center mt-4">
            <Text className="font-nunito-700 text-[28px] text-white">What's inside?</Text>
            <View className="gap-3">
              {components.map((comp, i) => (
                <MealLogIngredientCard
                  key={i}
                  index={i}
                  emoji={comp.emoji}
                  name={comp.name}
                  weight_g={comp.weight_g}
                  calories={comp.calories}
                  carbs_g={comp.carbs_g}
                  fat_g={comp.fat_g}
                  protein_g={comp.protein_g}
                  onDelete={() => setComponents((prev) => prev.filter((_, idx) => idx !== i))}
                />
              ))}
            </View>
            <Animated.View entering={FadeInDown.delay(components.length * 80 + 120).duration(250)} className="mt-8">
              <Button
                className="rounded-[30px] mx-0 w-full py-5 bg-yellow"
                textClassName="text-xl"
                onPress={() => router.push({ pathname: "/meal-log/add-item" })}
                icon={<Plus size={24} color="#1D1D1D" weight="bold"/>}
              >
                Add More
              </Button>
            </Animated.View>
          </Animated.View>
        )}
      </ScrollView>
      <Animated.View
        entering={FadeInDown.delay(300).duration(250)}
        className="absolute right-5"
        style={{ bottom: insets.bottom + 20 }}
      >
        <Icon
          onPress={() => {}}
          className="bg-yellow w-14 h-14"
        >
          <PencilSimple size={24} color="#1D1D1D" weight="regular" />
        </Icon>
      </Animated.View>
    </View>
  );
};
export default MealLog;