import { getRatingColor } from "@/lib/helpers/mealHelpers";
import { useResultMeal } from "@/lib/hooks/useResultMeal";
import { Minus as MinusIcon, PencilSimple, Plus, Star, Heart } from "phosphor-react-native";
import { type Ref, useImperativeHandle, useEffect, useRef } from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { Easing, withRepeat, cancelAnimation, withSequence, FadeInDown, FadeOutRight, LinearTransition, useAnimatedStyle, useSharedValue, withTiming, FadeInRight } from "react-native-reanimated";

export type ResultMealHandle = {
    focusCalories: () => void;
};
type ResultMealProps = {
    ref?: Ref<ResultMealHandle>,
    id?: string,
    imgSrc: string,
    title: string,
    calories_per_100g: number,
    carbs_per_100g: number,
    protein_per_100g: number,
    fat_per_100g: number,
    rating?: number | null,
    initialGrams?: number,
    initialCount?: number,
    isDrink?: boolean,
    isFavorite?: boolean,
    isFavoriteLoading?: boolean,
    onToggleFavorite?: () => void,
    onDataChange?: (data: { grams: number; count: number; calories: number; waterMl: number }) => void
};
const ResultMeal = ({ ref, id, imgSrc, title, calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g, rating, initialGrams = 100, initialCount = 1, isDrink = false, isFavorite, isFavoriteLoading, onToggleFavorite, onDataChange }: ResultMealProps) => {
    const { state, refs, handlers } = useResultMeal({
        id, calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g,
        initialGrams, initialCount, isFavoriteExternal: isFavorite, onToggleFavoriteExternal: onToggleFavorite, onDataChange
    });
    useImperativeHandle(ref, () => ({
        focusCalories: () => {
            handlers.handleCalorieFocus();
            refs.calorieInputRef.current?.focus();
        }
    }));
    const carbsAnim = useSharedValue(0);
    const fatAnim = useSharedValue(0);
    const proteinAnim = useSharedValue(0);
    const carbsBarStyle = useAnimatedStyle(() => ({ flex: carbsAnim.value }));
    const fatBarStyle = useAnimatedStyle(() => ({ flex: fatAnim.value }));
    const proteinBarStyle = useAnimatedStyle(() => ({ flex: proteinAnim.value }));
    const favPulse = useSharedValue(0.25);
    const favPulseStyle = useAnimatedStyle(() => ({ opacity: favPulse.value }));
    const numOpacity = useSharedValue(1);
    const numOpacityStyle = useAnimatedStyle(() => ({ opacity: numOpacity.value }));
    const isFirstBarRender = useRef(true);
    const isFirstCalChange = useRef(true);
    useEffect(() => {
        if (isFirstBarRender.current) {
            const cfg = { duration: 700, easing: Easing.out(Easing.cubic) };
            carbsAnim.value = withTiming(state.carbsRatio, cfg);
            fatAnim.value = withTiming(state.fatRatio, cfg);
            proteinAnim.value = withTiming(state.proteinRatio, cfg);
            isFirstBarRender.current = false;
        }
    }, [state.carbsRatio, state.fatRatio, state.proteinRatio]);
    useEffect(() => {
        if (isFirstCalChange.current) { isFirstCalChange.current = false; return; }
        if (!state.isCalFocused) {
            numOpacity.value = withSequence(
                withTiming(0.35, { duration: 100 }),
                withTiming(1, { duration: 220 })
            );
        }
    }, [state.calories]);
    useEffect(() => {
        if (isFavoriteLoading) {
            favPulse.value = withRepeat(withTiming(0.8, { duration: 600 }), -1, true);
        } else {
            cancelAnimation(favPulse);
            favPulse.value = 0.25;
        }
    }, [isFavoriteLoading]);
    return (
        <Animated.View
            className="self-center justify-center items-center gap-6 rounded-[20px] overflow-hidden bg-dark border border-white/10 pb-5 w-[362px]"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
            }}>
            {state.editMode === 'count' && (
                <TouchableOpacity
                    activeOpacity={0.25}
                    onPress={() => handlers.setEditMode('none')}
                    className="absolute inset-0 z-10"
                />
            )}
            <Image
                key={imgSrc || "fallback"}
                source={imgSrc ? { uri: imgSrc } : require("@/assets/images/not-found-meal.webp")}
                resizeMode="cover"
                className="w-[362px] h-[200px] opacity-80 bg-[#2B2B2B]"
            />
            <View className="absolute top-4 left-4 px-2 py-1 rounded-[10px] flex-row items-center border border-white/10 z-20 gap-1" style={{ backgroundColor: getRatingColor(rating) }}>
                <Star size={20} color="#1D1D1D" weight="regular"/>
                <Text className="text-dark font-nunito-700 text-base">{rating ? rating.toFixed(1) : "0.0"}</Text>
            </View>
            <TouchableOpacity
                onPress={handlers.handleToggleFavorite}
                activeOpacity={0.25}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/40 border border-white/10 z-20"
                disabled={isFavoriteLoading}
            >
                {isFavoriteLoading ? (
                    <Animated.View style={favPulseStyle} className="w-6 h-6 rounded-full bg-white/40" />
                ) : (
                    <Heart
                        size={24}
                        color={state.isFavorite ? "#C5E384" : "white"}
                        weight={state.isFavorite ? "fill" : "regular"}
                    />
                )}
            </TouchableOpacity>
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
                        {isDrink ? (
                            <TouchableOpacity
                                onPress={() => refs.gramsInputRef.current?.focus()}
                                activeOpacity={0.25}
                                className="flex-row items-center gap-2"
                            >
                                <Animated.View style={numOpacityStyle} className="flex-row items-center">
                                    <TextInput
                                        ref={refs.gramsInputRef}
                                        className="text-white font-nunito-700 text-[40px] p-0"
                                        value={state.isGramsFocused
                                            ? state.gramInputVal
                                            : state.grams >= 1000
                                                ? (state.grams / 1000).toFixed(1).replace(/\.0$/, "")
                                                : state.grams.toString()
                                        }
                                        onFocus={handlers.handleGramsFocus}
                                        onBlur={() => handlers.setIsGramsFocused(false)}
                                        onChangeText={handlers.handleGramsInputChange}
                                        keyboardType="numeric"
                                        maxLength={5}
                                        placeholderTextColor="#FFFFFF50"
                                    />
                                    <Text className="text-white/50 font-nunito-700 text-[32px] ml-2 mt-2">
                                        {state.grams >= 1000 && !state.isGramsFocused ? "L" : "ml"}
                                    </Text>
                                </Animated.View>
                                <View className="mt-1">
                                    <PencilSimple size={28} color="#FFFFFF80" weight="regular" />
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                onPress={() => refs.calorieInputRef.current?.focus()}
                                activeOpacity={0.25}
                                className="flex-row items-center gap-4"
                            >
                                <Animated.View style={numOpacityStyle} className="flex-col">
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
                                </Animated.View>
                                <View className="mt-1">
                                    <PencilSimple size={28} color="#FFFFFF80" weight="regular" />
                                </View>
                            </TouchableOpacity>
                        )}
                        {!isDrink && (
                            <TouchableOpacity
                                onPress={() => refs.gramsInputRef.current?.focus()}
                                activeOpacity={0.25}
                                className="flex-row items-center gap-2 bg-[#2B2B2B] justify-center rounded-[10px] px-4 py-2 border border-white/10"
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
                        )}
                    </View>
                </View>
            </View>
            <TouchableOpacity
                activeOpacity={0.25}
                onPress={handlers.handleTogglePercentage}
                className="w-full gap-6"
            >
                <View className="w-full px-4 flex-row gap-[1px]">
                    <Animated.View style={carbsBarStyle} className="h-4 rounded-tl-[2px] rounded-bl-[2px] bg-[#E53E3E]" />
                    <Animated.View style={fatBarStyle} className="h-4 bg-[#ED8936]" />
                    <Animated.View style={proteinBarStyle} className="h-4 rounded-tr-[2px] rounded-br-[2px] bg-[#3182CE]" />
                </View>
                <View className="gap-10 flex-row self-center">
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
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};
export default ResultMeal;