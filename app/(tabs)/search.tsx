import { Button, FilterChip, Icon, PopularMealsSection, SearchInput, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import type { FoodCategory, FoodType } from "@/types/searchFilters";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft, DotsThree, MagnifyingGlass, Plus } from "phosphor-react-native";
import { FlatList, Keyboard, Text, View } from "react-native";
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
  const { query, setQuery, searchResults, isSearching, searchSource, submitSearch, category, setCategory, foodType, setFoodType } = useSearchContext();
  //Constants
  const TAB_BAR_HEIGHT = 148;
  const hasFiltersActive = category !== "all" || foodType !== "all";
  const isSearchActive = query.trim().length > 0 || hasFiltersActive;
  return (
    <View className="flex-1 mt-[88px] w-full">
      <View className="flex-row w-[380px] self-center justify-center items-center py-4">
        <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular" />
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
        onScrollBeginDrag={Keyboard.dismiss}
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
                isSubmitDisabled={searchResults.length === 0 || isSearching}
                onSubmit={() => {
                  submitSearch();
                  router.push("/search-results");
                }}
                onClear={() => {
                  setCategory("all");
                  setFoodType("all");
                }}
              />
              <Icon onPress={() => { }} className="bg-yellow w-12 h-12">
                <DotsThree size={24} color="#1D1D1D" weight="regular" />
              </Icon>
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
            {isSearchActive && (
              <View
                className={`z-50 w-[362px] self-center bg-dark rounded-[20px] border border-white/10 py-4 absolute overflow-hidden ${category === "all" ? "top-[180px]" : "top-[134px]"}`}
                style={{ 
                  elevation: 10, 
                  shadowColor: "#000000", 
                  shadowOpacity: 0.5, 
                  shadowRadius: 10
                }}
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
                    searchResults.map((item) => (
                      <SearchResultItem
                        key={item.id}
                        item={item}
                        onPress={() => router.push({
                          pathname: "/search-item/[id]",
                          params: { id: item.id, item: JSON.stringify(item) }
                        })}
                      />
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
              </View>
            )}
            <View className="z-10 relative mt-6">
              <PopularMealsSection/>
              <View className="w-[362px] self-center mt-8 mb-4">
                <View className="flex-row items-end justify-between">
                  <Text className="title">My Meals</Text>
                  <Button
                    onPress={() => { }}
                    icon={<Plus size={20} color="#1D1D1D" weight="bold" />}
                  >
                    Create
                  </Button>
                </View>
              </View>
            </View>
          </View>
        }
      />
    </View>
  );
};
export default Search;