import { AddMoreModal, Button, PressableScale } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { createCustomFood, deleteCustomFood, updateCustomFood } from "@/lib/services/supabase/queries/foods";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Barcode, CaretLeft, CaretRight, CheckCircle, MagnifyingGlass, Sparkle, Trash } from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition, ReduceMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#C5E384";
const CLAY = "#CA877E";
const SURFACE = "#181818";
const BORDER = "rgba(255,255,255,0.07)";
const HAIRLINE = "rgba(255,255,255,0.055)";
const PAGE = "#121212";
const CARBS = "#E53E3E";
const FAT = "#ED8936";
const PROTEIN = "#3182CE";
const card = {
    backgroundColor: SURFACE,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BORDER
} as const;
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
    const macroSplit = useMemo(() => {
        const carbs = parseFloat(carbs100) || 0;
        const fat = parseFloat(fat100) || 0;
        const protein = parseFloat(protein100) || 0;
        const total = carbs + fat + protein;
        if (total <= 0) return null;
        return { carbs: carbs / total, fat: fat / total, protein: protein / total };
    }, [carbs100, fat100, protein100]);
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
            showToast("Meal updated", undefined, "success");
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
    const macros = [
        { label: "Carbs",   value: carbs100,   setter: setManualCarbs,   color: CARBS },
        { label: "Fat",     value: fat100,     setter: setManualFat,     color: FAT },
        { label: "Protein", value: protein100, setter: setManualProtein, color: PROTEIN },
    ] as const;
    return (
        /* No background of its own — the app-wide green blur in AnimatedBackground
           shows through, the same way it does on every other screen. */
        <View className="flex-1">
            <View style={{ paddingTop: insets.top + 8 }} className="px-5">
                <PressableScale
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: SURFACE, borderWidth: 1, borderColor: BORDER }}
                >
                    <CaretLeft size={19} color="rgba(255,255,255,0.75)" weight="bold" />
                </PressableScale>

                <Animated.View
                    entering={FadeInDown.duration(260).reduceMotion(ReduceMotion.System)}
                    className="mt-5 mb-1"
                >
                    <Text
                        className="text-white font-nunito-800"
                        style={{ fontSize: 30, lineHeight: 36, letterSpacing: -0.8 }}
                    >
                        {isEditMode ? "Edit meal" : "New meal"}
                    </Text>
                    <Text className="text-white/30 font-nunito-600 text-sm mt-1">
                        {isEditMode ? "Update it, record it, or remove it" : "Build it from ingredients or type the numbers"}
                    </Text>
                </Animated.View>
            </View>

            <ScrollView
                ref={scrollRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                className="flex-1"
                contentContainerStyle={{
                    paddingHorizontal: 20,
                    paddingTop: 24,
                    paddingBottom: insets.bottom + (isEditMode ? 190 : 130)
                }}
            >
                {/* ── NAME ── */}
                <Animated.View
                    entering={FadeInDown.duration(260).delay(50).reduceMotion(ReduceMotion.System)}
                    className="mb-9"
                >
                    <View className="flex-row items-baseline justify-between mb-2">
                        <Text className="text-white/35 font-nunito-600 text-xs">Name</Text>
                        {name.length > 0 && (
                            <Text
                                className="text-white/20 font-nunito-600 text-[11px]"
                                style={{ fontVariant: ["tabular-nums"] }}
                            >
                                {name.length}/60
                            </Text>
                        )}
                    </View>
                    <TextInput
                        value={name}
                        onChangeText={setName}
                        placeholder="Sunday lasagne"
                        placeholderTextColor="rgba(255,255,255,0.17)"
                        className="text-white font-nunito-800 pb-2.5"
                        style={{ fontSize: 22, letterSpacing: -0.4, padding: 0, paddingBottom: 10 }}
                        maxLength={60}
                    />
                    {/* The rule under the field carries the state — no glowing box needed. */}
                    <View
                        style={{
                            height: 1.5,
                            borderRadius: 2,
                            backgroundColor: name.length > 0 ? "rgba(197,227,132,0.6)" : "rgba(255,255,255,0.09)"
                        }}
                    />
                </Animated.View>

                {/* ── INGREDIENTS ── */}
                {!isEditMode && (
                    <Animated.View
                        entering={FadeInDown.duration(260).delay(100).reduceMotion(ReduceMotion.System)}
                        className="mb-9"
                    >
                        <View className="flex-row items-baseline justify-between mb-3.5">
                            <Text className="text-white font-nunito-800" style={{ fontSize: 17, letterSpacing: -0.2 }}>
                                Ingredients
                            </Text>
                            <Text className="text-white/25 font-nunito-600 text-xs">
                                {hasIngredients ? `${ingredients.length} added` : "optional"}
                            </Text>
                        </View>

                        {/* One primary way in, two shortcuts under it — not three identical tiles. */}
                        <PressableScale
                            onPress={() => setShowSearchModal(true)}
                            className="flex-row items-center px-3.5 mb-2.5"
                            style={[card, { height: 60 }]}
                        >
                            <View
                                className="w-9 h-9 rounded-xl items-center justify-center"
                                style={{ backgroundColor: "rgba(197,227,132,0.12)" }}
                            >
                                <MagnifyingGlass size={17} color={ACCENT} weight="bold" />
                            </View>
                            <Text className="flex-1 text-white/85 font-nunito-700 text-[15px] ml-3">
                                Search foods
                            </Text>
                            <CaretRight size={15} color="rgba(255,255,255,0.2)" weight="bold" />
                        </PressableScale>

                        <View className="flex-row gap-2.5">
                            {([
                                { Ic: Sparkle, label: "Magic scan", onPress: () => router.push({ pathname: "/magic-scan" }) },
                                { Ic: Barcode, label: "Barcode",    onPress: () => router.push({ pathname: "/magic-scan", params: { cameraMode: "barcode" } }) },
                            ] as const).map(({ Ic, label, onPress }) => (
                                <PressableScale
                                    key={label}
                                    onPress={onPress}
                                    className="flex-1 flex-row items-center justify-center gap-2"
                                    style={[card, { height: 48, borderRadius: 16 }]}
                                >
                                    <Ic size={15} color="rgba(255,255,255,0.45)" weight="regular" />
                                    <Text className="text-white/45 font-nunito-700 text-[13px]">{label}</Text>
                                </PressableScale>
                            ))}
                        </View>

                        {hasIngredients && (
                            <Animated.View
                                layout={LinearTransition.springify().damping(20)}
                                className="mt-2.5 overflow-hidden"
                                style={card}
                            >
                                {ingredients.map((ing, index) => (
                                    <Animated.View
                                        key={ing.key}
                                        entering={FadeInDown.duration(200).springify().reduceMotion(ReduceMotion.System)}
                                        exiting={FadeOut.duration(150)}
                                        className="flex-row items-center px-3 py-3 gap-3"
                                        style={index > 0 ? { borderTopWidth: 1, borderTopColor: HAIRLINE } : undefined}
                                    >
                                        <Image
                                            source={ing.food.image_url ? { uri: ing.food.image_url } : require("@/assets/images/not-found-meal.webp")}
                                            className="w-10 h-10 rounded-xl"
                                            resizeMode="cover"
                                        />
                                        <Text className="flex-1 text-white/90 font-nunito-700 text-sm" numberOfLines={1}>
                                            {ing.food.name}
                                        </Text>
                                        <View
                                            className="flex-row items-center rounded-xl px-2.5 py-1.5 gap-1"
                                            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                                        >
                                            <TextInput
                                                value={ing.weight}
                                                onChangeText={v => setIngredients(prev => prev.map(i => i.key === ing.key ? { ...i, weight: v.replace(/[^0-9]/g, "") } : i))}
                                                keyboardType="numeric"
                                                maxLength={4}
                                                className="text-white font-nunito-700 text-sm min-w-[30px] text-right"
                                                style={{ padding: 0, fontVariant: ["tabular-nums"] }}
                                            />
                                            <Text className="text-white/30 font-nunito-600 text-xs">g</Text>
                                        </View>
                                        <TouchableOpacity
                                            onPress={() => setIngredients(prev => prev.filter(i => i.key !== ing.key))}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            activeOpacity={0.5}
                                        >
                                            <Trash size={16} color={CLAY} weight="regular" />
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </Animated.View>
                        )}
                    </Animated.View>
                )}

                {/* ── NUTRITION ── */}
                <Animated.View entering={FadeInDown.duration(260).delay(150).reduceMotion(ReduceMotion.System)}>
                    <View className="flex-row items-baseline justify-between mb-3.5">
                        <Text className="text-white font-nunito-800" style={{ fontSize: 17, letterSpacing: -0.2 }}>
                            Nutrition
                        </Text>
                        <Text className="text-white/25 font-nunito-600 text-xs">
                            {hasIngredients ? "calculated · per 100 g" : "per 100 g"}
                        </Text>
                    </View>

                    <View style={[card, { paddingVertical: 26, alignItems: "center" }]} className="mb-2.5">
                        <View className="flex-row items-baseline">
                            {hasIngredients ? (
                                <Text
                                    className="font-nunito-800"
                                    style={{ color: ACCENT, fontSize: 46, lineHeight: 52, letterSpacing: -1.6, fontVariant: ["tabular-nums"] }}
                                >
                                    {cal100 || "0"}
                                </Text>
                            ) : (
                                <TextInput
                                    value={manualCal}
                                    onChangeText={v => setManualCal(v.replace(/[^0-9]/g, ""))}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor="rgba(197,227,132,0.25)"
                                    maxLength={5}
                                    className="font-nunito-800 text-right"
                                    style={{
                                        color: ACCENT,
                                        fontSize: 46,
                                        lineHeight: 52,
                                        letterSpacing: -1.6,
                                        padding: 0,
                                        minWidth: 92,
                                        fontVariant: ["tabular-nums"]
                                    }}
                                />
                            )}
                            <Text className="text-white/35 font-nunito-600 text-base ml-2">cal</Text>
                        </View>
                        <Text className="text-white/20 font-nunito-600 text-[11px] mt-1.5">
                            {hasIngredients ? "from your ingredients" : "tap the number to edit"}
                        </Text>
                    </View>

                    <View style={[card, { paddingHorizontal: 18, paddingVertical: 20 }]}>
                        {macroSplit && (
                            <View className="flex-row h-1.5 rounded-full overflow-hidden mb-5">
                                <View style={{ flex: macroSplit.carbs, backgroundColor: CARBS }} />
                                <View style={{ flex: macroSplit.fat, backgroundColor: FAT }} />
                                <View style={{ flex: macroSplit.protein, backgroundColor: PROTEIN }} />
                            </View>
                        )}
                        <View className="flex-row">
                            {macros.map(({ label, value, setter, color }) => (
                                <View key={label} className="flex-1 items-center" style={{ gap: 7 }}>
                                    <View className="flex-row items-center gap-1.5">
                                        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
                                        <Text className="text-white/40 font-nunito-600 text-xs">{label}</Text>
                                    </View>
                                    {hasIngredients ? (
                                        <Text
                                            className="text-white font-nunito-800 text-xl"
                                            style={{ fontVariant: ["tabular-nums"] }}
                                        >
                                            {value || "0"}
                                            <Text className="text-white/30 font-nunito-600 text-sm">g</Text>
                                        </Text>
                                    ) : (
                                        <View className="flex-row items-baseline">
                                            <TextInput
                                                value={value}
                                                onChangeText={v => setter(v.replace(/[^0-9.]/g, ""))}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="rgba(255,255,255,0.15)"
                                                maxLength={5}
                                                className="text-white font-nunito-800 text-xl min-w-[34px] text-center"
                                                style={{ padding: 0, fontVariant: ["tabular-nums"] }}
                                            />
                                            <Text className="text-white/30 font-nunito-600 text-sm">g</Text>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>

            {/* ── ACTIONS ── */}
            <View className="absolute left-0 right-0 bottom-0" pointerEvents="box-none">
                {/* Content fades out under the bar instead of colliding with it. */}
                <LinearGradient
                    colors={["transparent", PAGE]}
                    pointerEvents="none"
                    style={{ height: 56 }}
                />
                <View style={{ backgroundColor: PAGE, paddingHorizontal: 20, paddingBottom: insets.bottom + 12 }}>
                    {isEditMode ? (
                        <>
                            <Button
                                className="rounded-[20px] mx-0 w-full h-14 mb-2.5"
                                textClassName="text-[17px]"
                                onPress={handleRecord}
                                disabled={isSaving}
                            >
                                Record
                            </Button>
                            <View className="flex-row gap-2.5">
                                {isCustomMeal && (
                                    <Button
                                        className="flex-1 rounded-[18px] h-12 bg-[#181818]"
                                        textClassName="text-[15px] text-[#CA877E]"
                                        shadowColor="transparent"
                                        onPress={handleDelete}
                                        disabled={isSaving}
                                    >
                                        Delete
                                    </Button>
                                )}
                                <Button
                                    className={`${isCustomMeal ? "flex-1" : "w-full"} rounded-[18px] h-12 bg-[#181818]`}
                                    textClassName={`text-[15px] ${hasChanged ? "text-yellow" : "text-white/30"}`}
                                    shadowColor="transparent"
                                    onPress={handleUpdate}
                                    disabled={!hasChanged || isSaving || !canSave}
                                >
                                    {isSaving ? "Saving…" : "Update"}
                                </Button>
                            </View>
                        </>
                    ) : (
                        <Button
                            className="rounded-[20px] mx-0 w-full h-14"
                            textClassName="text-[17px]"
                            onPress={handleSave}
                            disabled={!canSave || isSaving}
                        >
                            {isSaving ? "Saving…" : "Save meal"}
                        </Button>
                    )}
                </View>
            </View>

            <AddMoreModal
                visible={showSearchModal}
                onClose={() => setShowSearchModal(false)}
                mealType="Breakfast"
                onIngredientSelect={addIngredient}
            />

            {createdMeal && (
                <Animated.View
                    entering={FadeIn.duration(200)}
                    className="absolute inset-0 items-center justify-center px-6"
                    style={{ backgroundColor: "rgba(10,10,10,0.82)" }}
                >
                    <Animated.View
                        entering={FadeInDown.duration(320).springify().damping(18).reduceMotion(ReduceMotion.System)}
                        className="w-full items-center px-7 py-8"
                        style={[card, { borderRadius: 28 }]}
                    >
                        <View
                            className="w-16 h-16 rounded-full items-center justify-center mb-5"
                            style={{ backgroundColor: "rgba(197,227,132,0.11)" }}
                        >
                            <CheckCircle size={34} color={ACCENT} weight="duotone" />
                        </View>

                        <Text
                            className="text-white font-nunito-800 text-center"
                            style={{ fontSize: 23, letterSpacing: -0.4 }}
                        >
                            Meal created
                        </Text>
                        <Text
                            className="font-nunito-700 text-[15px] mt-1.5 text-center"
                            style={{ color: ACCENT }}
                            numberOfLines={1}
                        >
                            {createdMeal.name}
                        </Text>

                        <View className="flex-row flex-wrap items-center justify-center gap-1.5 mt-4 mb-7">
                            {([
                                { v: `${createdMeal.cal} cal`, c: ACCENT },
                                { v: `${createdMeal.carbs}g carbs`, c: CARBS },
                                { v: `${createdMeal.fat}g fat`, c: FAT },
                                { v: `${createdMeal.protein}g protein`, c: PROTEIN },
                            ] as const).map(({ v, c }) => (
                                <View
                                    key={v}
                                    className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-lg"
                                    style={{ backgroundColor: "rgba(255,255,255,0.04)" }}
                                >
                                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
                                    <Text className="text-white/55 font-nunito-600 text-[12px]">{v}</Text>
                                </View>
                            ))}
                        </View>

                        <Button
                            className="rounded-[20px] mx-0 w-full h-14 mb-1"
                            textClassName="text-[17px]"
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
                        <TouchableOpacity onPress={() => router.back()} activeOpacity={0.6} className="py-3">
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
