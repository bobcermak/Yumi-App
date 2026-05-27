import { Minus as MinusIcon, Plus, Trash } from "phosphor-react-native";
import { memo, type FC, useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, FadeOut, FadeOutRight, LinearTransition } from "react-native-reanimated";

type MealLogIngredientCardProps = {
  emoji?: string,
  name: string,
  weight_g: number,
  calories: number,
  carbs_g: number,
  fat_g: number,
  protein_g: number,
  count?: number,
  index?: number,
  isLast?: boolean,
  isCountOpen?: boolean,
  onCountOpenChange?: (open: boolean) => void,
  onDelete?: () => void,
  onCountChange?: (newCount: number) => void
};
const MealLogIngredientCard: FC<MealLogIngredientCardProps> = ({ emoji = "🍽️", name, weight_g, calories, carbs_g, fat_g, protein_g, count = 1, index = 0, isLast = false, isCountOpen = false, onCountOpenChange, onDelete, onCountChange }) => {
  const enteringAnim = useRef(
    FadeInDown.delay(index * 80).duration(250),
  ).current;
  const safeEmoji = emoji && !/^[\x00-\x7F]+$/.test(emoji) ? emoji : "🍽️";
  return (
    <Animated.View
      entering={enteringAnim}
      exiting={FadeOut.duration(250)}
      layout={LinearTransition.springify().damping(18)}
      className="bg-dark rounded-[15px] p-4 border border-white/10"
      style={{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3,
      }}
    >
      {isCountOpen && (
        <TouchableOpacity
          activeOpacity={0.25}
          onPress={() => onCountOpenChange?.(false)}
          className="absolute inset-0 z-10"
        />
      )}
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-[12px] bg-white/8 items-center justify-center">
          <Text style={{ fontSize: 26, fontFamily: undefined }}>{safeEmoji}</Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-white font-nunito-700 text-xl"
            numberOfLines={1}
          >
            {name}
          </Text>
          <Text className="text-white font-nunito-700 text-base -mt-0.5">
            {weight_g} <Text className="text-white/50">g ·</Text> {calories}{" "}
            <Text className="text-white/50">cal</Text>
          </Text>
        </View>
        <View className="flex-row items-center gap-2 z-20">
          <View className="items-end">
            {isCountOpen && (
              <Animated.View
                entering={FadeInRight.springify()}
                exiting={FadeOutRight.duration(250)}
                className="absolute -top-14 right-0 flex-row items-center bg-[#2B2B2B] border border-white/10 rounded-[15px] px-2 gap-1"
                style={{ shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }}
              >
                <TouchableOpacity
                  onPress={() => onCountChange?.(Math.max(1, count - 1))}
                  className="p-3"
                  disabled={count <= 1}
                >
                  <MinusIcon size={20} color={count <= 1 ? "#FFFFFF30" : "white"} weight="bold" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onCountChange?.(count + 1)}
                  className="p-3"
                >
                  <Plus size={20} color="white" weight="bold" />
                </TouchableOpacity>
              </Animated.View>
            )}
            <TouchableOpacity
              onPress={() => onCountOpenChange?.(!isCountOpen)}
              activeOpacity={0.25}
              className={`justify-center items-center rounded-[10px] px-3 py-2 border border-white/10 ${isCountOpen ? 'bg-yellow' : 'bg-[#2B2B2B]'}`}
            >
              <Text className={`font-nunito-500 text-base ${isCountOpen ? 'text-dark' : 'text-white/50'}`}>
                x<Text className={`font-nunito-700 text-lg ${isCountOpen ? 'text-dark' : 'text-white'}`}>{count}</Text>
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (isLast) return;
              Alert.alert(
                "Remove ingredient",
                `Remove "${name}" from this meal?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Remove", style: "destructive", onPress: onDelete },
                ],
              );
            }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
            disabled={isLast}
          >
            <Trash
              size={20}
              color={isLast ? "#FFFFFF40" : "#CA877E"}
              weight="regular"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-row gap-2 mt-3">
        <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
          <Text className="text-white/50 font-nunito-600 text-lg">Carbs</Text>
          <Text className="text-white font-nunito-700 text-lg -mt-1">
            {carbs_g} <Text className="text-white/50">g</Text>
          </Text>
        </View>
        <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
          <Text className="text-white/50 font-nunito-600 text-lg">Fats</Text>
          <Text className="text-white font-nunito-700 text-lg -mt-1">
            {fat_g} <Text className="text-white/50">g</Text>
          </Text>
        </View>
        <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
          <Text className="text-white/50 font-nunito-600 text-lg">Protein</Text>
          <Text className="text-white font-nunito-700 text-lg -mt-1">
            {protein_g} <Text className="text-white/50">g</Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
};
export default memo(MealLogIngredientCard, (prev, next) =>
  prev.emoji === next.emoji &&
  prev.name === next.name &&
  prev.weight_g === next.weight_g &&
  prev.calories === next.calories &&
  prev.carbs_g === next.carbs_g &&
  prev.fat_g === next.fat_g &&
  prev.protein_g === next.protein_g &&
  prev.count === next.count &&
  prev.isLast === next.isLast &&
  prev.index === next.index &&
  prev.isCountOpen === next.isCountOpen
);