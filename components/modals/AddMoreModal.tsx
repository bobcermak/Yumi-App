import { FilterChip, Icon, MyMeal, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { prepareMealLogData } from "@/lib/helpers/mealHelpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFoodSearch } from "@/lib/hooks/useFoodSearch";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { useMyMeals } from "@/lib/hooks/useMyMeals";
import { upsertExternalFood } from "@/lib/services/supabase/queries/foods";
import { logMeal } from "@/lib/services/supabase/queries/mealLogs";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { CaretLeft, MagnifyingGlass, X } from "phosphor-react-native";
import { useCallback, useEffect, useState, type FC } from "react";
import { ActivityIndicator, Dimensions, Keyboard, Modal, Pressable, ScrollView, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, FadeInDown, FadeOut, runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const CATEGORY_OPTIONS: { label: string; value: FoodCategory }[] = [
  { label: "All", value: "all" },
  { label: "Fruits", value: "fruits" },
  { label: "Vegetables", value: "vegetables" },
];
const FOOD_TYPE_OPTIONS: { label: string; value: FoodType }[] = [
  { label: "All", value: "all" },
  { label: "Homemade", value: "raw" },
  { label: "Packaged", value: "branded" },
];
type AddMoreModalProps = {
  visible: boolean,
  onClose: () => void,
  mealType: string,
  logDate?: string,
  onFoodSelect?: (food: FoodSearchResult, mealLogId: string, loggedAt: string) => void,
  onIngredientSelect?: (food: FoodSearchResult) => void,
};
const AddMoreModal: FC<AddMoreModalProps> = ({ visible, onClose, mealType, logDate, onFoodSelect, onIngredientSelect }) => {
  const isIngredientMode = !!onIngredientSelect;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { showToast, refreshData } = useIndexContext();
  const { query, setQuery, results, isLoading, isPending, submitSearch, category, setCategory, foodType, setFoodType, source } = useFoodSearch();
  const { items: myMeals, isLoading: myMealsLoading } = useMyMeals();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);
  const [showResults, setShowResults] = useState<boolean>(false);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacity = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
  const backdropStyle = useAnimatedStyle(() => ({ opacity: backdropOpacity.value }));

  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;

  const resetState = () => {
    setQuery("");
    setCategory("all");
    setFoodType("all");
    setShowDropdown(false);
    setShowResults(false);
  };
  const performClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose]);
  const animateClose = useCallback(() => {
    backdropOpacity.value = withTiming(0, { duration: 250 });
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
      if (finished) runOnJS(performClose)();
    });
  }, [performClose]);
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 800) {
        backdropOpacity.value = withTiming(0, { duration: 250 });
        translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, (finished) => {
          if (finished) runOnJS(performClose)();
        });
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });
  useEffect(() => {
    if (visible) {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacity.value = 0;
      translateY.value = withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) });
      backdropOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [visible]);
  useEffect(() => {
    if (isSearchActive) setShowDropdown(true);
  }, [query, category, foodType]);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const handleFoodPress = async (food: FoodSearchResult) => {
    if (isAdding) return;
    Keyboard.dismiss();

    if (isIngredientMode) {
      onIngredientSelect!(food);
      animateClose();
      return;
    }

    if (!userProfile?.id) return;
    setIsAdding(true);
    try {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      let effectiveFood = food;
      if (!uuidRegex.test(food.id)) {
        const foodId = await upsertExternalFood(food, !!(food.is_drink));
        effectiveFood = { ...food, id: foodId };
      }
      const grams = 100;
      const calories = Math.round(((food.calories_per_100g || 0) * grams) / 100);
      const { mealLog, ingredients } = prepareMealLogData(
        effectiveFood,
        { grams, count: 1, calories },
        mealType || getMealTypeByTime(),
        logDate,
      );
      const loggedMeal = await logMeal(userProfile.id, mealLog, ingredients);
      await refreshData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFoodSelect?.(food, loggedMeal.id, loggedMeal.logged_at!);
      animateClose();
    } catch {
      showToast("Failed to add", undefined, "error");
    } finally {
      setIsAdding(false);
    }
  };
  const handleSubmit = () => {
    setShowDropdown(false);
    submitSearch();
    setShowResults(true);
  };
  const handleContentPress = () => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      return;
    }
    if (query.trim().length === 0) {
      setShowDropdown(false);
      setCategory("all");
      setFoodType("all");
    } else if (showDropdown) {
      setShowDropdown(false);
    } else if (hasFiltersActive) {
      setCategory("all");
      setFoodType("all");
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={animateClose}
      statusBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Animated.View
          style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)" }, backdropStyle]}
        >
          <Pressable style={{ flex: 1 }} onPress={animateClose} />
        </Animated.View>
        <Animated.View
          style={[{
            backgroundColor: "#121212",
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            height: SCREEN_HEIGHT * 0.82,
          }, animatedStyle]}
        >
          <GestureDetector gesture={panGesture}>
            <View style={{ alignItems: "center", paddingTop: 16, paddingBottom: 32 }}>
              <View style={{ width: 40, height: 4, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.8)" }} />
            </View>
          </GestureDetector>
          {isAdding ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
              <ActivityIndicator size="large" color="#C5E384" />
              <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_600SemiBold", fontSize: 14 }}>
                Adding...
              </Text>
            </View>
          ) : showResults ? (
            <Animated.View entering={FadeInDown.duration(200)} style={{ flex: 1 }}>
              <View className="flex-row w-[380px] self-center justify-center items-center py-4">
                <Icon onPress={() => setShowResults(false)} className="absolute left-[4px] bg-yellow w-12 h-12">
                  <CaretLeft size={24} color="#1D1D1D" weight="regular" />
                </Icon>
                <Text className="font-nunito-700 text-[28px] text-white">Results</Text>
                <Icon onPress={animateClose} className="absolute right-[4px] bg-white/10 w-12 h-12">
                  <X size={20} color="rgba(255,255,255,0.75)" weight="regular" />
                </Icon>
              </View>
              <View className="flex-row items-center justify-between px-8 mb-4 mt-8">
                <Text className="text-white/50 font-nunito-700 text-lg flex-1 mr-3" numberOfLines={1} ellipsizeMode="tail">
                  {query ? `Results for "${query}"` : "Search Results"}
                </Text>
                {!isLoading && !isPending && results.length > 0 && source && (
                  <Text className="text-white/30 font-nunito-600 text-sm flex-shrink-0">
                    via {source === "usda" ? "Homemade" : "Packaged"}
                  </Text>
                )}
              </View>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24, flexGrow: 1 }}
                keyboardShouldPersistTaps="always"
              >
                {isLoading || isPending ? (
                  Array.from({ length: 8 }).map((_, i) => <SearchResultSkeleton key={i} />)
                ) : results.length > 0 ? (
                  results.map((food: FoodSearchResult) => (
                    <SearchResultItem
                      key={food.id}
                      item={food}
                      showArrow
                      onPress={() => {
                        if (isIngredientMode) {
                          handleFoodPress(food);
                          return;
                        }
                        performClose();
                        router.push({
                          pathname: "/search-item/[id]",
                          params: {
                            id: food.id,
                            item: JSON.stringify(food),
                            mealType,
                            ...(logDate ? { logDate } : {}),
                            source: "addMore",
                          },
                        });
                      }}
                    />
                  ))
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 16, paddingVertical: 64 }}>
                    <View className="w-20 h-20 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
                      <MagnifyingGlass size={40} color="#C5E384" weight="duotone" />
                    </View>
                    <Text className="text-white/40 font-nunito-600 text-base text-center px-8">
                      No food found... 🥑 Try a different search!
                    </Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          ) : (
            <View style={{ flex: 1, position: "relative" }}>
              <ScrollView
                keyboardShouldPersistTaps="always"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
                onScrollBeginDrag={() => {
                  setShowDropdown(false);
                  Keyboard.dismiss();
                }}
              >
                <Pressable onPress={handleContentPress}>
                  <View>
                    <View className="flex-row w-[362px] self-center items-center justify-between py-3">
                      <View className="w-12" />
                      <Text className="font-nunito-700 text-2xl text-white">{isIngredientMode ? "Add Ingredient" : "Add More"}</Text>
                      <Icon onPress={animateClose} className="bg-white/10 w-12 h-12">
                        <X size={20} color="rgba(255,255,255,0.75)" weight="regular" />
                      </Icon>
                    </View>
                    <View className="w-[362px] self-center mb-3">
                      <SearchInput
                        isInput
                        placeholder="Maybe pizza?..."
                        showCamera={false}
                        value={query}
                        onChangeText={setQuery}
                        isSubmitDisabled={query.trim().length < 2}
                        onSubmit={handleSubmit}
                        onClear={() => {}}
                        onFocus={() => { if (isSearchActive) setShowDropdown(true); }}
                        onBarcodeFound={handleFoodPress}
                      />
                    </View>
                    <View className="w-[362px] self-center mb-3">
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {CATEGORY_OPTIONS.map((opt) => (
                          <FilterChip key={opt.value} label={opt.label} isActive={category === opt.value} onPress={() => setCategory(opt.value)} />
                        ))}
                      </View>
                    </View>
                    {category === "all" && (
                      <View className="w-[362px] self-center mb-2">
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          {FOOD_TYPE_OPTIONS.map((opt) => (
                            <FilterChip key={opt.value} label={opt.label} isActive={foodType === opt.value} onPress={() => setFoodType(opt.value)} />
                          ))}
                        </View>
                      </View>
                    )}
                  </View>
                  <PopularMealsSection onBeforeNavigate={() => {}} logDate={logDate} onMealPress={handleFoodPress} />
                  <View className="w-[362px] self-center mt-8 mb-4">
                    <Text className="title">My Meals</Text>
                    <View className="gap-3 mt-4">
                      {myMealsLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <View key={i} className="bg-dark rounded-[15px] p-3 flex-row items-center border border-white/10" style={{ opacity: 0.5 }}>
                            <View className="w-[60px] h-[60px] rounded-[10px] bg-white/10" />
                            <View className="flex-1 ml-4 gap-2">
                              <View className="h-4 bg-white/10 rounded-md w-3/4" />
                              <View className="h-3 bg-white/10 rounded-md w-1/2" />
                            </View>
                          </View>
                        ))
                      ) : myMeals.length === 0 ? (
                        <View className="items-center py-6">
                          <Text className="text-white/30 font-nunito-600 text-sm text-center">
                            No meals yet. Create one in Search!
                          </Text>
                        </View>
                      ) : (
                        myMeals.map(meal => {
                          const mealFood: FoodSearchResult = {
                            id: meal.id,
                            name: meal.name,
                            image_url: meal.image_url ?? undefined,
                            calories_per_100g: meal.calories_per_100g,
                            carbs_per_100g: meal.carbs_per_100g ?? 0,
                            fat_per_100g: meal.fat_per_100g ?? 0,
                            protein_per_100g: meal.protein_per_100g ?? 0,
                            health_rating: meal.health_rating ?? undefined,
                            source: "usda",
                          };
                          return (
                            <MyMeal
                              key={meal.id}
                              imgUrl={meal.image_url}
                              name={meal.name}
                              calories={Math.round(meal.calories_per_100g)}
                              onPress={() => {
                                if (isIngredientMode) {
                                  handleFoodPress(mealFood);
                                } else {
                                  performClose();
                                  router.push({
                                    pathname: "/search-item/[id]",
                                    params: {
                                      id: meal.id,
                                      item: JSON.stringify(mealFood),
                                      mealType,
                                      ...(logDate ? { logDate } : {}),
                                      source: "addMore",
                                    },
                                  });
                                }
                              }}
                              onAddPress={() => handleFoodPress(mealFood)}
                            />
                          );
                        })
                      )}
                    </View>
                  </View>
                </Pressable>
              </ScrollView>
              {showDropdown && isSearchActive && (
                <Animated.View
                  entering={FadeInDown.duration(250)}
                  exiting={FadeOut.duration(250)}
                  className={`w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute top-[] overflow-hidden ${category === "all" ? "top-[226px]" : "top-[178px]"}`}
                  style={{ zIndex: 50, elevation: 20, shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 10 }}
                  onStartShouldSetResponder={() => { Keyboard.dismiss(); return false; }}
                >
                  <View className="flex-row items-center justify-between mb-1 px-4">
                    <Text className="text-white/60 font-nunito-700 text-lg flex-1 mr-2" numberOfLines={1}>
                      {isLoading || isPending || results.length > 0
                        ? query.trim().length === 0 && category !== "all"
                          ? category === "fruits" ? "Fruits" : "Vegetables"
                          : "Related Searches"
                        : "Not Found"}
                    </Text>
                    {!isLoading && !isPending && results.length > 0 && source && (
                      <Text className="text-white/30 font-nunito-600 text-sm flex-shrink-0">
                        via {source === "usda" ? "Homemade" : "Packaged"}
                      </Text>
                    )}
                  </View>
                  <View>
                    {isLoading || isPending ? (
                      Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={i} />)
                    ) : results.length > 0 ? (
                      results.slice(0, 4).map((food: FoodSearchResult) => (
                        <SearchResultItem key={food.id} item={food} onPress={() => handleFoodPress(food)} />
                      ))
                    ) : (
                      <View className="py-8 items-center justify-center gap-4">
                        <View className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
                          <MagnifyingGlass size={32} color="#C5E384" weight="duotone" />
                        </View>
                        <Text className="text-white/40 font-nunito-600 text-base text-center px-8">
                          No food found... 🥑 Try adjusting your search or filters!
                        </Text>
                      </View>
                    )}
                  </View>
                </Animated.View>
              )}
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
};
export default AddMoreModal;