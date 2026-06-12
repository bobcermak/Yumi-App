import { Button, FilterChip, Icon, MyMeal, MyMealSkeleton, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useMyMeals } from "@/lib/hooks/useMyMeals";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CaretLeft, DotsThree, ForkKnife, Lightning, MagnifyingGlass, Plus } from "phosphor-react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { FlatList, Keyboard, Text, TouchableOpacity, TouchableWithoutFeedback, View, RefreshControl } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
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
const Search = () => {
  //Router
  const router = useRouter();
  const { focus, initialQuery, mealType: addMoreMealType, logDate: addMoreLogDate, source: addMoreSource } = useLocalSearchParams<{ focus?: string; initialQuery?: string; mealType?: string; logDate?: string; source?: string }>();
  const insets = useSafeAreaInsets();
  //Contexts
  const { query, setQuery, searchResults, isSearching, isSearchPending, searchSource, submitSearch, category, setCategory, foodType, setFoodType, popularMeals, refreshPopularMeals, setFilter,
  } = useSearchContext();
  const { items: myMeals, isLoading: myMealsLoading, refresh: refreshMyMeals } = useMyMeals();
  useFocusEffect(useCallback(() => { refreshMyMeals(); }, [refreshMyMeals]));
  //Hooks
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDotsMenu, setShowDotsMenu] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const catListRef = useRef<FlatList>(null);
  const foodTypeListRef = useRef<FlatList>(null);
  const pageOpacity = useSharedValue<number>(0);
  const hasPreFilledRef = useRef<boolean>(false);
  const hasAutoSubmittedRef = useRef<boolean>(false);

  useEffect(() => {
    if (initialQuery && !hasPreFilledRef.current) {
      hasPreFilledRef.current = true;
      setQuery(initialQuery);
      setShowDropdown(true);
    }
  }, []);
  useEffect(() => {
    if (initialQuery && query === initialQuery && !hasAutoSubmittedRef.current && query.trim().length >= 2) {
      hasAutoSubmittedRef.current = true;
      submitSearch();
    }
  }, [query]);
  //Animations
  useEffect(() => {
    pageOpacity.value = withTiming(1, { duration: 250 });
  }, [pageOpacity]);
  const animatedPageStyle = useAnimatedStyle(() => ({
    opacity: pageOpacity.value,
    flex: 1
  }));
  //Refresh control
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    const start = Date.now();
    setQuery("");
    setCategory("all");
    setFoodType("all");
    setFilter("My");
    setShowDropdown(false);
    setShowDotsMenu(false);
    Keyboard.dismiss();
    catListRef.current?.scrollToOffset({ offset: 0, animated: true });
    foodTypeListRef.current?.scrollToOffset({ offset: 0, animated: true });
    await Promise.all([
      refreshPopularMeals ? refreshPopularMeals() : Promise.resolve(),
      refreshMyMeals(),
    ]);
    const elapsed = Date.now() - start;
    const minTime = 1500;
    if (elapsed < minTime) {
      await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
    }
    setRefreshing(false);
  }, [setQuery, setCategory, setFoodType, setFilter, refreshPopularMeals, refreshMyMeals]);
  const DOTS_OPTIONS = [
    {
      label: "Create Meal",
      icon: <ForkKnife size={18} color="#C5E384" weight="regular" />,
      onPress: () => {
        setShowDotsMenu(false);
        router.push("/create-meal");
      },
    },
    {
      label: "Quick Add",
      icon: <Lightning size={18} color="#C5E384" weight="regular" />,
      onPress: () => {
        setShowDotsMenu(false);
        router.push("/quick-add");
      },
    },
    {
      label: "Magic Scan",
      icon: <Camera size={18} color="#C5E384" weight="regular" />,
      onPress: () => {
        setShowDotsMenu(false);
        router.push("/magic-scan");
      },
    },
  ] as const;
  //Constants
  const TAB_BAR_HEIGHT = 148;
  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;
  useEffect(() => {
    if (isSearchActive) setShowDropdown(true);
  }, [isSearchActive]);
  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setShowDotsMenu(false);
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
      }}
    >
      <Animated.View style={animatedPageStyle}>
        <View className="flex-1 mt-[56px] w-full">
          <View className="flex-row w-[380px] self-center justify-center items-center py-4">
            <Icon
              onPress={() => router.back()}
              className="absolute left-[4px] bg-yellow w-12 h-12"
            >
              <CaretLeft size={24} color="#1D1D1D" weight="regular" />
            </Icon>
            <Text className="font-nunito-700 text-[28px] text-white">
              Search
            </Text>
          </View>
          <FlatList
            data={[]}
            keyExtractor={(_, index) => index.toString()}
            renderItem={() => null}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onScrollBeginDrag={() => {
              Keyboard.dismiss();
            }}
            nestedScrollEnabled={true}
            scrollEventThrottle={16}
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + insets.bottom,
              flexGrow: 1,
            }}
            refreshControl={
              <RefreshControl 
                  refreshing={refreshing} 
                  onRefresh={onRefresh} 
                  tintColor="#C5E384"
                  colors={["#C5E384"]}
                  progressBackgroundColor="#1D1D1D"
              />
            }
            ListHeaderComponent={
              <View className="z-20">
                <Animated.View entering={FadeInDown.duration(250).delay(100)} className="w-[362px] self-center mt-4 flex-row items-center gap-1 justify-between" style={{ zIndex: 150 }}>
                  <SearchInput
                    isInput
                    autoFocus={focus === "true"}
                    placeholder="Maybe pizza?..."
                    showCamera={false}
                    className="w-[310px]"
                    value={query}
                    onChangeText={setQuery}
                    isSubmitDisabled={
                      query.trim().length < 2 ||
                      isSearching
                    }
                    onSubmit={() => {
                      submitSearch();
                      router.push({
                        pathname: "/search-results",
                        params: addMoreSource === "addMore" ? { mealType: addMoreMealType, ...(addMoreLogDate ? { logDate: addMoreLogDate } : {}), source: "addMore" } : {},
                      });
                    }}
                    onClear={() => {}}
                    onFocus={() => { if (isSearchActive) setShowDropdown(true); }}
                  />
                  <View style={{ position: "relative", zIndex: 100 }}>
                    <Icon
                      onPress={() => setShowDotsMenu((prev) => !prev)}
                      className={`w-12 h-12 ${showDotsMenu ? "bg-white/20" : "bg-yellow"}`}
                    >
                      <DotsThree
                        size={24}
                        color={showDotsMenu ? "#FFFFFF" : "#1D1D1D"}
                        weight="bold"
                      />
                    </Icon>
                    {showDotsMenu && (
                      <Animated.View
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(250)}
                        className="absolute top-[54px] right-0 w-[200px] bg-[#1A1A1A] rounded-2xl border border-white/10 overflow-hidden z-[200]"
                        style={{
                          shadowColor: "#000000",
                          shadowOffset: { width: 0, height: 8 },
                          shadowOpacity: 0.5,
                          shadowRadius: 16,
                          elevation: 24,
                        }}
                      >
                        {DOTS_OPTIONS.map((item, i) => (
                          <Animated.View
                            key={item.label}
                            entering={FadeInDown.delay(i * 45)
                              .duration(250)
                              .springify()}
                          >
                            <TouchableOpacity
                              onPress={item.onPress}
                              activeOpacity={0.25}
                              className="flex-row items-center gap-3 px-4 py-3 border-b border-white/10 bg-dark z-50"
                              style={{
                                borderBottomWidth: i < DOTS_OPTIONS.length - 1 ? 1 : 0
                              }}
                            >
                              <View className="w-8 h-8 rounded-[15px] items-center justify-center bg-yellow/10">
                                {item.icon}
                              </View>
                              <Text className="text-base text-white font-nunito-700">
                                {item.label}
                              </Text>
                            </TouchableOpacity>
                          </Animated.View>
                        ))}
                      </Animated.View>
                    )}
                  </View>
                </Animated.View>
                <Animated.View entering={FadeInDown.duration(250).delay(150)} className="w-[362px] self-center mt-3">
                  <FlatList
                    ref={catListRef}
                    data={CATEGORY_OPTIONS}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.value}
                    nestedScrollEnabled={true}
                    directionalLockEnabled={true}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ gap: 8 }}
                    renderItem={({ item }) => (
                      <FilterChip
                        label={item.label}
                        isActive={category === item.value}
                        onPress={() => setCategory(item.value)}
                      />
                    )}
                  />
                </Animated.View>
                {category === "all" && (
                  <Animated.View entering={FadeInDown.duration(250).delay(200)} className="w-[362px] self-center mt-3">
                    <FlatList
                      ref={foodTypeListRef}
                      data={FOOD_TYPE_OPTIONS}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item) => item.value}
                      nestedScrollEnabled={true}
                      directionalLockEnabled={true}
                      scrollEventThrottle={16}
                      contentContainerStyle={{ gap: 8 }}
                      renderItem={({ item }) => (
                        <FilterChip
                          label={item.label}
                          isActive={foodType === item.value}
                          onPress={() => setFoodType(item.value)}
                        />
                      )}
                    />
                  </Animated.View>
                )}
                {showDropdown && isSearchActive && (
                  <Animated.View
                    entering={FadeInDown.duration(250)}
                    exiting={FadeOut.duration(250)}
                    className={`w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute overflow-hidden ${category === "all" ? "top-[180px]" : "top-[134px]"}`}
                    style={{
                      zIndex: 50,
                      elevation: 20,
                      shadowColor: "#000000",
                      shadowOpacity: 0.5,
                      shadowRadius: 10,
                    }}
                  >
                    <View className="flex-row items-center justify-between mb-1 px-4">
                      <Text className="text-white/60 font-nunito-700 text-lg flex-1 mr-2" numberOfLines={1}>
                        {isSearching || isSearchPending || searchResults.length > 0
                          ? query.trim().length === 0 && category !== "all"
                            ? category === "fruits"
                              ? "Fruits"
                              : "Vegetables"
                            : "Related Searches"
                          : "Not Found"}
                      </Text>
                      {!isSearching && !isSearchPending &&
                        searchResults.length > 0 &&
                        searchSource && (
                          <Text className="text-white/30 font-nunito-600 text-sm flex-shrink-0">
                            via{" "}
                            {searchSource === "usda" ? "Homemade" : "Packaged"}
                          </Text>
                        )}
                    </View>
                    <View>
                      {isSearching || isSearchPending ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <SearchResultSkeleton key={`skel-${i}`} />
                        ))
                      ) : searchResults.length > 0 ? (
                        searchResults.slice(0, 4).map((item) => {
                          const isFav = (popularMeals || []).some(
                            (p) =>
                              p?.name?.toLowerCase() ===
                                item?.name?.toLowerCase() &&
                              (p?.barcode === item?.barcode || !item?.barcode),
                          );
                          return (
                            <SearchResultItem
                              key={item.id}
                              item={item}
                              onPress={() => {
                                Keyboard.dismiss();
                                router.push({
                                  pathname: "/search-item/[id]",
                                  params: {
                                    id: item.id,
                                    item: JSON.stringify(item),
                                    isFavorite: isFav ? "true" : "false",
                                    ...(addMoreSource === "addMore" ? { mealType: addMoreMealType, ...(addMoreLogDate ? { logDate: addMoreLogDate } : {}), source: "addMore" } : {}),
                                  },
                                });
                              }}
                            />
                          );
                        })
                      ) : (
                        <View className="py-8 items-center justify-center gap-4">
                          <View className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
                            <MagnifyingGlass
                              size={32}
                              color="#C5E384"
                              weight="duotone"
                            />
                          </View>
                          <Text className="text-white/40 font-nunito-600 text-base text-center px-8">
                            No food found... 🥑 Try adjusting your search or
                            filters!
                          </Text>
                        </View>
                      )}
                    </View>
                  </Animated.View>
                )}
                <Animated.View entering={FadeInDown.duration(250).delay(250)} className="z-10 relative mt-4">
                  <PopularMealsSection />
                  <View className="w-[362px] self-center mt-8 mb-4">
                    <View className="flex-row items-end justify-between">
                      <Text className="title">My Meals</Text>
                      <Button
                        onPress={() => router.push("/create-meal")}
                        icon={<Plus size={20} color="#1D1D1D" weight="bold"/>}
                      >
                        Create
                      </Button>
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
                                ...(addMoreMealType ? { mealType: addMoreMealType } : {}),
                                ...(addMoreLogDate ? { logDate: addMoreLogDate } : {}),
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
                                ...(addMoreMealType ? { mealType: addMoreMealType } : {}),
                                ...(addMoreLogDate ? { logDate: addMoreLogDate } : {}),
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
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
export default Search;