import type { FoodSearchResult } from "@/types/foodSearchResult";
import { FC } from "react";
import { Text, View, Image } from "react-native";

type SearchResultItemProps = {
  item: FoodSearchResult;
};
const SearchResultItem: FC<SearchResultItemProps> = ({ item }) => (
  <View className="w-[362px] self-center flex-row items-center py-2 px-4">
    <Image
      source={item.image_url ? { uri: item.image_url } : require("@/assets/images/not-found-meal.webp")}
      className="w-12 h-12 rounded-lg mr-3"
      resizeMode="cover"
    />
    <View className="flex-1 mr-20">
      <View className="flex-row items-center gap-2">
        <Text className="text-white font-nunito-700 text-base" numberOfLines={1}>
          {item.name}
        </Text>
        {item.czech_name && (
          <Text className="text-white/30 font-nunito-700 text-xs" numberOfLines={1}>
            ({item.czech_name.length > 4 ? `${item.czech_name.substring(0, 4)}...` : item.czech_name})
          </Text>
        )}
      </View>
      {item.brand && (
        <Text className="text-white/50 font-nunito-600 text-sm" numberOfLines={1}>
          {item.brand}
        </Text>
      )}
    </View>
    <View className="items-end">
      {item.calories_per_100g !== undefined && (
        <Text className="text-yellow font-nunito-700 text-base">{Math.round(item.calories_per_100g)} kcal</Text>
      )}
      <Text className="text-white/30 font-nunito-600 text-xs">per 100g</Text>
    </View>
  </View>
);
export default SearchResultItem;