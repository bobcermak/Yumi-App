import { AdditionalFoodCard, AddMoreModal, Button, Icon, ResultMeal, ResultMealSkeleton } from "@/components";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import { format, parseISO } from "date-fns";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import { useSearchItem } from "@/lib/hooks/useSearchItem";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { updateMealLogCount } from "@/lib/services/supabase/queries/mealLogs";
import { consumeQuickAdd } from "@/lib/helpers/quickAddSource";
import { useGlobalSearchParams, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretDown, CaretLeft, Drop, Heart, Info, Plus, X } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SearchItem = () => {
  //Contexts
  const { item, isFavorite, isFavoriteLoading, mealType, setMealType, mealData, setMealData, isLoading, isDropdownOpen, setIsDropdownOpen, isDrink, setIsDrink, handleToggleFavorite, handleAddToMeal, handleUpdateMeal, handleDeleteMeal, source, logDate } = useSearchItem();
  const { userProfile } = useAuth();
  const { refreshData } = useIndexContext();
  const isDeleteMode = source === "delete";
  const logDateLabel = logDate ? format(parseISO(logDate), 'd MMM') : null;
  const { initialGrams: initialGramsStr, initialCount: initialCountStr } = useGlobalSearchParams<{ initialGrams?: string; initialCount?: string }>();
  const initialGramsNum = isDeleteMode ? (parseInt(initialGramsStr || '100') || 100) : 100;
  const initialCountNum = isDeleteMode ? (parseInt(initialCountStr || '1') || 1) : 1;
  const hasChanges = isDeleteMode && mealData.calories > 0 && (
    Math.round(mealData.grams) !== initialGramsNum || mealData.count !== initialCountNum
  );
  //Router
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const arrowRotation = useSharedValue(0);
  //Hooks
  const [waterMlInput, setWaterMlInput] = useState<string>((mealData.grams * mealData.count).toString());
  const [isWaterInputFocused, setIsWaterInputFocused] = useState<boolean>(false);
  const [isWaterManual, setIsWaterManual] = useState<boolean>(false);
  const waterInputRef = useRef<TextInput>(null);
  const [mealCardHeight, setMealCardHeight] = useState<number>(0);
  const [showAddMoreModal, setShowAddMoreModal] = useState<boolean>(false);
  const [additionalFoods, setAdditionalFoods] = useState<{ food: FoodSearchResult; key: number; mealLogId: string; loggedAt: string }[]>([]);

  const [isQuickAdd] = useState(() => consumeQuickAdd());
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
          We couldn&rsquo;t load the details for this item.
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
      <View style={{ flex: 1 }}>
        <View style={{ marginTop: 56, paddingBottom: 16, zIndex: 50 }}>
          <View className="flex-row w-[362px] self-center justify-between items-center py-4">
            <Icon onPress={() => isDeleteMode ? router.replace("/(tabs)") : source === "addMore" ? router.replace("/(tabs)") : isQuickAdd ? router.replace("/(tabs)/quick-add") : router.back()} className="bg-yellow w-12 h-12">
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
              {logDateLabel && !isDeleteMode && (
                <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, alignSelf: "center", textAlign: "center" }}>({logDateLabel})</Text>
              )}
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
                      className={`py-3 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? 'bg-yellow/30' : ''}`}
                    >
                      <Text className={`font-nunito-700 text-lg ${mealType === type ? 'text-yellow' : 'text-white'}`}>
                        {type}
                      </Text>
                      {logDateLabel && (
                        <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11, color: mealType === type ? "rgba(197,227,132,0.6)" : "rgba(255,255,255,0.35)", marginTop: 1 }}>
                          {logDateLabel}
                        </Text>
                      )}
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
          {(isQuickAdd || isDeleteMode) && (
            <View className="w-[362px] self-center">
              <Button
                className={`rounded-[30px] mx-0 w-full py-4${isDeleteMode ? " bg-pink" : ""}`}
                textClassName={`text-xl${isDeleteMode ? " text-white" : ""}`}
                onPress={() => isDeleteMode ? handleDeleteMeal?.() : handleAddToMeal(isDrink ? parsedWaterMl : undefined)}
                disabled={isLoading}
              >
                {isLoading ? (isDeleteMode ? "Deleting..." : "Recording...") : isDeleteMode ? "Delete" : "Record"}
              </Button>
            </View>
          )}
        </View>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); setIsDropdownOpen(false); }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ alignItems: "center", paddingBottom: 40 }}
          >
            <View style={{ width: 362, height: mealCardHeight > 0 ? mealCardHeight : undefined }}>
              {isLoading && mealCardHeight > 0 ? (
                <View style={{ height: mealCardHeight }}>
                  <ResultMealSkeleton />
                </View>
              ) : (
                <View
                  onLayout={(e) => {
                    const h = e.nativeEvent.layout.height;
                    if (h > 0 && h !== mealCardHeight) setMealCardHeight(h);
                  }}
                >
                  <ResultMeal
                    id={item.id}
                    imgSrc={item.image_url || ""}
                    title={item.name || "Unknown Product"}
                    calories_per_100g={item.calories_per_100g || 0}
                    carbs_per_100g={item.carbs_per_100g || 0}
                    protein_per_100g={item.protein_per_100g || 0}
                    fat_per_100g={item.fat_per_100g || 0}
                    rating={item.health_rating}
                    initialGrams={initialGramsNum}
                    initialCount={initialCountNum}
                    isDrink={isDrink}
                    isFavorite={isFavorite}
                    isFavoriteLoading={isFavoriteLoading}
                    onToggleFavorite={handleToggleFavorite}
                    onDataChange={setMealData}
                  />
                </View>
              )}
            </View>
            <View
              pointerEvents={isLoading ? "none" : "auto"}
              style={{ width: 362, marginTop: 10, opacity: isLoading ? 0.5 : 1 }}
            >
                <TouchableOpacity
                  activeOpacity={0.25}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setIsDrink(!isDrink);
                  }}
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
                    onValueChange={(v) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setIsDrink(v);
                    }}
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
            {additionalFoods.map(({ food, key, mealLogId, loggedAt }) => (
              <View key={key} style={{ width: 362 }}>
                <AdditionalFoodCard
                  food={food}
                  mealType={mealType}
                  isLoading={isLoading}
                  onDone={() => setAdditionalFoods(prev => prev.filter(f => f.key !== key))}
                  onCountChange={async (count) => {
                    if (!userProfile?.id) return;
                    await updateMealLogCount(userProfile.id, mealLogId, count, {
                      name: food.name,
                      food_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(food.id) ? food.id : null,
                      amount_g: 100,
                      calories: Math.round(food.calories_per_100g || 0),
                      carbs: Math.round(food.carbs_per_100g || 0),
                      fat: Math.round(food.fat_per_100g || 0),
                      protein: Math.round(food.protein_per_100g || 0),
                    }, loggedAt);
                    await refreshData();
                  }}
                />
              </View>
            ))}
            {!isQuickAdd && !isDeleteMode && (
              <View style={{ width: 362, marginTop: 24 }}>
                <Button
                  className="rounded-[30px] mx-0 w-full py-5"
                  textClassName="text-xl"
                  onPress={() => handleAddToMeal(isDrink ? parsedWaterMl : undefined)}
                  disabled={isLoading}
                >
                  {isLoading ? "Recording..." : "Record"}
                </Button>
              </View>
            )}
            {isDeleteMode && (
              <View style={{ width: 362, marginTop: 24 }}>
                <Button
                  className="rounded-[30px] mx-0 w-full py-5 bg-yellow"
                  textClassName="text-xl"
                  onPress={() => handleUpdateMeal?.()}
                  disabled={isLoading || !hasChanges}
                >
                  {isLoading ? "Updating..." : "Update"}
                </Button>
              </View>
            )}
            {isQuickAdd && !isDeleteMode && (
              <View style={{ width: 362, marginTop: 24 }}>
                <Button
                  className="rounded-[30px] mx-0 w-full py-5 bg-yellow"
                  textClassName="text-xl"
                  onPress={() => setShowAddMoreModal(true)}
                  icon={<Plus size={24} color="#1D1D1D" weight="bold" />}
                >
                  Add More
                </Button>
              </View>
            )}
          </ScrollView>
        </TouchableWithoutFeedback>
      </View>
      <AddMoreModal
        visible={showAddMoreModal}
        onClose={() => setShowAddMoreModal(false)}
        mealType={mealType}
        logDate={logDate}
        onFoodSelect={(food, mealLogId, loggedAt) => setAdditionalFoods(prev => [...prev, { food, key: Date.now(), mealLogId, loggedAt }])}
      />
    </KeyboardAvoidingView>
  );
};
export default SearchItem;