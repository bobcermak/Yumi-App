import { Trash } from "phosphor-react-native";
import { type FC, useRef, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";

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
  onEdit?: (newWeight: number) => void,
  onDelete?: () => void,
  onCountChange?: (newCount: number) => void
};
const MealLogIngredientCard: FC<MealLogIngredientCardProps> = ({ emoji = "🍽️", name, weight_g, calories, carbs_g, fat_g, protein_g, count = 1, index = 0, isLast = false, onEdit, onDelete, onCountChange }) => {
  //Hooks
  const enteringAnim = useRef(
    FadeInDown.delay(index * 80).duration(250),
  ).current;
  const [isEditingWeight, setIsEditingWeight] = useState<boolean>(false);
  const [weightInput, setWeightInput] = useState<string>(String(weight_g));
  const [isEditingCount, setIsEditingCount] = useState<boolean>(false);
  const [countInput, setCountInput] = useState<string>(String(count));

  //Functions
  const handleEditConfirm = () => {
    const val = Number(weightInput);
    if (!isNaN(val) && val > 0 && val !== weight_g) {
      onEdit?.(val);
    } else {
      setWeightInput(String(weight_g));
    }
    setIsEditingWeight(false);
  };
  const handleCountConfirm = () => {
    const val = parseInt(countInput);
    if (!isNaN(val) && val > 0 && val !== count) {
      onCountChange?.(val);
    } else {
      setCountInput(String(count));
    }
    setIsEditingCount(false);
  };
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
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-[12px] bg-white/8 items-center justify-center">
          <Text style={{ fontSize: 26, fontFamily: undefined }}>{emoji}</Text>
        </View>
        <View className="flex-1">
          <Text
            className="text-white font-nunito-700 text-xl"
            numberOfLines={1}
          >
            {name}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setWeightInput(String(weight_g));
              setIsEditingWeight(true);
            }}
            activeOpacity={0.25}
          >
            {isEditingWeight ? (
              <View className="flex-row items-center mt-[-2px]">
                <TextInput
                  className="text-white font-nunito-700 text-base p-0 w-12 border-b border-white/30"
                  value={weightInput}
                  onChangeText={setWeightInput}
                  keyboardType="numeric"
                  autoFocus
                  onSubmitEditing={handleEditConfirm}
                  onBlur={handleEditConfirm}
                  selectTextOnFocus
                />
                <Text className="text-white font-nunito-700 text-base">
                  <Text className="text-white/50">g ·</Text> {calories}{" "}
                  <Text className="text-white/50">cal</Text>
                </Text>
              </View>
            ) : (
              <Text className="text-white font-nunito-700 text-base -mt-0.5">
                {weight_g} <Text className="text-white/50">g ·</Text> {calories}{" "}
                <Text className="text-white/50">cal</Text>
              </Text>
            )}
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => {
              setCountInput(String(count));
              setIsEditingCount(true);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
          >
            <View className="rounded-[10px] px-2 py-1 bg-[#2B2B2B] border border-white/10">
              {isEditingCount ? (
                <View className="flex-row items-center">
                  <Text className="text-white/60 font-nunito-500 text-xl">
                    x
                  </Text>
                  <TextInput
                    className="text-white font-nunito-700 text-xl p-0 w-8 text-center"
                    value={countInput}
                    onChangeText={setCountInput}
                    keyboardType="numeric"
                    autoFocus
                    onSubmitEditing={handleCountConfirm}
                    onBlur={handleCountConfirm}
                    selectTextOnFocus
                  />
                </View>
              ) : (
                <Text className="text-white/60 font-nunito-500 text-xl">
                  x
                  <Text className="text-white font-nunito-700 text-xl">
                    {count}
                  </Text>
                </Text>
              )}
            </View>
          </TouchableOpacity>
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
export default MealLogIngredientCard;