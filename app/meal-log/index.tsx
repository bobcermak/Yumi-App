import { AdditionalFoodCard, AddMoreModal, Button, Icon, MealLogIngredientCard, ResultMeal } from "@/components";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import { type ResultMealHandle } from "@/components/meals/ResultMeal";
import { MEAL_TYPES, MEAL_TYPE_MAP, computeHealthRating } from "@/lib/helpers/mealHelpers";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import type { MagicScanResult } from "@/lib/services/food-search/magic-scan";
import { addToFavorites, insertScannedFood, removeFromFavorites } from "@/lib/services/supabase/queries/foods";
import { logMeal, updateMealLogCount } from "@/lib/services/supabase/queries/mealLogs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretDown, CaretLeft, Heart, PencilSimple, Plus, Sparkle } from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOutUp, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MealLog = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast, refreshData, waterMl, handleSetWater } = useIndexContext();
  const { userProfile } = useAuth();
  const resultMealRef = useRef<ResultMealHandle>(null);
  const scrollRef = useRef<ScrollView>(null);
  const { scanResult: scanResultParam, photoUri: photoUriParam, mealType: mealTypeParam, logDate: logDateParam } =
    useLocalSearchParams<{
      scanResult: string;
      photoUri: string;
      mealType?: string;
      logDate?: string;
    }>();
  const result: MagicScanResult | null = scanResultParam
    ? (JSON.parse(scanResultParam) as MagicScanResult)
    : null;
  const logDateLabel = logDateParam ? format(parseISO(logDateParam), 'd MMM') : null;
  const [mealType, setMealType] = useState<string>(mealTypeParam || getMealTypeByTime());
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState<boolean>(false);
  const [insertedFoodId, setInsertedFoodId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [openCountIndex, setOpenCountIndex] = useState<number | null>(null);
  const [showAddMoreModal, setShowAddMoreModal] = useState<boolean>(false);
  const [additionalFoods, setAdditionalFoods] = useState<Array<{ food: FoodSearchResult; key: number; mealLogId: string; loggedAt: string }>>([]);
  const [displayedComponents, setDisplayedComponents] = useState(() =>
    (result?.components ?? []).map((comp, i) => ({
      ...comp,
      originalIndex: i,
      count: 1,
    })),
  );
  const [mealData, setMealData] = useState<{
    grams: number;
    count: number;
    calories: number;
    waterMl: number;
  } | null>(null);
  const [effectiveBaseWeight, setEffectiveBaseWeight] = useState(
    () => (result?.weight_g && result.weight_g > 0 ? result.weight_g : 100),
  );
  const scaledComponents = useMemo(() => {
    if (!displayedComponents.length) return [];
    const currentGrams = mealData?.grams ?? effectiveBaseWeight;
    const ratio = currentGrams / effectiveBaseWeight;
    return displayedComponents.map((comp) => ({
      ...comp,
      weight_g: Math.round(comp.weight_g * ratio * 10) / 10,
      calories: Math.round(comp.calories * ratio),
      carbs_g: Math.round(comp.carbs_g * ratio * 10) / 10,
      fat_g: Math.round(comp.fat_g * ratio * 10) / 10,
      protein_g: Math.round(comp.protein_g * ratio * 10) / 10,
    }));
  }, [displayedComponents, mealData?.grams, effectiveBaseWeight]);
  const arrowRotation = useSharedValue(0);
  const animatedArrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));
  const closeDropdown = () => {
    setIsDropdownOpen(false);
    arrowRotation.value = withTiming(0, { duration: 250 });
  };
  const toggleDropdown = () => {
    const next = !isDropdownOpen;
    setIsDropdownOpen(next);
    arrowRotation.value = withTiming(next ? 180 : 0, { duration: 250 });
  };
  const handleToggleFavorite = async () => {
    if (!userProfile?.id || isFavoriteLoading) return;
    setIsFavoriteLoading(true);
    const next = !isFavorite;
    setIsFavorite(next);
    try {
      if (next) {
        const { id: foodId } = await insertScannedFood(
          userProfile.id,
          {
            name: result?.name || "Unknown Food",
            calories_per_100g: currentNutrition.cal100,
            protein_per_100g: currentNutrition.protein100,
            fat_per_100g: currentNutrition.fat100,
            carbs_per_100g: currentNutrition.carbs100,
            health_rating: healthRating,
            is_drink: isDrink,
          },
          photoUriParam || null,
        );
        setInsertedFoodId(foodId);
        await addToFavorites(userProfile.id, foodId);
        showToast("Added to favorites");
      } else {
        const idToRemove = insertedFoodId ?? (await insertScannedFood(
          userProfile.id,
          {
            name: result?.name || "Unknown Food",
            calories_per_100g: currentNutrition.cal100,
            protein_per_100g: currentNutrition.protein100,
            fat_per_100g: currentNutrition.fat100,
            carbs_per_100g: currentNutrition.carbs100,
            health_rating: healthRating,
            is_drink: isDrink,
          },
          null,
        )).id;
        await removeFromFavorites(userProfile.id, idToRemove);
        showToast("Removed from favorites");
      }
    } catch (e) {
      console.error(e);
      setIsFavorite(!next);
      showToast("Failed to save favorite", undefined, "error");
    } finally {
      setIsFavoriteLoading(false);
    }
  };
  if (!result) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white font-nunito-700 text-xl">
          No scan result
        </Text>
      </View>
    );
  }
  const isDrink = result.is_drink ?? false;
  const safeWeight = result.weight_g > 0 ? result.weight_g : 100;
  const cal100 = (result.calories / safeWeight) * 100;
  const carbs100 = (result.carbs_g / safeWeight) * 100;
  const protein100 = (result.protein_g / safeWeight) * 100;
  const fat100 = (result.fat_g / safeWeight) * 100;
  const currentNutrition = (() => {
    if (!displayedComponents.length) {
      return { cal100, carbs100, protein100, fat100, weight: safeWeight };
    }
    const totalWeight = displayedComponents.reduce(
      (sum, c) => sum + c.weight_g * (c.count || 1),
      0,
    );
    if (totalWeight === 0)
      return { cal100, carbs100, protein100, fat100, weight: safeWeight };
    return {
      cal100:
        (displayedComponents.reduce(
          (s, c) => s + c.calories * (c.count || 1),
          0,
        ) /
          totalWeight) *
        100,
      carbs100:
        (displayedComponents.reduce(
          (s, c) => s + c.carbs_g * (c.count || 1),
          0,
        ) /
          totalWeight) *
        100,
      protein100:
        (displayedComponents.reduce(
          (s, c) => s + c.protein_g * (c.count || 1),
          0,
        ) /
          totalWeight) *
        100,
      fat100:
        (displayedComponents.reduce((s, c) => s + c.fat_g * (c.count || 1), 0) /
          totalWeight) *
        100,
      weight: totalWeight,
    };
  })();
  const healthRating = computeHealthRating({
    calories_per_100g: currentNutrition.cal100,
    protein_per_100g: currentNutrition.protein100,
    fat_per_100g: currentNutrition.fat100,
    carbs_per_100g: currentNutrition.carbs100,
  });
  const handleRecord = async () => {
    if (!userProfile?.id || !mealData) return;
    setIsRecording(true);
    try {
      const type = MEAL_TYPE_MAP[mealType] || "lunch";
      const factor = mealData.grams / 100;
      const count = mealData.count;
      const { id: foodId, imageUrl: mealImageUrl } = await insertScannedFood(
        userProfile.id,
        {
          name: result.name,
          calories_per_100g: currentNutrition.cal100,
          protein_per_100g: currentNutrition.protein100,
          fat_per_100g: currentNutrition.fat100,
          carbs_per_100g: currentNutrition.carbs100,
          health_rating: healthRating,
          is_drink: isDrink,
        },
        photoUriParam || null,
      );
      const mealLogData = {
        name: result.name,
        type,
        logged_at: logDateParam ? new Date(`${logDateParam}T12:00:00`).toISOString() : new Date().toISOString(),
        total_calories: mealData.calories,
        total_carbs: Math.round(currentNutrition.carbs100 * factor * count),
        total_fat: Math.round(currentNutrition.fat100 * factor * count),
        total_protein: Math.round(currentNutrition.protein100 * factor * count),
        image_url: mealImageUrl,
        rating: healthRating,
      };
      let ingredients;
      if (scaledComponents.length > 0) {
        let remainingCalories = mealLogData.total_calories;
        ingredients = scaledComponents.map((comp, index) => {
          const isLast = index === scaledComponents.length - 1;
          let cal = Math.round(comp.calories * count);
          if (isLast) {
            cal = remainingCalories;
          } else {
            remainingCalories -= cal;
          }
          return {
            name: comp.name,
            amount_g: Math.round(comp.weight_g * count),
            calories: cal,
            carbs: Math.round(comp.carbs_g * count),
            fat: Math.round(comp.fat_g * count),
            protein: Math.round(comp.protein_g * count),
            food_id: null as string | null,
          };
        });
      } else {
        ingredients = [
          {
            name: result.name,
            amount_g: Math.round(mealData.grams * count),
            calories: mealData.calories,
            carbs: mealLogData.total_carbs,
            fat: mealLogData.total_fat,
            protein: mealLogData.total_protein,
            food_id: foodId as string,
          },
        ];
      }
      await logMeal(userProfile.id, mealLogData, ingredients);
      if (isDrink && mealData.waterMl) {
        await handleSetWater(waterMl + mealData.waterMl);
      }
      if (isFavorite) {
        await addToFavorites(userProfile.id, foodId as string);
      }
      await refreshData();
      showToast("Meal recorded!");
      router.replace("/(tabs)/quick-add");
    } catch (error) {
      console.error("[MealLog] Error recording:", error);
      showToast("Failed to record meal", undefined, "error");
    } finally {
      setIsRecording(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {isDropdownOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={closeDropdown}
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, zIndex: 45 }}
        />
      )}
      <View
        style={{
          zIndex: 50,
          paddingTop: insets.top + 16,
          paddingBottom: 16,
        }}
      >
        <View className="flex-row w-[362px] self-center justify-between items-center">
          <Icon onPress={() => router.replace("/(tabs)/quick-add")} className="bg-yellow w-12 h-12">
            <CaretLeft size={24} color="#1D1D1D" weight="regular" />
          </Icon>
          <View className="relative items-center w-[160px]">
            <TouchableOpacity
              onPress={toggleDropdown}
              activeOpacity={0.25}
              className="flex-row items-center justify-center gap-2 w-full"
            >
              <Text
                className="font-nunito-700 text-xl text-white"
                numberOfLines={1}
              >
                {mealType}
              </Text>
              <Animated.View style={animatedArrowStyle}>
                <CaretDown size={20} color="white" weight="bold" />
              </Animated.View>
            </TouchableOpacity>
            {logDateLabel && (
              <Text style={{ fontFamily: "Nunito_600SemiBold", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2, alignSelf: "center", textAlign: "center" }}>({logDateLabel})</Text>
            )}
            {isDropdownOpen && (
              <Animated.View
                entering={FadeInUp.duration(250)}
                exiting={FadeOutUp.duration(250)}
                style={{
                  zIndex: 100,
                  position: "absolute",
                  top: 44,
                  left: -20,
                }}
                className="bg-dark rounded-[15px] w-[200px] border border-white/10 overflow-hidden"
              >
                {MEAL_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.25}
                    onPress={() => {
                      setMealType(type);
                      closeDropdown();
                    }}
                    className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? "bg-yellow/30" : ""}`}
                  >
                    <Text
                      className={`font-nunito-700 text-lg ${mealType === type ? "text-yellow" : "text-white"}`}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
          </View>
          <Icon
            onPress={handleToggleFavorite}
            className="bg-dark w-12 h-12"
            shadowColor="#000000"
            disabled={isFavoriteLoading}
          >
            {isFavoriteLoading ? (
              <ActivityIndicator size="small" color="#C5E384" />
            ) : (
              <Heart
                size={24}
                color={isFavorite ? "#C5E384" : "white"}
                weight={isFavorite ? "fill" : "regular"}
              />
            )}
          </Icon>
        </View>
        <View className="w-[362px] self-center mt-3">
          <Button
            className="rounded-[30px] mx-0 w-full py-5 bg-yellow"
            textClassName="text-xl"
            onPress={handleRecord}
            disabled={isRecording || !mealData}
          >
            {isRecording ? "Recording..." : "Record"}
          </Button>
        </View>
      </View>
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={() => { if (openCountIndex !== null) setOpenCountIndex(null); }}
      >
        <Animated.View
          entering={FadeInDown.delay(60).duration(250)}
          className="w-[362px] self-center mb-8"
        >
          <Text className="title mb-4">My Meal</Text>
          <TouchableOpacity
            activeOpacity={0.25}
            className="flex-row items-center justify-between bg-dark rounded-[14px] px-4 py-3 border border-white/10 mb-3"
            onPress={() => router.replace("/magic-scan")}
          >
            <Text className="text-white/60 font-nunito-600 text-base">
              Not Right?
            </Text>
            <View className="flex-row items-center gap-2 bg-yellow rounded-[10px] px-4 py-3">
              <Sparkle size={16} color="#1D1D1D" weight="regular" />
              <Text className="text-dark font-nunito-700 text-base">
                Replace
              </Text>
            </View>
          </TouchableOpacity>
          <ResultMeal
            ref={resultMealRef}
            key={displayedComponents.length}
            imgSrc={photoUriParam || ""}
            title={result.name}
            calories_per_100g={currentNutrition.cal100}
            carbs_per_100g={currentNutrition.carbs100}
            protein_per_100g={currentNutrition.protein100}
            fat_per_100g={currentNutrition.fat100}
            initialGrams={currentNutrition.weight}
            initialCount={1}
            isDrink={isDrink}
            rating={healthRating}
            isFavorite={isFavorite}
            isFavoriteLoading={isFavoriteLoading}
            onToggleFavorite={handleToggleFavorite}
            onDataChange={setMealData}
          />
        </Animated.View>
        {additionalFoods.map(({ food, key, mealLogId, loggedAt }) => (
          <Animated.View key={key} entering={FadeInDown.duration(300).springify()} className="w-[362px] self-center">
            <AdditionalFoodCard
              food={food}
              mealType={mealType}
              isLoading={isRecording}
              onDone={() => setAdditionalFoods(prev => prev.filter(f => f.key !== key))}
              onCountChange={async (count) => {
                if (!userProfile?.id) return;
                await updateMealLogCount(userProfile.id, mealLogId, count, {
                  name: food.name || "Unknown Food",
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
          </Animated.View>
        ))}
        {scaledComponents.length > 0 && (
          <Animated.View
            entering={FadeInDown.delay(120).duration(250)}
            className="w-[362px] self-center"
          >
            <Text className="title mb-4">What&rsquo;s inside?</Text>
            <Animated.View
              className="gap-3"
              layout={LinearTransition.springify().damping(200)}
            >
              {scaledComponents.map((comp, i) => (
                <Animated.View
                  key={comp.originalIndex}
                  exiting={FadeOutUp}
                >
                  <MealLogIngredientCard
                    index={i}
                    emoji={comp.emoji}
                    name={comp.name}
                    weight_g={comp.weight_g}
                    calories={comp.calories}
                    carbs_g={comp.carbs_g}
                    fat_g={comp.fat_g}
                    protein_g={comp.protein_g}
                    count={comp.count || 1}
                    isLast={scaledComponents.length <= 1}
                    isDrink={isDrink}
                    isCountOpen={openCountIndex === comp.originalIndex}
                    onCountOpenChange={(open) => setOpenCountIndex(open ? comp.originalIndex : null)}
                    onCountChange={(newCount) => {
                      const idx = comp.originalIndex;
                      setDisplayedComponents(prev => {
                        const updated = prev.map(c =>
                          c.originalIndex === idx ? { ...c, count: newCount } : c
                        );
                        const newBase = Math.round(updated.reduce((s, c) => s + c.weight_g * (c.count || 1), 0)) || 100;
                        setEffectiveBaseWeight(newBase);
                        setMealData(m => m ? { ...m, grams: newBase } : m);
                        return updated;
                      });
                    }}
                    onDelete={() => {
                      const idx = comp.originalIndex;
                      setDisplayedComponents(prev => {
                        const remaining = prev.filter(c => c.originalIndex !== idx);
                        const newBase = Math.round(remaining.reduce((s, c) => s + c.weight_g * (c.count || 1), 0)) || 100;
                        setEffectiveBaseWeight(newBase);
                        setMealData(m => m ? { ...m, grams: newBase } : m);
                        return remaining;
                      });
                    }}
                  />
                </Animated.View>
              ))}
            </Animated.View>
          </Animated.View>
        )}
        <Animated.View entering={FadeInDown.delay(200).duration(250)} className="w-[362px] self-center mt-6 mb-2">
          <Button
            className="rounded-[30px] mx-0 w-full py-5 bg-yellow"
            textClassName="text-xl"
            onPress={() => setShowAddMoreModal(true)}
            icon={<Plus size={24} color="#1D1D1D" weight="bold"/>}
          >
            Add More
          </Button>
        </Animated.View>
      </ScrollView>
      <Animated.View
        entering={FadeInDown.delay(300).duration(250)}
        className="absolute right-5"
        style={{ bottom: insets.bottom + 20 }}
      >
        <Icon
          onPress={() => {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            resultMealRef.current?.focusCalories();
          }}
          className="bg-yellow w-14 h-14"
        >
          <PencilSimple size={24} color="#1D1D1D" weight="regular" />
        </Icon>
      </Animated.View>
      <AddMoreModal
        visible={showAddMoreModal}
        onClose={() => setShowAddMoreModal(false)}
        mealType={mealType}
        logDate={logDateParam}
        onFoodSelect={(food, mealLogId, loggedAt) => setAdditionalFoods(prev => [...prev, { food, key: Date.now(), mealLogId, loggedAt }])}
      />
    </KeyboardAvoidingView>
  );
};
export default MealLog;