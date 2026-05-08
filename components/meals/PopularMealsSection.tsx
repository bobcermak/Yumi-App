import { View, Text, FlatList } from "react-native";
import { PopularMeal, SegmentedControl } from "@/components";
import { useSearchContext } from "@/lib/hooks/useSearchContext";

const PopularMealsSection = () => {
  //Context
  const { popularMeals, filter, setFilter } = useSearchContext();
  
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
        contentContainerStyle={{ paddingLeft: 16 }}
        style={{ height: 200 }}
      />
    </View>
  );
};
export default PopularMealsSection;