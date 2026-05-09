import { View, Text, FlatList, Dimensions, ActivityIndicator } from "react-native";
import { PopularMeal, SegmentedControl } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PopularMealsSection = () => {
  //Context
  const { popularMeals, filter, setFilter, isLoading } = useSearchContext();
  
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
        data={popularMeals}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PopularMeal
            name={item.name}
            imgUrl={item.image_url}
            calories={item.calories_per_100g}
            url={item.id}
          />
        )}
        ListEmptyComponent={
          <View 
            style={{ width: SCREEN_WIDTH - 32 }} 
            className="flex-1 justify-center items-center"
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#C5E384"/>
            ) : (
              <Text className="text-white/50 font-nunito-600 text-base text-center px-4">
                {filter === 'My' 
                  ? "No crumbs here yet... 🥨 Try checking 'All' or start searching!"
                  : "It's a bit empty here... 🕸️ Let's fill it up together!"}
              </Text>
            )}
          </View>
        }
        contentContainerStyle={{ paddingHorizontal: 16, flexGrow: 1 }}
        style={{ height: 200 }}
      />
    </View>
  );
};
export default PopularMealsSection;