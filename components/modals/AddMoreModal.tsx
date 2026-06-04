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
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { Barcode, Camera, DotsThree, MagnifyingGlass, X } from "phosphor-react-native";
import { useState, useRef, type FC } from "react";
import { ActivityIndicator, Keyboard, Modal, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming, runOnJS } from "react-native-reanimated";
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
  const { height: screenHeight } = useWindowDimensions();
  const { userProfile } = useAuth();
  const { showToast, refreshData } = useIndexContext();
  const { query, setQuery, results, isLoading, isPending, submitSearch, category, setCategory, foodType, setFoodType } = useFoodSearch();
  const [showDotsMenu, setShowDotsMenu] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isSearchActive = query.trim().length > 0 || category !== "all" || foodType !== "all";
  const sheetHeight = screenHeight * 0.82;

  const translateY = useSharedValue(0);
  const backdropOpacity = useSharedValue(1);

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));
  //Functions
  const handleClose = () => {
    setQuery("");
    setCategory("all");
    setFoodType("all");
    setShowDotsMenu(false);
    onClose();
  };
  const closeRef = useRef(handleClose);
  closeRef.current = handleClose;
  const resetRef = useRef(() => {
    translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
    backdropOpacity.value = withSpring(1);
  });
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      if (e.translationY >= 0) {
        translateY.value = e.translationY;
        backdropOpacity.value = interpolate(e.translationY, [0, sheetHeight * 0.55], [1, 0]);
      } else {
        translateY.value = e.translationY * 0.3;
      }
    })
    .onEnd((e) => {
      'worklet';
      if (e.translationY > 120 || e.velocityY > 800) {
        translateY.value = withSpring(sheetHeight, { damping: 20 }, () => {
          runOnJS(closeRef.current)();
        });
        backdropOpacity.value = withTiming(0, { duration: 280 });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 280 });
        backdropOpacity.value = withSpring(1);
      }
    });
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
      const calories = Math.round((food.calories_per_100g || 0) * grams / 100);
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
      handleClose();
    } catch {
      showToast("Failed to add", undefined, "error");
    } finally {
      setIsAdding(false);
    }
  };
  const handleScanPress = () => {
    setShowDotsMenu(false);
    handleClose();
    router.push({
      pathname: "/(tabs)/quick-add",
      params: { startTab: "magicScan", mealType, _t: String(Date.now()), ...(logDate ? { logDate } : {}) },
    });
  };
  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent onRequestClose={handleClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: "flex-end" }}>
          <Animated.View
            style={[{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.55)" }, animatedBackdropStyle]}
            pointerEvents="none"
          />
          <TouchableOpacity
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: sheetHeight }}
            onPress={handleClose}
            activeOpacity={1}
          />
          <Animated.View style={[{ height: sheetHeight, backgroundColor: "#000000", borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingBottom: insets.bottom + 8 }, animatedSheetStyle]}>
            <GestureDetector gesture={panGesture}>
              <View style={{ width: "100%", paddingTop: 12, paddingBottom: 8, alignItems: "center" }}>
                <View style={{ width: 40, height: 4, backgroundColor: "rgba(255,255,255,0.3)", borderRadius: 2 }} />
              </View>
            </GestureDetector>
            {isAdding ? (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
                <ActivityIndicator size="large" color="#C5E384" />
                <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_600SemiBold", fontSize: 14 }}>Adding...</Text>
              </View>
            ) : (
              <>
                <View className="flex-row w-[362px] self-center items-center justify-between py-3">
                  <View className="w-12" />
                  <Text className="font-nunito-700 text-2xl text-white">Add More</Text>
                  <Icon onPress={handleClose} className="bg-white/10 w-12 h-12">
                    <X size={20} color="rgba(255,255,255,0.75)" weight="bold" />
                  </Icon>
                </View>
                <View className="w-[362px] self-center flex-row items-center gap-1 justify-between mb-3" style={{ zIndex: 150 }}>
                  <SearchInput
                    isInput placeholder="Maybe pizza?..." showCamera={false}
                    className="w-[310px]"
                    value={query} onChangeText={setQuery}
                    isSubmitDisabled={query.trim().length < 2 || isLoading}
                    onSubmit={submitSearch} onClear={() => {}} onFocus={() => {}}
                  />
                  <View style={{ position: "relative", zIndex: 100 }}>
                    <Icon onPress={() => setShowDotsMenu(p => !p)} className={`w-12 h-12 ${showDotsMenu ? "bg-white/20" : "bg-yellow"}`}>
                      <DotsThree size={24} color={showDotsMenu ? "#FFFFFF" : "#1D1D1D"} weight="bold" />
                    </Icon>
                    {showDotsMenu && (
                      <Animated.View
                        entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}
                        className="absolute top-[54px] right-0 w-[200px] bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden"
                        style={{ zIndex: 200, shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 24 }}
                      >
                        {([
                          { label: "Barcode", icon: <Barcode size={18} color="#C5E384" weight="regular" /> },
                          { label: "Magic Scan", icon: <Camera size={18} color="#C5E384" weight="regular" /> },
                        ] as const).map((opt, i) => (
                          <Animated.View key={opt.label} entering={FadeInDown.delay(i * 45).duration(250).springify()}>
                            <TouchableOpacity onPress={handleScanPress} activeOpacity={0.25} className="flex-row items-center gap-3 px-4 py-3 bg-dark" style={{ borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: "rgba(255,255,255,0.1)" }}>
                              <View className="w-8 h-8 rounded-[15px] items-center justify-center bg-yellow/10">{opt.icon}</View>
                              <Text className="text-base text-white font-nunito-700">{opt.label}</Text>
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </Animated.View>
                    )}
                  </View>
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
                <View style={{ flex: 1 }}>
                  <ScrollView
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    onScrollBeginDrag={() => { setShowDotsMenu(false); Keyboard.dismiss(); }}
                  >
                    <PopularMealsSection onBeforeNavigate={() => {}} logDate={logDate} onMealPress={handleFoodPress} />
                    <View className="w-[362px] self-center mt-8 mb-4">
                      <Text className="title">My Meals</Text>
                      <View className="gap-3 mt-4">
                        <MyMeal imgUrl={null} name="My Custom Meal" weightGrams={100} calories={200} />
                        <MyMeal imgUrl={null} name="My Custom Meal" weightGrams={100} calories={200} />
                      </View>
                    </View>
                  </ScrollView>
                  {isSearchActive && (
                    <Animated.View
                      entering={FadeIn.duration(180)}
                      exiting={FadeOut.duration(150)}
                      style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 50 }}
                    >
                      <View className="w-[362px] self-center">
                        <View
                          className="bg-dark rounded-[20px] border border-white/10 py-4"
                          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 20 }}
                        >
                          <View className="flex-row items-center justify-between mb-1 px-4">
                            <Text className="text-white/60 font-nunito-700 text-lg flex-1 mr-2" numberOfLines={1}>
                              {isLoading || isPending || results.length > 0 ? "Related Searches" : "Not Found"}
                            </Text>
                          </View>
                          <View>
                            {isLoading || isPending
                              ? Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={i} />)
                              : results.length > 0
                                ? results.slice(0, 8).map((food: FoodSearchResult) => (
                                    <SearchResultItem key={food.id} item={food} onPress={() => handleFoodPress(food)} />
                                  ))
                                : (
                                  <View className="py-8 items-center justify-center gap-4">
                                    <View className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
                                      <MagnifyingGlass size={32} color="#C5E384" weight="duotone" />
                                    </View>
                                    <Text className="text-white/40 font-nunito-600 text-base text-center px-8">
                                      No food found... Try adjusting your search!
                                    </Text>
                                  </View>
                                )
                            }
                          </View>
                        </View>
                      </View>
                    </Animated.View>
                  )}
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
};
export default AddMoreModal;