import { Button, Icon, ResultMeal, ResultMealSkeleton } from "@/components";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import { useSearchItem } from "@/lib/hooks/useSearchItem";
import { useRouter } from "expo-router";
import { CaretDown, CaretLeft, Drop, Heart, Info } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const SearchItem = () => {
  //Contexts
  const { item, isFavorite, isFavoriteLoading, mealType, setMealType, mealData, setMealData, isLoading, isDropdownOpen, setIsDropdownOpen, isDrink, setIsDrink, handleToggleFavorite, handleAddToMeal } = useSearchItem();
  //Router
  const router = useRouter();
  const arrowRotation = useSharedValue(0);
  //Hooks
  const [waterMlInput, setWaterMlInput] = useState<string>((mealData.grams * mealData.count).toString());
  const [isWaterInputFocused, setIsWaterInputFocused] = useState<boolean>(false);
  const [isWaterManual, setIsWaterManual] = useState<boolean>(false);
  const waterInputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isWaterInputFocused && !isWaterManual) {
      setWaterMlInput((mealData.grams * mealData.count).toString());
    }
  }, [mealData.grams, mealData.count, isWaterInputFocused, isWaterManual]);
  useEffect(() => {
    if (!isDrink) setIsWaterManual(false);
  }, [isDrink]);
  const parsedWaterMl = parseInt(waterMlInput) || 0;
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsDropdownOpen(false); }}>
        <View style={{ flex: 1 }}>
          <View className="flex-row w-[380px] self-center justify-between items-center py-4 px-2 z-50 mt-[88px]">
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
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
          >
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
            {!isLoading && (
              <View style={{ width: 362, marginTop: 10 }}>
                <TouchableOpacity
                  activeOpacity={0.25}
                  onPress={() => setIsDrink(!isDrink)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: isDrink ? "rgba(59,130,246,0.35)" : "rgba(255,255,255,0.09)",
                    backgroundColor: isDrink ? "rgba(59,130,246,0.09)" : "rgba(255,255,255,0.03)",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <View style={{
                      width: 34, height: 34, borderRadius: 10,
                      backgroundColor: isDrink ? "rgba(59,130,246,0.18)" : "rgba(255,255,255,0.06)",
                      alignItems: "center", justifyContent: "center",
                    }}>
                      <Drop size={17} color={isDrink ? "#60A5FA" : "rgba(255,255,255,0.3)"} weight={isDrink ? "fill" : "regular"} />
                    </View>
                    <View>
                      <Text style={{ color: isDrink ? "#93C5FD" : "rgba(255,255,255,0.65)", fontFamily: "Nunito_700Bold", fontSize: 14 }}>
                        Count as drink
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Nunito_600SemiBold", fontSize: 11, marginTop: 1 }}>
                        {isDrink ? `Adds to hydration tracker` : "Add ml to hydration"}
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={isDrink}
                    onValueChange={setIsDrink}
                    trackColor={{ false: "rgba(255,255,255,0.12)", true: "#3B82F6" }}
                    thumbColor={isDrink ? "#FFFFFF" : "rgba(255,255,255,0.55)"}
                  />
                </TouchableOpacity>
                {isDrink && (
                  <Animated.View
                    entering={FadeInDown.duration(220).springify()}
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: isWaterInputFocused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.09)",
                      backgroundColor: "rgba(59,130,246,0.06)",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Drop size={15} color="#60A5FA" weight="fill" />
                      <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_600SemiBold", fontSize: 13 }}>
                        Amount to add
                      </Text>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.25}
                      onPress={() => waterInputRef.current?.focus()}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        backgroundColor: isWaterInputFocused ? "rgba(59,130,246,0.15)" : "rgba(0,0,0,0.25)",
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: isWaterInputFocused ? "rgba(59,130,246,0.4)" : "rgba(255,255,255,0.1)",
                      }}
                    >
                      <TextInput
                        ref={waterInputRef}
                        value={waterMlInput}
                        onChangeText={(val) => {
                          const clean = val.replace(/[^0-9]/g, "");
                          setWaterMlInput(clean);
                          setIsWaterManual(true);
                        }}
                        onFocus={() => setIsWaterInputFocused(true)}
                        onBlur={() => setIsWaterInputFocused(false)}
                        keyboardType="numeric"
                        maxLength={4}
                        style={{
                          color: "#93C5FD",
                          fontFamily: "Nunito_700Bold",
                          fontSize: 18,
                          minWidth: 40,
                          textAlign: "right",
                          padding: 0,
                        }}
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        selectTextOnFocus
                      />
                      <Text style={{ color: "rgba(147,197,253,0.65)", fontFamily: "Nunito_600SemiBold", fontSize: 14 }}>
                        ml
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </View>
            )}
            <View className="w-full px-4 mt-4 items-center mt-8">
              <Button
                className="rounded-[30px] mx-0 w-full py-5"
                textClassName="text-xl"
                onPress={() => handleAddToMeal(isDrink ? parsedWaterMl : undefined)}
                disabled={isLoading}
              >
                {isLoading ? "Recording..." : "Record"}
              </Button>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};
export default SearchItem;