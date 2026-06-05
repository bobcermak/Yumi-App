import { FilterChip, Icon, MyMeal, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { prepareMealLogData } from "@/lib/helpers/mealHelpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFoodSearch } from "@/lib/hooks/useFoodSearch";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { upsertExternalFood } from "@/lib/services/supabase/queries/foods";
import { logMeal } from "@/lib/services/supabase/queries/mealLogs";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { MagnifyingGlass, X } from "phosphor-react-native";
import { useCallback, useEffect, useMemo, useRef, useState, type FC } from "react";
import { ActivityIndicator, Keyboard, Pressable, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOut } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  onFoodSelect?: (food: FoodSearchResult) => void
};
const AddMoreModal: FC<AddMoreModalProps> = ({ visible, onClose, mealType, logDate, onFoodSelect }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile } = useAuth();
  const { showToast, refreshData } = useIndexContext();
  const { query, setQuery, results, isLoading, isPending, submitSearch, category, setCategory, foodType, setFoodType, source } = useFoodSearch();
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [dropdownTop, setDropdownTop] = useState<number>(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState<boolean>(false);

  const sheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ["82%"], []);

  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;

  useEffect(() => {
    if (visible) sheetRef.current?.present();
  }, [visible]);
  useEffect(() => {
    if (isSearchActive) setShowDropdown(true);
  }, [query, category, foodType]);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () => setIsKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setIsKeyboardVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const resetState = () => {
    setQuery("");
    setCategory("all");
    setFoodType("all");
    setShowDropdown(false);
  };
  const handleDismiss = useCallback(() => {
    resetState();
    onClose();
  }, [onClose]);
  const handleFoodPress = async (food: FoodSearchResult) => {
    if (!userProfile?.id || isAdding) return;
    Keyboard.dismiss();
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
      await logMeal(userProfile.id, mealLog, ingredients);
      await refreshData();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onFoodSelect?.(food);
      sheetRef.current?.dismiss();
    } catch {
      showToast("Failed to add", undefined, "error");
    } finally {
      setIsAdding(false);
    }
  };
  const handleSubmit = () => {
    submitSearch();
    sheetRef.current?.dismiss();
    router.push({
      pathname: "/(tabs)/search",
      params: {
        initialQuery: query,
        mealType,
        ...(logDate ? { logDate } : {}),
        source: "addMore",
      },
    });
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
  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.55} />
    ),
    [],
  );
  return (
    <BottomSheetModal
      ref={sheetRef}
      snapPoints={snapPoints}
      onDismiss={handleDismiss}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: "#121212" }}
      handleIndicatorStyle={{ backgroundColor: "#FFFFFF", width: 40, height: 4, borderRadius: 100, marginTop: 12 }}
      style={{ borderTopLeftRadius: 40, borderTopRightRadius: 40, overflow: "hidden", borderBottomWidth: 0 }}
    >
      <View style={{ flex: 1 }}>
        {isAdding ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <ActivityIndicator size="large" color="#C5E384" />
            <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_600SemiBold", fontSize: 14 }}>
              Adding...
            </Text>
          </View>
        ) : (
          <>
            <BottomSheetScrollView
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
                <View onLayout={(e) => setDropdownTop(e.nativeEvent.layout.height)}>
                  <View className="flex-row w-[362px] self-center items-center justify-between py-3">
                    <View className="w-12" />
                    <Text className="font-nunito-700 text-2xl text-white">Add More</Text>
                    <Icon onPress={() => sheetRef.current?.dismiss()} className="bg-white/10 w-12 h-12">
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
                      isSubmitDisabled={query.trim().length < 2 || isLoading}
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
                    <MyMeal imgUrl={null} name="My Custom Meal" weightGrams={100} calories={200} />
                    <MyMeal imgUrl={null} name="My Custom Meal" weightGrams={100} calories={200} />
                  </View>
                </View>
              </Pressable>
            </BottomSheetScrollView>
            {showDropdown && isSearchActive && (
              <Animated.View
                entering={FadeInDown.duration(250)}
                exiting={FadeOut.duration(250)}
                className="w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute overflow-hidden"
                style={{ top: dropdownTop, zIndex: 50, elevation: 20, shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 10 }}
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
                    results.slice(0, 8).map((food: FoodSearchResult) => (
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
          </>
        )}
      </View>
    </BottomSheetModal>
  );
};
export default AddMoreModal;