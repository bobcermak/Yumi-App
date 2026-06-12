import { AddMoreModal, Button, Icon } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { createCustomFood, deleteCustomFood, updateCustomFood } from "@/lib/services/supabase/queries/foods";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Barcode, CaretLeft, CheckCircle, CookingPot, MagnifyingGlass, Sparkle, Trash } from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const YELLOW = "#C5E384";
type Ingredient = {
    food: FoodSearchResult,
    weight: string,
    key: number
};
type CreatedMeal = {
    id: string,
    name: string,
    cal: number,
    protein: number,
    carbs: number,
    fat: number
};
const CreateMeal = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { editId, editName, editCal, editProtein, editCarbs, editFat, isCustom: isCustomParam, mealType: editMealType, logDate: editLogDate } = useLocalSearchParams<{
        editId?: string;
        editName?: string;
        editCal?: string;
        editProtein?: string;
        editCarbs?: string;
        editFat?: string;
        isCustom?: string;
        mealType?: string;
        logDate?: string;
    }>();
    const isEditMode = !!editId;
    const isCustomMeal = isCustomParam === "true";
    //Contexts
    const { userProfile } = useAuth();
    const { showToast } = useIndexContext();
    //Hooks
    const [name, setName] = useState<string>(editName ?? "");
    const [manualCal, setManualCal] = useState<string>(editCal ?? "");
    const [manualCarbs, setManualCarbs] = useState<string>(editCarbs ?? "");
    const [manualFat, setManualFat] = useState<string>(editFat ?? "");
    const [manualProtein, setManualProtein] = useState<string>(editProtein ?? "");
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [createdMeal, setCreatedMeal] = useState<CreatedMeal | null>(null);
    const scrollRef = useRef<ScrollView>(null);

    const hasIngredients = ingredients.length > 0 && !isEditMode;
    const hasChanged = useMemo(() => {
        if (!isEditMode) return false;
        return (
            name.trim() !== (editName ?? "").trim() ||
            manualCal !== (editCal ?? "") ||
            manualCarbs !== (editCarbs ?? "") ||
            manualFat !== (editFat ?? "") ||
            manualProtein !== (editProtein ?? "")
        );
    }, [isEditMode, name, manualCal, manualCarbs, manualFat, manualProtein, editName, editCal, editCarbs, editFat, editProtein]);
    const computed = useMemo(() => {
        if (!hasIngredients) return null;
        const totalW = ingredients.reduce((s, i) => s + (parseFloat(i.weight) || 100), 0);
        if (totalW === 0) return null;
        const sum = (key: keyof FoodSearchResult) =>
            ingredients.reduce((s, i) => s + ((i.food[key] as number) || 0) * (parseFloat(i.weight) || 100) / 100, 0);
        return {
            cal:     Math.round(sum("calories_per_100g") / totalW * 100),
            carbs:   Math.round(sum("carbs_per_100g")    / totalW * 100),
            fat:     Math.round(sum("fat_per_100g")      / totalW * 100),
            protein: Math.round(sum("protein_per_100g")  / totalW * 100),
        };
    }, [ingredients]);
    const cal100     = hasIngredients ? String(computed?.cal     ?? 0) : manualCal;
    const carbs100   = hasIngredients ? String(computed?.carbs   ?? 0) : manualCarbs;
    const fat100     = hasIngredients ? String(computed?.fat     ?? 0) : manualFat;
    const protein100 = hasIngredients ? String(computed?.protein ?? 0) : manualProtein;
    const canSave    = name.trim().length >= 2 && (hasIngredients || parseFloat(manualCal) > 0);
    const addIngredient = (food: FoodSearchResult) => {
        setIngredients(prev => [...prev, { food, weight: "100", key: Date.now() }]);
    };
    const handleSave = async () => {
        if (!userProfile?.id || !canSave) return;
        setIsSaving(true);
        try {
            const { id } = await createCustomFood(userProfile.id, {
                name:              name.trim(),
                calories_per_100g: parseFloat(cal100)     || 0,
                protein_per_100g:  parseFloat(protein100) || 0,
                fat_per_100g:      parseFloat(fat100)     || 0,
                carbs_per_100g:    parseFloat(carbs100)   || 0,
            }, null);
            setCreatedMeal({
                id,
                name:    name.trim(),
                cal:     parseFloat(cal100)     || 0,
                protein: parseFloat(protein100) || 0,
                carbs:   parseFloat(carbs100)   || 0,
                fat:     parseFloat(fat100)     || 0,
            });
        } catch {
            showToast("Failed to create meal", undefined, "error");
        } finally {
            setIsSaving(false);
        }
    };
    const handleDelete = async () => {
        if (!userProfile?.id || !editId) return;
        setIsSaving(true);
        try {
            await deleteCustomFood(userProfile.id, editId);
            router.back();
        } catch {
            showToast("Failed to delete meal", undefined, "error");
        } finally {
            setIsSaving(false);
        }
    };
    const handleUpdate = async () => {
        if (!userProfile?.id || !editId || !canSave) return;
        setIsSaving(true);
        try {
            await updateCustomFood(userProfile.id, editId, {
                name: name.trim(),
                calories_per_100g: parseFloat(cal100) || 0,
                protein_per_100g: parseFloat(protein100) || 0,
                fat_per_100g: parseFloat(fat100) || 0,
                carbs_per_100g: parseFloat(carbs100) || 0,
            });
            showToast("Meal updated!", undefined, "success");
            router.back();
        } catch {
            showToast("Failed to update meal", undefined, "error");
        } finally {
            setIsSaving(false);
        }
    };
    const handleRecord = () => {
        const id = editId!;
        router.push({
            pathname: "/search-item/[id]",
            params: {
                id,
                item: JSON.stringify({
                    id,
                    name: name.trim(),
                    calories_per_100g: parseFloat(cal100) || 0,
                    protein_per_100g: parseFloat(protein100) || 0,
                    carbs_per_100g: parseFloat(carbs100) || 0,
                    fat_per_100g: parseFloat(fat100) || 0,
                    source: "usda",
                }),
                ...(editMealType ? { mealType: editMealType } : {}),
                ...(editLogDate ? { logDate: editLogDate } : {}),
            },
        });
    };
    return (
        <View className="flex-1 bg-black">
                <View
                    className="items-center pb-12"
                    style={{ backgroundColor: "rgba(197,227,132,0.82)", paddingTop: insets.top + 12 }}
                >
                    <View className="absolute left-4" style={{ top: insets.top + 12 }}>
                        <Icon onPress={() => router.back()} className="bg-dark w-12 h-12">
                            <CaretLeft size={24} color="white" weight="regular" />
                        </Icon>
                    </View>
                    <View className="mt-5 mb-[14px] w-20 h-20 rounded-full bg-black/10 items-center justify-center">
                        <CookingPot size={44} color="#1D1D1D" weight="duotone" />
                    </View>
                    <Text className="text-dark font-nunito-800 text-[28px]" style={{ letterSpacing: -0.3 }}>
                        {isEditMode ? "Edit Meal" : "New Custom Meal"}
                    </Text>
                    <Text className="text-dark/50 font-nunito-600 text-sm mt-1">
                        {isEditMode ? "Update or record this meal" : "Fill in the details below"}
                    </Text>
                </View>
                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    className="flex-1 bg-black rounded-t-[28px]"
                    style={{ marginTop: -28 }}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 28, paddingBottom: insets.bottom + 110 }}
                >
                    <View
                        className="bg-[#1E1E1E] rounded-[18px] mb-5"
                        style={{
                            borderWidth: 1.5,
                            borderColor: name.length > 0 ? "rgba(197,227,132,0.45)" : "rgba(255,255,255,0.07)",
                            shadowColor: name.length > 0 ? YELLOW : "transparent",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.12,
                            shadowRadius: 8,
                        }}
                    >
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Name of my meal…"
                            placeholderTextColor="rgba(255,255,255,0.2)"
                            className="text-white font-nunito-700 text-lg py-4 px-5"
                            maxLength={60}
                        />
                    </View>
                    {!isEditMode && <View className="mb-5">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="title">Ingredients</Text>
                            {hasIngredients && (
                                <Text className="text-yellow font-nunito-700 text-xs">{ingredients.length} added</Text>
                            )}
                        </View>
                        <View className="flex-row gap-2 mb-2">
                            {([
                                { Ic: MagnifyingGlass, label: "Search",     onPress: () => setShowSearchModal(true) },
                                { Ic: Sparkle,         label: "Magic Scan", onPress: () => router.push({ pathname: "/magic-scan" }) },
                                { Ic: Barcode,         label: "Barcode",    onPress: () => router.push({ pathname: "/magic-scan", params: { cameraMode: "barcode" } }) },
                            ] as const).map(({ Ic, label, onPress }) => (
                                <TouchableOpacity
                                    key={label}
                                    activeOpacity={0.7}
                                    onPress={onPress}
                                    className="flex-1 flex-row items-center justify-center gap-[5px] py-[13px] bg-[#1E1E1E] rounded-[14px] border border-white/10"
                                >
                                    <Ic size={16} color="rgba(255,255,255,0.4)" weight="regular" />
                                    <Text className="text-white/40 font-nunito-700 text-xs">{label}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                        {hasIngredients && (
                            <Animated.View layout={LinearTransition.springify().damping(20)} className="gap-2">
                                {ingredients.map(ing => (
                                    <Animated.View
                                        key={ing.key}
                                        entering={FadeInDown.duration(200).springify()}
                                        exiting={FadeOut.duration(150)}
                                        className="flex-row items-center bg-[#1E1E1E] border border-white/10 rounded-[14px] p-[10px] gap-[10px]"
                                    >
                                        <Image
                                            source={ing.food.image_url ? { uri: ing.food.image_url } : require("@/assets/images/not-found-meal.webp")}
                                            className="w-[38px] h-[38px] rounded-[10px]"
                                            resizeMode="cover"
                                        />
                                        <Text className="flex-1 text-white font-nunito-700 text-sm" numberOfLines={1}>
                                            {ing.food.name}
                                        </Text>
                                        <View className="flex-row items-center bg-white/[7] rounded-[10px] px-[10px] py-[6px] gap-[3px]">
                                            <TextInput
                                                value={ing.weight}
                                                onChangeText={v => setIngredients(prev => prev.map(i => i.key === ing.key ? { ...i, weight: v.replace(/[^0-9]/g, "") } : i))}
                                                keyboardType="numeric"
                                                maxLength={4}
                                                className="text-white font-nunito-500 text-sm min-w-[32px] text-right"
                                                style={{ padding: 0 }}
                                            />
                                            <Text className="text-white/35 font-nunito-600 text-xs">g</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setIngredients(prev => prev.filter(i => i.key !== ing.key))}
                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        >
                                            <Trash size={17} color="#CA877E" weight="regular" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}
                    </View>}
                    <View>
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="title">Nutrition</Text>
                            <Text className="text-white/25 font-nunito-600 text-xs">
                                {hasIngredients ? "auto · " : ""}per 100g
                            </Text>
                        </View>
                        <View className="bg-[#1E1E1E] flex-row rounded-[18px] border border-white/10 items-center justify-center py-5 mb-2 gap-2">
                            <Text className="text-yellow font-nunito-800 text-4xl mt-4">
                                {cal100 || "0"}
                            </Text>
                            <Text className="text-white/40 font-nunito-600 text-sm mt-4">cal</Text>
                        </View>
                        <View className="bg-[#1E1E1E] rounded-[18px] border border-white/10 px-4 py-5">
                            <View className="flex-row justify-around">
                                {([
                                    { label: "Carbs",   value: carbs100,   setter: setManualCarbs,   color: "#E53E3E" },
                                    { label: "Fat",     value: fat100,     setter: setManualFat,     color: "#ED8936" },
                                    { label: "Protein", value: protein100, setter: setManualProtein, color: "#3182CE" },
                                ] as const).map(({ label, value, setter, color }) => (
                                    <View key={label} className="items-center gap-2">
                                        <View className="flex-row items-center gap-[6px]">
                                            <View className="w-3 h-3 rounded-[2px]" style={{ backgroundColor: color }} />
                                            <Text className="font-nunito-600 text-base" style={{ color: color + "CC" }}>{label}</Text>
                                        </View>
                                        {hasIngredients ? (
                                            <Text className="font-nunito-700 text-xl text-white">
                                                {value}<Text className="text-white/40 font-nunito-600 text-sm">g</Text>
                                            </Text>
                                        ) : (
                                            <View className="flex-row items-baseline gap-[3px]">
                                                <TextInput
                                                    value={value}
                                                    onChangeText={setter}
                                                    keyboardType="numeric"
                                                    placeholder="0"
                                                    placeholderTextColor="rgba(255,255,255,0.15)"
                                                    maxLength={5}
                                                    className="text-white font-nunito-700 text-xl min-w-[36px] text-center"
                                                    style={{ padding: 0 }}
                                                />
                                                <Text className="text-white/40 font-nunito-600 text-sm">g</Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View
                    className="absolute left-4 right-4"
                    style={{ bottom: insets.bottom + 12 }}
                >
                    {isEditMode ? (
                        <>
                            <Button
                                className="rounded-[30px] mx-0 w-full py-5 mb-3"
                                textClassName="text-xl"
                                onPress={handleRecord}
                                disabled={isSaving}
                            >
                                Record
                            </Button>
                            <View className="flex-row gap-3">
                                {isCustomMeal && (
                                    <Button
                                        className="flex-1 rounded-[20px] py-4 bg-[#2A1A1A]"
                                        textClassName="text-base text-[#CA877E]"
                                        shadowColor="#CA877E"
                                        onPress={handleDelete}
                                        disabled={isSaving}
                                    >
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    className={`${isCustomMeal ? "flex-1" : "w-full"} rounded-[20px] py-4 bg-[#1E1E1E]`}
                                    textClassName={`text-base ${hasChanged ? "text-yellow" : "text-white/30"}`}
                                    shadowColor={hasChanged ? "#C5E384" : "transparent"}
                                    onPress={handleUpdate}
                                    disabled={!hasChanged || isSaving || !canSave}
                                >
                                    {isSaving ? "Saving…" : "Update"}
                                </Button>
                            </View>
                        </>
                    ) : (
                        <Button
                            className="rounded-[30px] mx-0 w-full py-5"
                            textClassName="text-xl"
                            onPress={handleSave}
                            disabled={!canSave || isSaving}
                        >
                            {isSaving ? "Saving…" : "Save Meal"}
                        </Button>
                    )}
                </View>
                <AddMoreModal
                    visible={showSearchModal}
                    onClose={() => setShowSearchModal(false)}
                    mealType="Breakfast"
                    onIngredientSelect={addIngredient}
                />
                {createdMeal && (
                    <Animated.View
                        entering={FadeIn.duration(250)}
                        className="absolute inset-0 bg-black/75 items-center justify-center px-6"
                    >
                        <Animated.View
                            entering={FadeInDown.duration(350).springify().damping(18)}
                            className="w-full bg-[#1A1A1A] rounded-[28px] p-7 border border-white/[8] items-center"
                        >
                            <View className="w-[72px] h-[72px] rounded-full bg-yellow/[12] items-center justify-center mb-4">
                                <CheckCircle size={40} color={YELLOW} weight="duotone" />
                            </View>

                            <Text className="text-white font-nunito-800 text-2xl mb-[6px] text-center">
                                Meal Created!
                            </Text>
                            <Text className="text-yellow font-nunito-700 text-base mb-1 text-center" numberOfLines={1}>
                                {createdMeal.name}
                            </Text>
                            <Text className="text-white/35 font-nunito-600 text-[13px] mb-7 text-center">
                                {createdMeal.cal} cal · {createdMeal.protein}g protein · {createdMeal.carbs}g carbs · {createdMeal.fat}g fat
                            </Text>
                            <Button
                                className="rounded-[30px] mx-0 w-full py-5 mb-3"
                                textClassName="text-xl"
                                onPress={() => {
                                    router.replace({
                                        pathname: "/search-item/[id]",
                                        params: {
                                            id: createdMeal.id,
                                            item: JSON.stringify({
                                                id: createdMeal.id,
                                                name: createdMeal.name,
                                                calories_per_100g: createdMeal.cal,
                                                protein_per_100g:  createdMeal.protein,
                                                carbs_per_100g:    createdMeal.carbs,
                                                fat_per_100g:      createdMeal.fat,
                                                source: "usda",
                                            }),
                                        },
                                    });
                                }}
                            >
                                Record it
                            </Button>
                            <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} className="py-[10px]">
                                <Text className="text-white/40 font-nunito-700 text-[15px]">
                                    Skip for now
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </Animated.View>
                )}
        </View>
    );
};
export default CreateMeal;