import { CaretRight, Plus } from "phosphor-react-native";
import { FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Icon } from "@/components";

type MyMealProps = {
  imgUrl?: string | null,
  name: string,
  weightGrams?: number,
  calories: number,
  onPress?: () => void,
  onAddPress?: () => void
};
const MyMeal: FC<MyMealProps> = ({ imgUrl, name, weightGrams, calories, onPress, onAddPress }) => {
  return (
    <TouchableOpacity
      className="bg-dark rounded-[15px] p-3 flex-row items-center w-[362px] self-center border border-white/10"
      onPress={onPress}
      activeOpacity={0.25}
    >
      <Image
        source={
          imgUrl
            ? { uri: imgUrl }
            : require("@/assets/images/not-found-meal.webp")
        }
        className="w-[60px] h-[60px] rounded-[10px]"
        resizeMode="cover"
      />
      <View className="flex-1 ml-4 gap-0.5 justify-center">
        <Text className="text-white font-nunito-700 text-lg">
          {name}
        </Text>
        <View className="flex-row items-center">
          <Text className="text-white/80 font-nunito-700 text-base">
            100 <Text className="text-white/50">g</Text>
          </Text>
          <Text className="text-white/25 font-nunito-700 text-sm mx-1">
            •
          </Text>
          <Text className="text-white/80 font-nunito-700 text-base">
            {calories} <Text className="text-white/50">cal</Text>
          </Text>
        </View>
      </View>
      <View className="flex-row items-center pl-2 gap-3 mr-1">
        <Icon onPress={onAddPress || (() => {})}>
            <Plus size={20} color="#1D1D1D" weight="regular"/>
        </Icon>
        <CaretRight size={20} color="#FFFFFF" weight="regular"/>
      </View>
    </TouchableOpacity>
  );
};
export default MyMeal;