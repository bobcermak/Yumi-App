import type { FoodSearchResult } from "@/types/foodSearchResult";
import { FC } from "react";
import { Text, View, Image, TouchableOpacity } from "react-native";

type SearchResultItemProps = {
  item: FoodSearchResult,
  onPress?: () => void
};
const SearchResultItem: FC<SearchResultItemProps> = ({ item, onPress }) => {
  //Functions
  const getRatingColor = (rating?: number): string => {
    if (rating === undefined || rating === null) return "#FFFFFF30";
    if (rating >= 8) return "#84C754";
    if (rating >= 6) return "#C5E384";
    if (rating >= 4) return "#ED8936";
    return "#E53E3E";
  };
  return (
  <TouchableOpacity 
    className="w-[362px] self-center flex-row items-center py-2 px-4"
    onPress={onPress}
    activeOpacity={0.25}
  >
    <View className="mr-3 relative">
      <Image
        source={item.image_url ? { uri: item.image_url } : require("@/assets/images/not-found-meal.webp")}
        className="w-12 h-12 rounded-lg"
        resizeMode="cover"
      />
      {item.health_rating !== undefined && item.health_rating !== null && (
        <View className="absolute -bottom-1 -right-1.5 w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: getRatingColor(item.health_rating) }}>
          <Text className="font-nunito-700 text-[8px] text-dark">
            {item.health_rating}
          </Text>
        </View>
      )}
    </View>
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
        <Text className="text-yellow font-nunito-700 text-base">{Math.round(item.calories_per_100g)} cal</Text>
      )}
      <Text className="text-white/30 font-nunito-600 text-xs">per 100g</Text>
    </View>
  </TouchableOpacity>
  );
};
export default SearchResultItem;