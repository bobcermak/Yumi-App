import type { FoodSearchResult } from "@/types/foodSearchResult";
import { getRatingColor } from "@/lib/helpers/mealHelpers";
import { CaretRight } from "phosphor-react-native";
import { FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";

type SearchResultItemProps = {
  item: FoodSearchResult,
  onPress?: () => void,
  showArrow?: boolean,
};

const SearchResultItem: FC<SearchResultItemProps> = ({ item, onPress, showArrow }) => {
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
      <View className="items-center flex-row gap-2">
        <View className="items-end">
          {item.calories_per_100g !== undefined && (
            <Text className="text-yellow font-nunito-700 text-base">{Math.round(item.calories_per_100g)} cal</Text>
          )}
          <Text className="text-white/30 font-nunito-600 text-xs">per 100g</Text>
        </View>
        {showArrow && (
          <CaretRight size={14} color="#FFFFFF40" weight="bold" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SearchResultItem;
