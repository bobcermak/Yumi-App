import { format } from "date-fns";
import { Avocado, Fish, Hamburger, PencilSimple } from "phosphor-react-native";
import { memo, useEffect, useState, type FC } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import CircularProgress from "./CircularProgress";
import MacroColumn from "./MacroColumn";

const MemoizedCircularProgress = memo(CircularProgress);
const MemoizedMacroColumn = memo(MacroColumn);
type DailyOverviewCardProps = {
    date: Date;
    calories: { current: number; max: number };
    macros: {
        carbs: { current: number; max: number };
        fats: { current: number; max: number };
        protein: { current: number; max: number };
    };
    onUpdateCaloriesMax?: (max: number) => void;
};
const DailyOverviewCard: FC<DailyOverviewCardProps> = ({ date, calories, macros, onUpdateCaloriesMax }) => {
    //Hooks
    const [isEditingCalories, setIsEditingCalories] = useState<boolean>(false);
    const [editCalMax, setEditCalMax] = useState<string>(calories.max.toString());

    //Functions
    const handleSaveCalories = () => {
        setIsEditingCalories(false);
        let parsed = parseInt(editCalMax, 10);
        if (!isNaN(parsed)) {
            parsed = Math.min(8000, Math.max(parsed, 600));
            setEditCalMax(parsed.toString());
            if (onUpdateCaloriesMax) {
                onUpdateCaloriesMax(parsed);
            }
        } else {
            setEditCalMax(calories.max.toString());
        }
    };

    useEffect(() => {
        setEditCalMax(calories.max.toString());
    }, [calories.max]);

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
                    <TouchableOpacity
                        className="flex-row items-center gap-2 -mt-3"
                        onPress={() => setIsEditingCalories(true)}
                        activeOpacity={0.8}
                    >
                        <View className="flex-row items-center">
                            {isEditingCalories ? (
                                <>
                                    <Text className="text-white/50 text-xl font-nunito-700">of </Text>
                                    <TextInput
                                        defaultValue={editCalMax}
                                        onChangeText={setEditCalMax}
                                        keyboardType="number-pad"
                                        className="text-white/50 text-xl font-nunito-700 p-0 m-0 text-center"
                                        style={{ includeFontPadding: false, padding: 0, margin: 0, minWidth: 40 }}
                                        autoFocus
                                        onBlur={handleSaveCalories}
                                        onSubmitEditing={handleSaveCalories}
                                        selectTextOnFocus
                                        contextMenuHidden={true}
                                        autoCorrect={false}
                                        spellCheck={false}
                                        maxLength={4}
                                    />
                                    <Text className="text-white/50 text-xl font-nunito-700"> cal</Text>
                                </>
                            ) : (
                                <Text className="text-white/50 text-xl font-nunito-700">
                                    of {calories.max} cal
                                </Text>
                            )}
                        </View>

                        {onUpdateCaloriesMax && (
                            <PencilSimple
                                size={18}
                                color="#FFFFFF80"
                                weight="regular"
                                style={{ opacity: isEditingCalories ? 0 : 1 }}
                            />
                        )}
                    </TouchableOpacity>
                </View>
                <MemoizedCircularProgress value={calories.current} max={calories.max} />
            </View>
            <Text className="text-white/80 text-xl font-nunito-600">
                Macronutrients
            </Text>
            <View className="flex-row justify-between gap-6 mt-2">
                <MemoizedMacroColumn
                    label="Carbs"
                    current={macros.carbs.current}
                    max={macros.carbs.max}
                    color="#E53E3E"
                    icon={<Hamburger size={20} color="#E53E3E" weight="regular" />}
                />
                <MemoizedMacroColumn
                    label="Fats"
                    current={macros.fats.current}
                    max={macros.fats.max}
                    color="#E59039"
                    icon={<Avocado size={20} color="#ED8936" weight="regular" />}
                />
                <MemoizedMacroColumn
                    label="Protein"
                    current={macros.protein.current}
                    max={macros.protein.max}
                    color="#3B82F6"
                    icon={<Fish size={20} color="#3182CE" weight="regular" />}
                />
            </View>
        </View>
    );
};
export default DailyOverviewCard;