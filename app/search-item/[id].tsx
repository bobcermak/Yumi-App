import { Button, Icon, ResultMeal, ResultMealSkeleton } from "@/components";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import { useSearchItem } from "@/lib/hooks/useSearchItem";
import { useRouter } from "expo-router";
import { CaretDown, CaretLeft, Heart, Info } from "phosphor-react-native";
import { useEffect } from "react";
import { ActivityIndicator, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const SearchItem = () => {
  //Contexts
  const { item, isFavorite, isFavoriteLoading, mealType, setMealType, mealData, setMealData, isLoading, isDropdownOpen, setIsDropdownOpen, handleToggleFavorite, handleAddToMeal } = useSearchItem();
  //Router
  const router = useRouter();
  const arrowRotation = useSharedValue(0);
  //Functions
  useEffect(() => {
    arrowRotation.value = withTiming(isDropdownOpen ? 180 : 0, { duration: 250 });
  }, [isDropdownOpen]);
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }]
  }));
  if (!item) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-6">
        <Info size={48} color="#C5E384" weight="regular" />
        <Text className="text-white font-nunito-700 text-2xl mt-4">Item Not Found</Text>
        <Text className="text-white/80 font-nunito-600 text-center">
          We couldn't load the details for this item.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-yellow font-nunito-600 text-lg p-4">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }
  return (
    <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsDropdownOpen(false); }}>
      <View className="flex-1 mt-[88px] items-center justify-between">
        <View className="flex-row w-[380px] self-center justify-between items-center py-4 px-2 z-50">
          <Icon onPress={() => router.back()} className="bg-yellow w-12 h-12">
            <CaretLeft size={24} color="#1D1D1D" weight="regular" />
          </Icon>
          <View className="relative items-center w-[160px]">
            <TouchableOpacity
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex-row items-center justify-center gap-2 w-full"
              activeOpacity={0.25}
            >
              <Text className="font-nunito-700 text-xl text-white" numberOfLines={1}>{mealType}</Text>
              <Animated.View style={animatedArrowStyle}>
                <CaretDown size={20} color="white" weight="bold" />
              </Animated.View>
            </TouchableOpacity>
            {isDropdownOpen && (
              <Animated.View
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(250)}
                className="absolute top-[40px] left-[-25px] bg-dark rounded-[15px] w-[200px] border border-white/10 shadow-2xl overflow-hidden z-[100]"
                style={{
                  shadowColor: "#000000",
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.5,
                  shadowRadius: 20,
                  elevation: 20
                }}
              >
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.25}
                    onPress={() => {
                      setMealType(type);
                      setIsDropdownOpen(false);
                    }}
                    className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? 'bg-yellow/30' : ''}`}
                  >
                    <Text className={`font-nunito-700 text-lg ${mealType === type ? 'text-yellow' : 'text-white'}`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>
          <View className="flex-row gap-2">
            <Icon
              onPress={handleToggleFavorite}
              className="bg-dark w-12 h-12"
              shadowColor="#000000"
              disabled={isFavoriteLoading}
            >
              {isFavoriteLoading ? (
                <ActivityIndicator size="small" color="#C5E384" />
              ) : (
                <Heart size={24} color={isFavorite ? "#C5E384" : "white"} weight={isFavorite ? "fill" : "regular"} />
              )}
            </Icon>
          </View>
        </View>
        <View className="w-full items-center self-center mb-20">
          {isLoading ? <ResultMealSkeleton /> : (
            <ResultMeal
              id={item.id}
              imgSrc={item.image_url || ""}
              title={item.name || "Unknown Product"}
              calories_per_100g={item.calories_per_100g || 0}
              carbs_per_100g={item.carbs_per_100g || 0}
              protein_per_100g={item.protein_per_100g || 0}
              fat_per_100g={item.fat_per_100g || 0}
              rating={item.health_rating}
              initialGrams={100}
              isFavorite={isFavorite}
              isFavoriteLoading={isFavoriteLoading}
              onToggleFavorite={handleToggleFavorite}
              onDataChange={setMealData}
            />
          )}
          <View className="w-full px-4 mt-10 items-center">
            <Button
              className="rounded-[30px] mx-0 w-full py-5"
              textClassName="text-xl"
              onPress={handleAddToMeal}
              disabled={isLoading}
            >
              {isLoading ? "Recording..." : "Record"}
            </Button>
          </View>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default SearchItem;