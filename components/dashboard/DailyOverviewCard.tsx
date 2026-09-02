import { format } from "date-fns";
import { Avocado, Fish, Hamburger, PencilSimple } from "phosphor-react-native";
import { memo, useEffect, useState, type FC } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from "react-native-reanimated";
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
    const anim0 = useSharedValue(0);
    const anim1 = useSharedValue(0);
    const anim2 = useSharedValue(0);
    const anim3 = useSharedValue(0);
    const anim4 = useSharedValue(0);
    const anim5 = useSharedValue(0);

    useEffect(() => {
        const anims = [anim0, anim1, anim2, anim3, anim4, anim5];
        anims.forEach((val, i) => {
            val.value = 0;
            val.value = withDelay(i * 100, withTiming(1, { duration: 400 }));
        });
    }, []);
    const style0 = useAnimatedStyle(() => ({ opacity: anim0.value, transform: [{ translateY: (1 - anim0.value) * 10 }] }));
    const style1 = useAnimatedStyle(() => ({ opacity: anim1.value, transform: [{ translateY: (1 - anim1.value) * 10 }] }));
    const style2 = useAnimatedStyle(() => ({ opacity: anim2.value, transform: [{ translateY: (1 - anim2.value) * 10 }] }));
    const style3 = useAnimatedStyle(() => ({ opacity: anim3.value, transform: [{ translateY: (1 - anim3.value) * 10 }] }));
    const style4 = useAnimatedStyle(() => ({ opacity: anim4.value, transform: [{ translateY: (1 - anim4.value) * 10 }] }));
    const style5 = useAnimatedStyle(() => ({ opacity: anim5.value, transform: [{ translateY: (1 - anim5.value) * 10 }] }));
    const animStyles = [style0, style1, style2, style3, style4, style5];
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
    const calFontSize = calories.current.toString().length >= 6 ? 36
        : calories.current.toString().length === 5 ? 46
        : 61;
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
            <Animated.Text style={animStyles[0]} className="text-white text-lg font-nunito-700 -mb-2">
                <Text className="text-yellow">{format(date, "dd")} </Text>
                {format(date, "MMMM, EEEE")}
            </Animated.Text>
            <View className="flex-row justify-between items-center">
                <Animated.View style={animStyles[1]}>
                    <Text className="text-white font-nunito-700 pt-2" style={{ fontSize: calFontSize, lineHeight: calFontSize * 1.1 }}>
                        {calories.current}
                    </Text>
                    <TouchableOpacity
                        className="flex-row items-center gap-2 -mt-3"
                        onPress={() => setIsEditingCalories(true)}
                        activeOpacity={0.25}
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
                </Animated.View>
                <Animated.View style={animStyles[1]}>
                    <MemoizedCircularProgress value={calories.current} max={calories.max} />
                </Animated.View>
            </View>
            <Animated.Text style={animStyles[2]} className="text-white/80 text-xl font-nunito-600 mt-2">
                Macronutrients
            </Animated.Text>
            <View className="flex-row justify-between gap-6 mt-2">
                <Animated.View style={animStyles[3]} className="flex-1">
                    <MemoizedMacroColumn
                        label="Carbs"
                        current={macros.carbs.current}
                        max={macros.carbs.max}
                        color="#E53E3E"
                        icon={<Hamburger size={20} color="#E53E3E" weight="regular" />}
                    />
                </Animated.View>
                <Animated.View style={animStyles[4]} className="flex-1">
                    <MemoizedMacroColumn
                        label="Fats"
                        current={macros.fats.current}
                        max={macros.fats.max}
                        color="#E59039"
                        icon={<Avocado size={20} color="#ED8936" weight="regular" />}
                    />
                </Animated.View>
                <Animated.View style={animStyles[5]} className="flex-1">
                    <MemoizedMacroColumn
                        label="Protein"
                        current={macros.protein.current}
                        max={macros.protein.max}
                        color="#3B82F6"
                        icon={<Fish size={20} color="#3182CE" weight="regular" />}
                    />
                </Animated.View>
            </View>
        </View>
    );
};
export default DailyOverviewCard;