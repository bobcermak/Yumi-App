import { Minus as MinusIcon, PencilSimple, Plus, Star } from "phosphor-react-native";
import { FC } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, FadeInRight, FadeOutRight, useAnimatedStyle, withSpring, LinearTransition,
} from "react-native-reanimated";
import { useResultMeal } from "@/lib/hooks/useResultMeal";

type ResultMealProps = {
    imgSrc: string,
    title: string,
    calories_per_100g: number,
    carbs_per_100g: number,
    protein_per_100g: number,
    fat_per_100g: number,
    rating?: number | null,
    initialGrams?: number,
    initialCount?: number,
    onDataChange?: (data: { grams: number, count: number, calories: number }) => void
}
const ResultMeal: FC<ResultMealProps> = ({ imgSrc, title, calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g, rating, initialGrams = 100, initialCount = 1, onDataChange 
}) => {
    const { state, refs, handlers } = useResultMeal({
        calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g,
        initialGrams, initialCount, onDataChange
    });
    const carbsBarStyle = useAnimatedStyle(() => ({
        width: withSpring(`${state.carbsRatio * 100}%`, { damping: 10, stiffness: 80 }),
    }));
    const fatBarStyle = useAnimatedStyle(() => ({
        width: withSpring(`${state.fatRatio * 100}%`, { damping: 10, stiffness: 80 }),
    }));
    const proteinBarStyle = useAnimatedStyle(() => ({
        width: withSpring(`${state.proteinRatio * 100}%`, { damping: 10, stiffness: 80 }),
    }));
    return (
        <Animated.View 
            entering={FadeInDown.duration(250).springify()}
            layout={LinearTransition.springify().damping(15)}
            className="self-center justify-center items-center gap-6 rounded-[20px] overflow-hidden bg-dark border border-white/10 pb-5 w-[362px]"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            }}>
            {state.editMode === 'count' && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => handlers.setEditMode('none')}
                    className="absolute inset-0 z-10"
                />
            )}
            <Image
                source={imgSrc ? { uri: imgSrc } : require("@/assets/images/not-found-meal.webp")}
                resizeMode="cover"
                className="w-[362px] h-[200px] opacity-80 bg-[#2B2B2B]"
            />
            <View className="absolute top-4 left-4 bg-dark/80 px-2 py-1 rounded-[10px] flex-row items-center gap-1 border border-white/10 z-20">
                <Star size={16} color="#F6E05E" weight="fill" />
                <Text className="text-white font-nunito-700 text-sm">{rating ? rating.toFixed(1) : "0.0"}</Text>
            </View>
            <View className="w-full px-4">
                <View className="gap-1">
                    <View className="flex-row justify-between items-center">
                        <Text className="text-white font-nunito-700 max-w-[220px] text-[25px]" numberOfLines={2}>
                            {title}
                        </Text>
                        <View className="flex-row items-center z-20">
                            {state.editMode === 'count' && (
                                <Animated.View 
                                    entering={FadeInRight.springify()} 
                                    exiting={FadeOutRight.duration(250)}
                                    className="absolute -top-14 right-0 flex-row items-center bg-[#2B2B2B] border border-white/10 rounded-[15px] px-2 gap-1 shadow-xl"
                                >
                                    <TouchableOpacity onPress={handlers.handleDecrementCount} className="p-3">
                                        <MinusIcon size={20} color="white" weight="bold" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={handlers.handleIncrementCount} className="p-3">
                                        <Plus size={20} color="white" weight="bold" />
                                    </TouchableOpacity>
                                </Animated.View>
                            )}
                            <TouchableOpacity
                                onPress={() => handlers.setEditMode(prev => prev === 'count' ? 'none' : 'count')}
                                activeOpacity={0.25}
                                className={`justify-center items-center rounded-[10px] px-4 py-2 border border-white/10  ${state.editMode === 'count' ? 'bg-yellow' : 'bg-[#2B2B2B]'}`}
                            >
                                <Text className={`text-2xl font-nunito-500 pt-2 ${state.editMode === 'count' ? 'text-dark' : 'text-white/50'}`}>x<Text className={`font-nunito-700 text-[28px] ${state.editMode === 'count' ? 'text-dark' : 'text-white'}`}>{state.count}</Text></Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View className="flex-row justify-between items-center">
                        <TouchableOpacity
                            onPress={() => refs.calorieInputRef.current?.focus()}
                            activeOpacity={0.25}
                            className="flex-row items-center gap-4"
                        >
                            <View className="flex-col">
                                <View className="flex-row items-center">
                                    <TextInput
                                        ref={refs.calorieInputRef}
                                        className="text-white font-nunito-700 text-[40px] p-0"
                                        value={state.isCalFocused ? state.calInputVal : state.calories.toString()}
                                        onFocus={handlers.handleCalorieFocus}
                                        onBlur={() => handlers.setIsCalFocused(false)}
                                        onChangeText={handlers.handleCalorieInputChange}
                                        keyboardType="numeric"
                                        maxLength={4}
                                        placeholderTextColor="#FFFFFF50"
                                    />
                                    <Text className="text-white/50 font-nunito-700 text-[32px] ml-2 mt-2">cal</Text>
                                </View>
                                {state.count > 1 && (
                                    <Animated.Text 
                                        layout={LinearTransition.springify()}
                                        className="absolute -bottom-3 text-white/40 font-nunito-600 text-sm ml-1"
                                    >
                                        {state.totalCalories} cal total
                                    </Animated.Text>
                                )}
                            </View>
                            <View className="mt-1">
                                <PencilSimple size={28} color="#FFFFFF80" weight="regular" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => refs.gramsInputRef.current?.focus()}
                            activeOpacity={0.25}
                            className="flex-row items-center gap-2 bg-[#2B2B2B] justify-center rounded-[10px] px-4 py-2 border border-white/10 "
                        >
                            <TextInput
                                ref={refs.gramsInputRef}
                                className="text-white text-xl font-nunito-700 p-0"
                                value={state.isGramsFocused ? state.gramInputVal : state.grams.toString()}
                                onFocus={handlers.handleGramsFocus}
                                onBlur={() => handlers.setIsGramsFocused(false)}
                                onChangeText={handlers.handleGramsInputChange}
                                keyboardType="numeric"
                                maxLength={4}
                                placeholderTextColor="#FFFFFF50"
                            />
                            <Text className="text-white/50 font-nunito-600 text-lg mt-1">g</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity
                activeOpacity={0.25}
                onPress={handlers.handleTogglePercentage}
                className="w-full gap-6"
            >
                <View className="w-full px-4 flex-row gap-[2px]">
                    <Animated.View style={[carbsBarStyle]} className="h-4 rounded-tl-[2px] rounded-bl-[2px] bg-[#E53E3E]" />
                    <Animated.View style={[fatBarStyle]} className="h-4 bg-[#ED8936]" />
                    <Animated.View style={[proteinBarStyle]} className="h-4 rounded-tr-[2px] rounded-br-[2px] bg-[#3182CE]" />
                </View>
                <Animated.View 
                    layout={LinearTransition.springify().damping(12)}
                    className="gap-10 flex-row self-center"
                >
                    <Animated.View entering={FadeInDown.delay(300).springify()} className="gap-2 items-center">
                        <View className="flex-row items-center gap-2">
                            <View className="bg-[#E53E3E] w-3 h-3 rounded-[2px]" />
                            <Text className="font-nunito-600 text-xl text-[#E53E3E]/80">Carbs</Text>
                        </View>
                        <Text className="font-nunito-700 text-xl text-white">{state.carbsDisplay}</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(400).springify()} className="gap-2 items-center">
                        <View className="flex-row items-center gap-2">
                            <View className="bg-[#ED8936] w-3 h-3 rounded-[2px]" />
                            <Text className="font-nunito-600 text-xl text-[#ED8936]/80">Fats</Text>
                        </View>
                        <Text className="font-nunito-700 text-xl text-white">{state.fatDisplay}</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(500).springify()} className="gap-2 items-center">
                        <View className="flex-row items-center gap-2">
                            <View className="bg-[#3182CE] w-3 h-3 rounded-[2px]" />
                            <Text className="font-nunito-600 text-xl text-[#3182CE]/80">Protein</Text>
                        </View>
                        <Text className="font-nunito-700 text-xl text-white">{state.proteinDisplay}</Text>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>
        </Animated.View>
    );
};
export default ResultMeal;