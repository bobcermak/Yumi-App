import { PopularMeal, PopularMealSkeleton, SegmentedControl } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";
import { useRouter } from "expo-router";
import { ForkKnife, Ghost } from "phosphor-react-native";
import { Dimensions, FlatList, Pressable, Text, View } from "react-native";
import { useRef, useEffect } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type EmptyItem = { id: string; isEmpty: true };
type MealItem = { id: string; isEmpty?: false; [key: string]: any };
type ListItem = EmptyItem | MealItem;
const PopularMealsSection = ({ onBeforeNavigate, logDate, onMealPress }: { onBeforeNavigate?: () => void; logDate?: string; onMealPress?: (item: any) => void }) => {
  const router = useRouter();
  const { popularMeals, filter, setFilter, isLoading } = useSearchContext();
  const flatListRef = useRef<FlatList>(null);
  const hasItems = popularMeals && popularMeals.length > 0;

  useEffect(() => {
    if (!isLoading) {
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [isLoading]);
  const listData: ListItem[] = hasItems
    ? (popularMeals as MealItem[])
    : [{ id: '__empty__', isEmpty: true }];
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
      {isLoading ? (
        <View style={{ height: 200, flexDirection: "row", alignItems: "center", paddingHorizontal: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <PopularMealSkeleton key={`skel-${i}`} />
          ))}
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={listData}
          horizontal
          scrollEnabled={hasItems}
          directionalLockEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            if (item.isEmpty) {
              return (
                <Pressable style={{ width: SCREEN_WIDTH - 32, height: 200, alignItems: "center", justifyContent: "center" }}>
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
                </Pressable>
              );
            }
            return (
              <PopularMeal
                name={item.name || "Unknown Meal"}
                imgUrl={item.image_url}
                calories={item.calories_per_100g || 0}
                onPress={() => {
                  onBeforeNavigate?.();
                  if (onMealPress) {
                    onMealPress(item);
                  } else {
                    router.push({
                      pathname: "/search-item/[id]",
                      params: {
                        id: item.id,
                        item: JSON.stringify(item),
                        isFavorite: filter === 'My' ? 'true' : 'false',
                        source: "quickAdd",
                        ...(logDate ? { logDate } : {})
                      }
                    });
                  }
                }}
              />
            );
          }}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ height: 200 }}
        />
      )}
    </View>
  );
};
export default PopularMealsSection;