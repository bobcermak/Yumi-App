import { Button, CameraModal, FilterChip, Icon, MyMeal, MyMealSkeleton, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useMyMeals } from "@/lib/hooks/useMyMeals";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { format, parseISO, isToday } from "date-fns";
import { markQuickAdd } from "@/lib/helpers/quickAddSource";
import { MEAL_TYPES } from "@/lib/helpers/mealHelpers";
import { useMagicScan } from "@/lib/hooks/useMagicScan";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { CaretDown, CaretLeft, MagnifyingGlass, Plus } from "phosphor-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Keyboard, Modal, RefreshControl, Text, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View } from "react-native";
import Animated, { FadeInDown, FadeInUp, FadeOut, FadeOutUp, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
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
type ActiveTab = "quickAdd" | "magicScan";
const QuickAdd = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const { mealType: mealTypeParam, startTab, _t, logDate: logDateParam, cameraMode } = useLocalSearchParams<{ mealType: string; startTab: string; _t?: string; logDate?: string; cameraMode?: string }>();
  const logDate = logDateParam && !isToday(parseISO(logDateParam)) ? logDateParam : undefined;
  const logDateLabel = logDate ? format(parseISO(logDate), 'd MMM') : null;
  //Contexts
  const { query, setQuery, searchResults, isSearching, isSearchPending, searchSource, submitSearch, category, setCategory, foodType, setFoodType, popularMeals, refreshPopularMeals, setFilter } = useSearchContext();
  const { items: myMeals, isLoading: myMealsLoading, refresh: refreshMyMeals } = useMyMeals();
  //Hooks
  const [activeTab, setActiveTab] = useState<ActiveTab>(startTab === "magicScan" ? "magicScan" : "quickAdd");
  const [mealType, setMealType] = useState(mealTypeParam || getMealTypeByTime());
  const { isProcessing, capturedUri, pendingPhoto, handleBarcodeScanned, handleCapture, handleConfirm, handleRetake } = useMagicScan(mealType, true, undefined, logDate);
  const [isMealDropdownOpen, setIsMealDropdownOpen] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const catListRef = useRef<FlatList>(null);
  const foodTypeListRef = useRef<FlatList>(null);
  const tabPosition = useSharedValue(startTab === "magicScan" ? 1 : 0);
  const arrowRotation = useSharedValue(0);

  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;
  const isConfirming = !!pendingPhoto && !isProcessing;
  const isScanning = isProcessing && !!capturedUri;

  useEffect(() => {
    if (mealTypeParam) setMealType(mealTypeParam);
  }, [mealTypeParam]);
  useEffect(() => {
    const tab: ActiveTab = startTab === "magicScan" ? "magicScan" : "quickAdd";
    setActiveTab(tab);
    tabPosition.value = tab === "magicScan" ? 1 : 0;
  }, [startTab, _t]);
  useFocusEffect(useCallback(() => {
    const tab: ActiveTab = startTab === "magicScan" ? "magicScan" : "quickAdd";
    setActiveTab(tab);
    tabPosition.value = tab === "magicScan" ? 1 : 0;
    refreshMyMeals();
  }, [startTab, refreshMyMeals]));
  useEffect(() => {
    if (isSearchActive) setShowDropdown(true);
  }, [query, category, foodType]);
  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    tabPosition.value = withTiming(tab === "magicScan" ? 1 : 0, { duration: 250 });
  };
  const closeMealDropdown = () => {
    setIsMealDropdownOpen(false);
    arrowRotation.value = withTiming(0, { duration: 250 });
  };
  const toggleMealDropdown = () => {
    const next = !isMealDropdownOpen;
    setIsMealDropdownOpen(next);
    arrowRotation.value = withTiming(next ? 180 : 0, { duration: 250 });
  };
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tabPosition.value * (screenWidth / 2) }],
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));
  const TAB_BAR_HEIGHT = 148;
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const start = Date.now();
    setQuery(""); setCategory("all"); setFoodType("all"); setFilter("My");
    setShowDropdown(false); closeMealDropdown(); Keyboard.dismiss();
    catListRef.current?.scrollToOffset({ offset: 0, animated: true });
    foodTypeListRef.current?.scrollToOffset({ offset: 0, animated: true });
    await Promise.all([
      refreshPopularMeals ? refreshPopularMeals() : Promise.resolve(),
      refreshMyMeals(),
    ]);
    const elapsed = Date.now() - start;
    if (elapsed < 1500) await new Promise(r => setTimeout(r, 1500 - elapsed));
    setRefreshing(false);
  }, [setQuery, setCategory, setFoodType, setFilter, refreshPopularMeals, refreshMyMeals]);
  const sharedHeader = (
    <View style={{ zIndex: 200 }}>
      <View className="flex-row w-[362px] self-center items-center justify-between py-4">
        <Icon onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} className="bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular" />
        </Icon>
        <View className="relative items-center" style={{ zIndex: 300 }}>
          <TouchableOpacity onPress={toggleMealDropdown} activeOpacity={0.25} className="flex-row items-center gap-2">
            <Text className="font-nunito-700 text-xl text-white" numberOfLines={1}>{mealType}</Text>
            <Animated.View style={arrowStyle}>
              <CaretDown size={20} color="white" weight="bold" />
            </Animated.View>
          </TouchableOpacity>
          {logDateLabel && (
            <Text className="font-nunito-600 text-xs text-white/40 mt-0.5 text-center self-center">({logDateLabel})</Text>
          )}
          {isMealDropdownOpen && (
            <Animated.View
              entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(250)}
              style={{ position: "absolute", top: 44, zIndex: 400 }}
              className="bg-dark rounded-[15px] w-[200px] border border-white/10 overflow-hidden"
            >
              {MEAL_TYPES.map((type) => (
                <TouchableOpacity
                  key={type} activeOpacity={0.25}
                  onPress={() => { setMealType(type); closeMealDropdown(); }}
                  className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? "bg-yellow/30" : ""}`}
                >
                  <Text className={`font-nunito-700 text-lg ${mealType === type ? "text-yellow" : "text-white"}`}>{type}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
        <View className="w-12" />
      </View>
      <View style={{ position: "relative" }}>
        <View className="flex-row">
          <TouchableOpacity className="flex-1 items-center py-3" activeOpacity={0.25} onPress={() => switchTab("quickAdd")}>
            <Text className="font-nunito-700 text-lg" style={{ color: activeTab === "quickAdd" ? "#FFFFFF" : "rgba(255,255,255,0.35)" }}>
              Quick Add
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 items-center py-3" activeOpacity={0.25} onPress={() => switchTab("magicScan")}>
            <Text className="font-nunito-700 text-lg" style={{ color: activeTab === "magicScan" ? "#FFFFFF" : "rgba(255,255,255,0.35)" }}>
              Magic Scan
            </Text>
          </TouchableOpacity>
        </View>
        <Animated.View style={[{ position: "absolute", bottom: 0, width: screenWidth / 2, height: 2, backgroundColor: "#C5E384" }, indicatorStyle]} />
      </View>
      <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.08)" }} />
    </View>
  );
  return (
    <View className="flex-1" style={{ marginTop: 56 }}>
      {activeTab === "quickAdd" && sharedHeader}
      {activeTab === "quickAdd" && (
        <TouchableWithoutFeedback onPress={() => {
          closeMealDropdown(); Keyboard.dismiss();
          if (showDropdown && isSearchActive) { setShowDropdown(false); setCategory("all"); setFoodType("all"); }
        }}>
          <View className="flex-1">
            <FlatList
              data={[]} keyExtractor={(_, i) => i.toString()} renderItem={() => null}
              showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              onScrollBeginDrag={() => { Keyboard.dismiss(); closeMealDropdown(); }}
              nestedScrollEnabled scrollEventThrottle={16}
              contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom, flexGrow: 1 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh}
                  tintColor="#C5E384" colors={["#C5E384"]} progressBackgroundColor="#1D1D1D" />
              }
              ListHeaderComponent={
                <View className="z-20">
                  <Animated.View entering={FadeInDown.duration(250).delay(60)} className="w-[362px] self-center mt-4" style={{ zIndex: 150 }}>
                    <SearchInput
                      isInput placeholder="Maybe pizza?..." showCamera={false}
                      value={query} onChangeText={setQuery}
                      isSubmitDisabled={query.trim().length < 2}
                      onSubmit={() => { submitSearch(); router.push("/search-results"); }}
                      onClear={() => {}}
                      onFocus={() => { if (isSearchActive) setShowDropdown(true); }}
                    />
                  </Animated.View>
                  <Animated.View entering={FadeInDown.duration(250).delay(250)} className="mt-3">
                    <FlatList ref={catListRef} data={CATEGORY_OPTIONS} horizontal showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.value} nestedScrollEnabled directionalLockEnabled scrollEventThrottle={16}
                      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
                      renderItem={({ item }) => <FilterChip label={item.label} isActive={category === item.value} onPress={() => setCategory(item.value)} />} />
                  </Animated.View>
                  {category === "all" && (
                    <Animated.View entering={FadeInDown.duration(250).delay(250)} className="mt-3">
                      <FlatList ref={foodTypeListRef} data={FOOD_TYPE_OPTIONS} horizontal showsHorizontalScrollIndicator={false}
                        keyExtractor={(item) => item.value} nestedScrollEnabled directionalLockEnabled scrollEventThrottle={16}
                        contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
                        renderItem={({ item }) => <FilterChip label={item.label} isActive={foodType === item.value} onPress={() => setFoodType(item.value)} />} />
                    </Animated.View>
                  )}
                  {showDropdown && isSearchActive && (
                    <Animated.View
                      entering={FadeInDown.duration(250)}
                      exiting={FadeOut.duration(250)}
                      className={`w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute overflow-hidden ${category === "all" ? "top-[180px]" : "top-[134px]"}`}
                      style={{ zIndex: 50, elevation: 20, shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 10 }}
                    >
                      <View className="flex-row items-center justify-between mb-1 px-4">
                        <Text className="text-white/60 font-nunito-700 text-lg flex-1 mr-2" numberOfLines={1}>
                          {isSearching || isSearchPending || searchResults.length > 0
                            ? query.trim().length === 0 && category !== "all"
                              ? category === "fruits" ? "Fruits" : "Vegetables"
                              : "Related Searches"
                            : "Not Found"}
                        </Text>
                        {!isSearching && !isSearchPending && searchResults.length > 0 && searchSource && (
                          <Text className="text-white/30 font-nunito-600 text-sm flex-shrink-0">
                            via {searchSource === "usda" ? "Homemade" : "Packaged"}
                          </Text>
                        )}
                      </View>
                      <View>
                        {isSearching || isSearchPending
                          ? Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={`skel-${i}`} />)
                          : searchResults.length > 0
                            ? searchResults.slice(0, 4).map((item) => {
                                const isFav = (popularMeals || []).some(p =>
                                  p?.name?.toLowerCase() === item?.name?.toLowerCase() &&
                                  (p?.barcode === item?.barcode || !item?.barcode));
                                return (
                                  <SearchResultItem key={item.id} item={item} onPress={() => {
                                    Keyboard.dismiss();
                                    markQuickAdd();
                                    router.push({ pathname: "/search-item/[id]", params: { id: item.id, item: JSON.stringify(item), isFavorite: isFav ? "true" : "false", mealType, source: "quickAdd", ...(logDate ? { logDate } : {}) } });
                                  }} />
                                );
                              })
                            : (
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
                  <Animated.View entering={FadeInDown.duration(250).delay(250)} className="z-10 relative mt-4">
                    <PopularMealsSection onBeforeNavigate={markQuickAdd} logDate={logDate} />
                    <View className="w-[362px] self-center mt-8 mb-4">
                      <View className="flex-row items-end justify-between">
                        <Text className="title">My Meals</Text>
                        <Button onPress={() => router.push("/create-meal")} icon={<Plus size={20} color="#1D1D1D" weight="bold" />}>Create</Button>
                      </View>
                      <View className="gap-3 mt-4">
                        {myMealsLoading ? (
                          Array.from({ length: 2 }).map((_, i) => (
                            <MyMealSkeleton key={i} />
                          ))
                        ) : myMeals.length === 0 ? (
                          <View className="items-center py-8 gap-3">
                            <Text className="text-white/30 font-nunito-600 text-base text-center">
                              No meals yet. Create your first!
                            </Text>
                          </View>
                        ) : (
                          myMeals.map(meal => (
                            <MyMeal
                              key={meal.id}
                              imgUrl={meal.image_url}
                              name={meal.name}
                              calories={Math.round(meal.calories_per_100g)}
                              onPress={() => router.push({
                                pathname: "/create-meal",
                                params: {
                                  editId: meal.id,
                                  editName: meal.name,
                                  editCal: String(Math.round(meal.calories_per_100g)),
                                  editProtein: String(Math.round(meal.protein_per_100g)),
                                  editCarbs: String(Math.round(meal.carbs_per_100g)),
                                  editFat: String(Math.round(meal.fat_per_100g)),
                                  isCustom: meal.isCustom ? "true" : "false",
                                  mealType,
                                  ...(logDate ? { logDate } : {}),
                                },
                              })}
                              onAddPress={() => router.push({
                                pathname: "/search-item/[id]",
                                params: {
                                  id: meal.id,
                                  item: JSON.stringify({
                                    id: meal.id,
                                    name: meal.name,
                                    image_url: meal.image_url,
                                    calories_per_100g: meal.calories_per_100g,
                                    carbs_per_100g: meal.carbs_per_100g,
                                    fat_per_100g: meal.fat_per_100g,
                                    protein_per_100g: meal.protein_per_100g,
                                    health_rating: meal.health_rating,
                                    source: "usda",
                                  }),
                                  mealType,
                                  source: "quickAdd",
                                  ...(logDate ? { logDate } : {}),
                                },
                              })}
                            />
                          ))
                        )}
                      </View>
                    </View>
                  </Animated.View>
                </View>
              }
            />
          </View>
        </TouchableWithoutFeedback>
      )}
      <Modal visible={activeTab === "magicScan"} animationType="none" transparent={false} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: "#000000" }}>
          <CameraModal
            visible={true}
            onClose={() => { handleRetake(); switchTab("quickAdd"); }}
            mode={cameraMode === "barcode" ? "barcode" : "magic"}
            onBarcodeScanned={handleBarcodeScanned}
            onCapture={handleCapture}
            isProcessing={isProcessing}
            capturedImageUri={capturedUri}
            pendingPhotoUri={pendingPhoto?.uri ?? null}
            onConfirm={handleConfirm}
            onRetake={handleRetake}
            overlayText="Scan barcode or take a photo"
            asModal={false}
            hideHeader={true}
          />
          {!isConfirming && !isScanning && (
            <View
              style={{ position: "absolute", top: 56, left: 0, right: 0, zIndex: 200 }}
              pointerEvents="box-none"
            >
              <View
                className="flex-row w-[362px] self-center items-center justify-between py-4"
              >
                <Icon onPress={() => { handleRetake(); switchTab("quickAdd"); }} className="bg-yellow w-12 h-12">
                  <CaretLeft size={24} color="#1D1D1D" weight="regular" />
                </Icon>
                <View className="relative items-center" style={{ zIndex: 300 }}>
                  <TouchableOpacity onPress={toggleMealDropdown} activeOpacity={0.25} className="flex-row items-center gap-2">
                    <Text className="font-nunito-700 text-xl text-white" numberOfLines={1}>{mealType}</Text>
                    <Animated.View style={arrowStyle}>
                      <CaretDown size={20} color="white" weight="bold" />
                    </Animated.View>
                  </TouchableOpacity>
                  {logDateLabel && (
                    <Text className="font-nunito-600 text-xs text-white/40 mt-0.5">({logDateLabel})</Text>
                  )}
                  {isMealDropdownOpen && (
                    <Animated.View
                      entering={FadeInUp.duration(250)} exiting={FadeOutUp.duration(250)}
                      style={{ position: "absolute", top: 44, zIndex: 400 }}
                      className="bg-dark rounded-[15px] w-[200px] border border-white/10 overflow-hidden"
                    >
                      {MEAL_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type} activeOpacity={0.25}
                          onPress={() => { setMealType(type); closeMealDropdown(); }}
                          className={`py-4 px-4 border-b border-white/5 last:border-b-0 ${mealType === type ? "bg-yellow/30" : ""}`}
                        >
                          <Text className={`font-nunito-700 text-lg ${mealType === type ? "text-yellow" : "text-white"}`}>{type}</Text>
                        </TouchableOpacity>
                      ))}
                    </Animated.View>
                  )}
                </View>
                <View className="w-12" />
              </View>
              <View style={{ position: "relative" }}>
                <View className="flex-row">
                  <TouchableOpacity className="flex-1 items-center py-3" activeOpacity={0.25} onPress={() => switchTab("quickAdd")}>
                    <Text className="font-nunito-700 text-lg" style={{ color: activeTab === "quickAdd" ? "#FFFFFF" : "rgba(255,255,255,0.35)" }}>
                      Quick Add
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-1 items-center py-3" activeOpacity={0.25} onPress={() => switchTab("magicScan")}>
                    <Text className="font-nunito-700 text-lg" style={{ color: activeTab === "magicScan" ? "#FFFFFF" : "rgba(255,255,255,0.35)" }}>
                      Magic Scan
                    </Text>
                  </TouchableOpacity>
                </View>
                <Animated.View style={[{ position: "absolute", bottom: 0, width: screenWidth / 2, height: 2, backgroundColor: "#C5E384" }, indicatorStyle]} />
              </View>
              <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.15)" }} />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};
export default QuickAdd;