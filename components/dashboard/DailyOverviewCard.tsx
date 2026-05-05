import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { format } from "date-fns";
import { PencilSimple, Hamburger, Avocado, Fish } from "phosphor-react-native";
import CircularProgress from "./CircularProgress";
import MacroColumn from "./MacroColumn";

type DailyOverviewCardProps = {
    date: Date;
    calories: { current: number; max: number };
    macros: {
        carbs: { current: number; max: number };
        fats: { current: number; max: number };
        protein: { current: number; max: number };
    };
    onEditCalories?: () => void;
    onEditMacro?: (macro: 'carbs' | 'fats' | 'protein') => void;
};
const DailyOverviewCard: React.FC<DailyOverviewCardProps> = ({date, calories, macros, onEditCalories, onEditMacro}) => {
    return (
        <View 
            className="bg-dark rounded-[20px] px-5 py-10 mt-4 w-[362px] self-center border border-white/10"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
            }}
        >
            <Text className="text-white text-xl font-nunito-700">
                <Text className="text-yellow">{format(date, "dd")} </Text>
                {format(date, "MMMM, EEEE")}
            </Text>
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-white text-[61px] font-nunito-700 pt-2" style={{ lineHeight: 61 }}>
                        {calories.current}
                    </Text>
                    <View className="flex-row items-center gap-2 -mt-3">
                        <Text className="text-white/50 text-xl font-nunito-700">
                            of {calories.max} cal
                        </Text>
                        {onEditCalories && (
                            <TouchableOpacity onPress={onEditCalories} activeOpacity={0.25}>
                                <PencilSimple size={18} color="#FFFFFF80" weight="regular"/>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <CircularProgress value={calories.current} max={calories.max} />
            </View>
            <Text className="text-white/80 text-xl font-nunito-600">
                Macronutrients
            </Text>
            <View className="flex-row justify-between gap-6 mt-2">
                <MacroColumn 
                    label="Carbs"
                    current={macros.carbs.current}
                    max={macros.carbs.max}
                    color="#E53E3E"
                    icon={<Hamburger size={20} color="#E53E3E" weight="regular"/>}
                    onEdit={() => onEditMacro && onEditMacro('carbs')}
                />
                <MacroColumn 
                    label="Fats"
                    current={macros.fats.current}
                    max={macros.fats.max}
                    color="#E59039"
                    icon={<Avocado size={20} color="#ED8936" weight="regular"/>}
                    onEdit={() => onEditMacro && onEditMacro('fats')}
                />
                <MacroColumn 
                    label="Protein"
                    current={macros.protein.current}
                    max={macros.protein.max}
                    color="#3B82F6"
                    icon={<Fish size={20} color="#3182CE" weight="regular"/>}
                    onEdit={() => onEditMacro && onEditMacro('protein')}
                />
            </View>
        </View>
    );
};
export default DailyOverviewCard;