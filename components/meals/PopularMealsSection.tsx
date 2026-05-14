import { PopularMeal, PopularMealSkeleton, SegmentedControl } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import { useRouter } from "expo-router";
import { ForkKnife, Ghost } from "phosphor-react-native";
import { Dimensions, FlatList, Text, View } from "react-native";
import { useRef, useEffect } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PopularMealsSection = () => {
  //Router
  const router = useRouter();
  //Context
  const { popularMeals, filter, setFilter, isLoading } = useSearchContext();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!isLoading) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [isLoading]);
  return (
    <View className="w-full mt-8">
      <View className="w-[362px] self-center items-start gap-4 mb-4">
        <Text className="title">Popular Meals</Text>
        <SegmentedControl
          options={['My', 'All'] as const}
          selectedValue={filter}
          onValueChange={setFilter}
          width={180}
        />
      </View>
      <FlatList
        ref={flatListRef}
        data={popularMeals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PopularMeal
            name={item.name || "Unknown Meal"}
            imgUrl={item.image_url}
            calories={item.calories_per_100g || 0}
            onPress={() => {
              router.push({
                pathname: "/search-item/[id]",
                params: { 
                  id: item.id, 
                  item: JSON.stringify(item),
                  isFavorite: filter === 'My' ? 'true' : 'false'
                }
              })
            }}
          />
        )}
        ListEmptyComponent={
          isLoading ? (
            <View className="flex-row items-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <PopularMealSkeleton key={`skel-${i}`} />
              ))}
            </View>
          ) : (
            <View
              style={{ width: SCREEN_WIDTH - 32 }}
              className="flex-1 justify-center items-center py-6"
            >
              <View className="items-center justify-center gap-3">
                <View className="w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/20 items-center justify-center">
                  {filter === 'My' ? (
                    <Ghost size={32} color="#C5E384" weight="duotone" />
                  ) : (
                    <ForkKnife size={32} color="#C5E384" weight="duotone" />
                  )}
                </View>
                <Text className="text-white/40 font-nunito-600 text-base text-center px-8">
                  {filter === 'My'
                    ? "No crumbs here yet... Try checking 'All' or start searching!"
                    : "It's a bit empty here... 🕸️ Let's fill it up together!"}
                </Text>
              </View>
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
        style={{ height: 200 }}
      />
    </View>
  );
};
export default PopularMealsSection;