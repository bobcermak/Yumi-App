import { Trash } from "phosphor-react-native";
import { type FC, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

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
    onEdit?: (newCalories: number) => void,
    onDelete?: () => void,
    onCountChange?: (newCount: number) => void
};
const MealLogIngredientCard: FC<MealLogIngredientCardProps> = ({ emoji = "🍽️", name, weight_g, calories, carbs_g, fat_g, protein_g, count = 1, index = 0, onEdit, onDelete, onCountChange }) => {
    //Hooks
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [calInput, setCalInput] = useState<string>(String(calories));

    //Functions
    const handleEditConfirm = () => {
        const val = Number(calInput);
        if (!isNaN(val) && val > 0) onEdit?.(val);
        setIsEditing(false);
    };
    return (
        <Animated.View
            entering={FadeInDown.delay(index * 80).duration(250)}
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
                    <Text className="text-4xl">{emoji}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-white font-nunito-700 text-xl" numberOfLines={1}>
                        {name}
                    </Text>
                    <Text className="text-white font-nunito-700 text-base -mt-0.5">
                        {weight_g} <Text className="text-white/50">g ·</Text> {calories} <Text className="text-white/50">cal</Text>
                    </Text>
                </View>
                <View className="flex-row items-center gap-2">
                    <TouchableOpacity
                        onPress={() => {
                            const next = Math.max(1, count - 1 === 0 ? 1 : count);
                            onCountChange?.(next);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    >
                        <View className="rounded-[10px] px-2 py-1 bg-[#2B2B2B] border border-white/10">
                            {isEditing ? (
                                <TextInput
                                    className="text-white font-nunito-700 text-sm p-0 text-center"
                                    value={calInput}
                                    onChangeText={setCalInput}
                                    keyboardType="numeric"
                                    autoFocus
                                    onSubmitEditing={handleEditConfirm}
                                    onBlur={handleEditConfirm}
                                    style={{ minWidth: 36 }}
                                />
                            ) : (
                                <Text className="text-white/60 font-nunito-500 text-xl">
                                    x<Text className="text-white font-nunito-700 text-xl">{count}</Text>
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => Alert.alert(
                            "Remove ingredient",
                            `Remove "${name}" from this meal?`,
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Remove", style: "destructive", onPress: onDelete },
                            ]
                        )}
                        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                    >
                        <Trash size={20} color="#CA877E" weight="regular"/>
                    </TouchableOpacity>
                </View>
            </View>
            <View className="flex-row gap-2 mt-3">
                <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
                    <Text className="text-white/50 font-nunito-600 text-lg">Carbs</Text>
                    <Text className="text-white font-nunito-700 text-lg -mt-1">{carbs_g} <Text className="text-white/50">g</Text></Text>
                </View>
                <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
                    <Text className="text-white/50 font-nunito-600 text-lg">Fats</Text>
                    <Text className="text-white font-nunito-700 text-lg -mt-1">{fat_g} <Text className="text-white/50">g</Text></Text>
                </View>
                <View className="flex-1 bg-[#2B2B2B] border border-white/10 justify-center items-center rounded-[10px] py-2 px-4">
                    <Text className="text-white/50 font-nunito-600 text-lg">Protein</Text>
                    <Text className="text-white font-nunito-700 text-lg -mt-1">{protein_g} <Text className="text-white/50">g</Text></Text>
                </View>
            </View>
        </Animated.View>
    );
};
export default MealLogIngredientCard;