import { Button, FilterChip, Icon, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Camera, CaretLeft, DotsThree, ForkKnife, Lightning, MagnifyingGlass, Plus } from "phosphor-react-native";
import { useEffect, useState } from "react";
import { FlatList, Keyboard, TouchableWithoutFeedback, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut } from "react-native-reanimated";
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
  const { focus } = useLocalSearchParams<{ focus: string }>();
  const insets = useSafeAreaInsets();
  //Contexts
  const { query, setQuery, searchResults, isSearching, searchSource, submitSearch, category, setCategory, foodType, setFoodType, popularMeals } = useSearchContext();
  //Hooks
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [showDotsMenu, setShowDotsMenu] = useState<boolean>(false);

  const DOTS_OPTIONS = [
    {
      label: "Create Meal",
      icon: <ForkKnife size={18} color="#C5E384" weight="regular" />,
      onPress: () => { setShowDotsMenu(false); router.push("/create-meal/index"); },
    },
    {
      label: "Quick Add",
      icon: <Lightning size={18} color="#C5E384" weight="regular" />,
      onPress: () => { setShowDotsMenu(false); router.push("/quick-add"); },
    },
    {
      label: "Magic Scan",
      icon: <Camera size={18} color="#C5E384" weight="regular"/>,
      onPress: () => { setShowDotsMenu(false); router.push("/magic-scan"); },
    },
  ] as const;
  //Constants
  const TAB_BAR_HEIGHT = 148;
  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;

  useEffect(() => {
    if (isSearchActive) setShowDropdown(true);
  }, [query, category, foodType]);
  return (
    <TouchableWithoutFeedback onPress={() => { setShowDropdown(false); setShowDotsMenu(false); Keyboard.dismiss(); if (showDropdown && isSearchActive) { setCategory("all"); setFoodType("all"); } }}>
      <View style={{ flex: 1 }}>
      <View className="flex-1 mt-[88px] w-full" pointerEvents="box-none">
        <View className="flex-row w-[380px] self-center justify-center items-center py-4">
          <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
            <CaretLeft size={24} color="#1D1D1D" weight="regular"/>
          </Icon>
          <Text className="font-nunito-700 text-[28px] text-white">Search</Text>
        </View>
        <FlatList
          data={[]}
          keyExtractor={(_, index) => index.toString()}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScrollBeginDrag={() => { Keyboard.dismiss(); setShowDropdown(false); }}
          nestedScrollEnabled={true}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom, flexGrow: 1 }}
          ListHeaderComponent={
            <View className="z-20">
              <View className="w-[362px] self-center mt-4 flex-row items-center gap-1 justify-between">
                <SearchInput
                  isInput
                  autoFocus={focus === "true"}
                  placeholder="Maybe pizza?..."
                  showCamera={false}
                  className="w-[310px]"
                  value={query}
                  onChangeText={setQuery}
                  isSubmitDisabled={query.trim().length < 2 || isSearching || searchResults.length === 0}
                  onSubmit={() => {
                    submitSearch();
                    router.push("/search-results");
                  }}
                  onClear={() => {}}
                />
                <View style={{ position: 'relative', zIndex: 100 }}>
                  <Icon
                    onPress={() => setShowDotsMenu(prev => !prev)}
                    className={`w-12 h-12 ${showDotsMenu ? 'bg-white/20' : 'bg-yellow'}`}
                  >
                    <DotsThree size={24} color={showDotsMenu ? '#FFFFFF' : '#1D1D1D'} weight="bold" />
                  </Icon>
                  {showDotsMenu && (
                    <Animated.View
                      entering={FadeIn.duration(140)}
                      exiting={FadeOut.duration(110)}
                      style={{
                        position: 'absolute',
                        top: 54,
                        right: 0,
                        width: 200,
                        backgroundColor: '#1A1A1A',
                        borderRadius: 16,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: 0.5,
                        shadowRadius: 16,
                        elevation: 24,
                      }}
                    >
                      {DOTS_OPTIONS.map((item, i) => (
                        <Animated.View
                          key={item.label}
                          entering={FadeInDown.delay(i * 45).duration(200).springify()}
                        >
                          <TouchableOpacity
                            onPress={item.onPress}
                            activeOpacity={0.25}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              paddingHorizontal: 16,
                              paddingVertical: 14,
                              borderBottomWidth: i < DOTS_OPTIONS.length - 1 ? 1 : 0,
                              borderBottomColor: 'rgba(255,255,255,0.05)',
                            }}
                          >
                            <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(197,227,132,0.1)', alignItems: 'center', justifyContent: 'center' }}>
                              {item.icon}
                            </View>
                            <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 15 }}>{item.label}</Text>
                          </TouchableOpacity>
                        </Animated.View>
                      ))}
                    </Animated.View>
                  )}
                </View>
              </View>
              <View className="w-[362px] self-center mt-3">
                <FlatList
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
              </View>
              {category === "all" && (
                <View className="w-[362px] self-center mt-3">
                  <FlatList
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
                </View>
              )}
              {showDropdown && isSearchActive && (
                <View
                  onStartShouldSetResponder={() => true}
                  className={`w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute overflow-hidden ${category === "all" ? "top-[180px]" : "top-[134px]"}`}
                  style={{ zIndex: 50, elevation: 20, shadowColor: "#000000", shadowOpacity: 0.5, shadowRadius: 10 }}
                >
                  <View className="flex-row items-center justify-between mb-1 px-4">
                    <Text className="text-white/60 font-nunito-700 text-lg">
                      {isSearching || searchResults.length > 0
                        ? (query.trim().length === 0 && category !== "all" ? (category === "fruits" ? "Fruits" : "Vegetables") : "Related Searches")
                        : "Not Found"}
                    </Text>
                    {!isSearching && searchResults.length > 0 && searchSource && (
                      <Text className="text-white/30 font-nunito-600 text-sm">
                        via {searchSource === 'usda' ? "Homemade" : "Packaged"}
                      </Text>
                    )}
                  </View>
                  <View>
                    {isSearching ? (
                      Array.from({ length: 4 }).map((_, i) => <SearchResultSkeleton key={`skel-${i}`} />)
                    ) : searchResults.length > 0 ? (
                      searchResults.map((item) => {
                        const isFav = (popularMeals || []).some(p => p?.name?.toLowerCase() === item?.name?.toLowerCase() && (p?.barcode === item?.barcode || !item?.barcode));
                        return (
                          <SearchResultItem
                            key={item.id}
                            item={item}
                            onPress={() => router.push({
                              pathname: "/search-item/[id]",
                              params: { id: item.id, item: JSON.stringify(item), isFavorite: isFav ? 'true' : 'false' }
                            })}
                          />
                        );
                      })
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
                </View>
              )}
              <View className="z-10 relative mt-6">
                <PopularMealsSection/>
                <View className="w-[362px] self-center mt-8 mb-4">
                  <View className="flex-row items-end justify-between">
                    <Text className="title">My Meals</Text>
                    <Button onPress={() => { }} icon={<Plus size={20} color="#1D1D1D" weight="bold" />}>
                      Create
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          }
        />
      </View>
      </View>
    </TouchableWithoutFeedback>
  );
};
export default Search;
