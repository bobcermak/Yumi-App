import { Button, Icon, SearchResultItem, SearchResultSkeleton } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useFoodSearch } from "@/lib/hooks/useFoodSearch";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { createCustomFood } from "@/lib/services/supabase/queries/foods";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import {
    Barcode,
    Camera,
    CaretLeft,
    CookingPot,
    MagnifyingGlass,
    Sparkle,
    Trash,
    X,
} from "phosphor-react-native";
import { useMemo, useRef, useState } from "react";
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown, FadeOut, LinearTransition } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Ingredient = { food: FoodSearchResult; weight: string; key: number };
type AddMode = null | "search" | "magicScan" | "barcode";

const PHOTO_HEIGHT = 220;

const CreateMeal = () => {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { userProfile } = useAuth();
    const { showToast } = useIndexContext();

    const [name, setName] = useState("");
    const [photoUri, setPhotoUri] = useState<string | null>(null);
    const [manualCal, setManualCal] = useState("");
    const [manualCarbs, setManualCarbs] = useState("");
    const [manualFat, setManualFat] = useState("");
    const [manualProtein, setManualProtein] = useState("");
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [addMode, setAddMode] = useState<AddMode>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { query, setQuery, results, isLoading, isPending } = useFoodSearch();
    const scrollRef = useRef<ScrollView>(null);

    const hasIngredients = ingredients.length > 0;

    const computed = useMemo(() => {
        if (!hasIngredients) return null;
        const totalW = ingredients.reduce((s, i) => s + (parseFloat(i.weight) || 100), 0);
        if (totalW === 0) return null;
        const sum = (key: keyof FoodSearchResult) =>
            ingredients.reduce((s, i) => s + ((i.food[key] as number) || 0) * (parseFloat(i.weight) || 100) / 100, 0);
        return {
            cal: Math.round(sum("calories_per_100g") / totalW * 100),
            carbs: Math.round(sum("carbs_per_100g") / totalW * 100),
            fat: Math.round(sum("fat_per_100g") / totalW * 100),
            protein: Math.round(sum("protein_per_100g") / totalW * 100),
        };
    }, [ingredients]);

    const cal100 = hasIngredients ? String(computed?.cal ?? 0) : manualCal;
    const carbs100 = hasIngredients ? String(computed?.carbs ?? 0) : manualCarbs;
    const fat100 = hasIngredients ? String(computed?.fat ?? 0) : manualFat;
    const protein100 = hasIngredients ? String(computed?.protein ?? 0) : manualProtein;

    const canSave = name.trim().length >= 2 && (hasIngredients || parseFloat(manualCal) > 0);

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") { showToast("Gallery permission required", undefined, "error"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
    };

    const openCamera = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") { showToast("Camera permission required", undefined, "error"); return; }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
        if (!result.canceled && result.assets[0]) setPhotoUri(result.assets[0].uri);
    };

    const toggleMode = (mode: AddMode) => {
        setAddMode(prev => prev === mode ? null : mode);
        if (mode === "search") {
            setShowDropdown(false);
            setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 200);
        } else if (mode === "magicScan") {
            router.push({ pathname: "/magic-scan" });
        } else if (mode === "barcode") {
            router.push({ pathname: "/magic-scan", params: { cameraMode: "barcode" } });
        }
    };

    const addIngredient = (food: FoodSearchResult) => {
        setIngredients(prev => [...prev, { food, weight: "100", key: Date.now() }]);
        setQuery("");
        setShowDropdown(false);
        Keyboard.dismiss();
    };

    const handleSave = async () => {
        if (!userProfile?.id || !canSave) return;
        setIsSaving(true);
        try {
            await createCustomFood(userProfile.id, {
                name: name.trim(),
                calories_per_100g: parseFloat(cal100) || 0,
                protein_per_100g: parseFloat(protein100) || 0,
                fat_per_100g: parseFloat(fat100) || 0,
                carbs_per_100g: parseFloat(carbs100) || 0,
            }, photoUri);
            showToast("Meal created!");
            router.back();
        } catch {
            showToast("Failed to create meal", undefined, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <View style={{ flex: 1 }}>
                {/* Back button */}
                <View style={{ position: "absolute", top: insets.top + 8, left: 16, zIndex: 100 }}>
                    <Icon onPress={() => router.back()} className="bg-yellow w-12 h-12">
                        <CaretLeft size={24} color="#1D1D1D" weight="regular" />
                    </Icon>
                </View>

                <ScrollView
                    ref={scrollRef}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                >
                    {/* ── Photo header ── */}
                    <View style={{ height: PHOTO_HEIGHT, backgroundColor: "#0F1F0F", overflow: "hidden" }}>
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                        ) : (
                            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <CookingPot size={72} color="rgba(197,227,132,0.25)" weight="duotone" />
                            </View>
                        )}
                        {/* gradient overlay */}
                        <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, backgroundColor: "rgba(0,0,0,0.35)" }} />
                        {/* photo buttons */}
                        <View style={{ position: "absolute", bottom: 16, flexDirection: "row", gap: 8, alignSelf: "center" }}>
                            <TouchableOpacity
                                onPress={openCamera}
                                activeOpacity={0.8}
                                style={{
                                    flexDirection: "row", alignItems: "center", gap: 6,
                                    backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 20,
                                    paddingHorizontal: 16, paddingVertical: 9,
                                    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
                                }}
                            >
                                <Camera size={15} color="rgba(255,255,255,0.8)" />
                                <Text style={{ color: "rgba(255,255,255,0.8)", fontFamily: "Nunito_700Bold", fontSize: 13 }}>Camera</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={openGallery}
                                activeOpacity={0.8}
                                style={{
                                    flexDirection: "row", alignItems: "center", gap: 6,
                                    backgroundColor: "rgba(197,227,132,0.9)", borderRadius: 20,
                                    paddingHorizontal: 16, paddingVertical: 9,
                                }}
                            >
                                <Camera size={15} color="#1D1D1D" weight="fill" />
                                <Text style={{ color: "#1D1D1D", fontFamily: "Nunito_700Bold", fontSize: 13 }}>
                                    {photoUri ? "Change" : "Gallery"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* ── Dark card pulling over photo ── */}
                    <View style={{ backgroundColor: "#121212", borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -28, paddingTop: 28, paddingHorizontal: 16 }}>

                        {/* Name */}
                        <View style={{ marginBottom: 20 }}>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Name of my meal…"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                style={{
                                    color: "white",
                                    fontFamily: "Nunito_800ExtraBold",
                                    fontSize: 22,
                                    paddingVertical: 16,
                                    paddingHorizontal: 20,
                                    backgroundColor: "rgba(255,255,255,0.05)",
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: name.length > 0 ? "rgba(197,227,132,0.3)" : "rgba(255,255,255,0.08)",
                                }}
                                maxLength={60}
                            />
                        </View>

                        {/* Section: Ingredients */}
                        <View style={{ marginBottom: 8 }}>
                            <Text style={{ color: "white", fontFamily: "Nunito_800ExtraBold", fontSize: 18, marginBottom: 12 }}>
                                Add Ingredients
                            </Text>

                            {/* 3 action buttons */}
                            <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                                {/* Search */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => toggleMode("search")}
                                    style={{
                                        flex: 1, alignItems: "center", justifyContent: "center", gap: 6,
                                        paddingVertical: 14,
                                        backgroundColor: addMode === "search" ? "rgba(197,227,132,0.12)" : "rgba(255,255,255,0.05)",
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: addMode === "search" ? "rgba(197,227,132,0.4)" : "rgba(255,255,255,0.1)",
                                    }}
                                >
                                    <MagnifyingGlass size={22} color={addMode === "search" ? "#C5E384" : "rgba(255,255,255,0.55)"} weight={addMode === "search" ? "bold" : "regular"} />
                                    <Text style={{ color: addMode === "search" ? "#C5E384" : "rgba(255,255,255,0.5)", fontFamily: "Nunito_700Bold", fontSize: 11 }}>Search</Text>
                                </TouchableOpacity>

                                {/* Magic Scan */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => toggleMode("magicScan")}
                                    style={{
                                        flex: 1, alignItems: "center", justifyContent: "center", gap: 6,
                                        paddingVertical: 14,
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: "rgba(255,255,255,0.1)",
                                    }}
                                >
                                    <Sparkle size={22} color="rgba(255,255,255,0.55)" weight="regular" />
                                    <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_700Bold", fontSize: 11 }}>Magic Scan</Text>
                                </TouchableOpacity>

                                {/* Barcode */}
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    onPress={() => toggleMode("barcode")}
                                    style={{
                                        flex: 1, alignItems: "center", justifyContent: "center", gap: 6,
                                        paddingVertical: 14,
                                        backgroundColor: "rgba(255,255,255,0.05)",
                                        borderRadius: 16,
                                        borderWidth: 1,
                                        borderColor: "rgba(255,255,255,0.1)",
                                    }}
                                >
                                    <Barcode size={22} color="rgba(255,255,255,0.55)" weight="regular" />
                                    <Text style={{ color: "rgba(255,255,255,0.5)", fontFamily: "Nunito_700Bold", fontSize: 11 }}>Barcode</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Search panel */}
                            {addMode === "search" && (
                                <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut.duration(150)} style={{ marginBottom: 10 }}>
                                    <View style={{
                                        flexDirection: "row", alignItems: "center", gap: 10,
                                        backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 14,
                                        borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                                        paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8,
                                    }}>
                                        <MagnifyingGlass size={18} color="rgba(255,255,255,0.35)" />
                                        <TextInput
                                            value={query}
                                            onChangeText={v => { setQuery(v); setShowDropdown(v.trim().length >= 2); }}
                                            placeholder="Search ingredient…"
                                            placeholderTextColor="rgba(255,255,255,0.25)"
                                            style={{ flex: 1, color: "white", fontFamily: "Nunito_600SemiBold", fontSize: 15, paddingVertical: 12, padding: 0 }}
                                            autoFocus
                                        />
                                        {query.length > 0 && (
                                            <TouchableOpacity onPress={() => { setQuery(""); setShowDropdown(false); }}>
                                                <X size={16} color="rgba(255,255,255,0.35)" />
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    {showDropdown && (
                                        <Animated.View
                                            entering={FadeInDown.duration(180)}
                                            exiting={FadeOut.duration(130)}
                                            style={{
                                                backgroundColor: "#1A1A1A", borderRadius: 16,
                                                borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
                                                overflow: "hidden",
                                                shadowColor: "#000", shadowOpacity: 0.4, shadowRadius: 12, elevation: 12,
                                            }}
                                        >
                                            {isLoading || isPending
                                                ? Array.from({ length: 3 }).map((_, i) => <SearchResultSkeleton key={i} />)
                                                : results.length > 0
                                                    ? results.slice(0, 5).map(food => (
                                                        <SearchResultItem key={food.id} item={food} onPress={() => addIngredient(food)} />
                                                    ))
                                                    : query.trim().length >= 2
                                                        ? (
                                                            <View style={{ padding: 20, alignItems: "center" }}>
                                                                <Text style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Nunito_600SemiBold", fontSize: 13 }}>No results</Text>
                                                            </View>
                                                        ) : null}
                                        </Animated.View>
                                    )}
                                </Animated.View>
                            )}

                            {/* Ingredient list */}
                            {hasIngredients && (
                                <Animated.View layout={LinearTransition.springify().damping(20)} style={{ gap: 8 }}>
                                    {ingredients.map(ing => (
                                        <Animated.View
                                            key={ing.key}
                                            entering={FadeInDown.duration(200).springify()}
                                            exiting={FadeOut.duration(150)}
                                            style={{
                                                flexDirection: "row", alignItems: "center",
                                                backgroundColor: "rgba(255,255,255,0.04)",
                                                borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
                                                borderRadius: 14, padding: 10, gap: 10,
                                            }}
                                        >
                                            <Image
                                                source={ing.food.image_url ? { uri: ing.food.image_url } : require("@/assets/images/not-found-meal.webp")}
                                                style={{ width: 38, height: 38, borderRadius: 8 }}
                                                resizeMode="cover"
                                            />
                                            <Text style={{ flex: 1, color: "white", fontFamily: "Nunito_700Bold", fontSize: 14 }} numberOfLines={1}>
                                                {ing.food.name}
                                            </Text>
                                            <View style={{
                                                flexDirection: "row", alignItems: "center",
                                                backgroundColor: "rgba(255,255,255,0.08)",
                                                borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, gap: 3,
                                            }}>
                                                <TextInput
                                                    value={ing.weight}
                                                    onChangeText={v => setIngredients(prev => prev.map(i => i.key === ing.key ? { ...i, weight: v.replace(/[^0-9]/g, "") } : i))}
                                                    keyboardType="numeric"
                                                    maxLength={4}
                                                    style={{ color: "white", fontFamily: "Nunito_700Bold", fontSize: 14, minWidth: 32, textAlign: "right", padding: 0 }}
                                                />
                                                <Text style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Nunito_600SemiBold", fontSize: 12 }}>g</Text>
                                            </View>
                                            <TouchableOpacity onPress={() => setIngredients(prev => prev.filter(i => i.key !== ing.key))} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                                                <Trash size={18} color="#CA877E" weight="regular" />
                                            </TouchableOpacity>
                                        </Animated.View>
                                    ))}
                                </Animated.View>
                            )}
                        </View>

                        {/* ── Nutrition section ── */}
                        <View style={{ marginTop: 24, marginBottom: 8 }}>
                            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                <Text style={{ color: "white", fontFamily: "Nunito_800ExtraBold", fontSize: 18 }}>Nutrition</Text>
                                {hasIngredients && (
                                    <View style={{ backgroundColor: "rgba(197,227,132,0.15)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
                                        <Text style={{ color: "#C5E384", fontFamily: "Nunito_700Bold", fontSize: 11 }}>Auto · per 100g</Text>
                                    </View>
                                )}
                                {!hasIngredients && (
                                    <Text style={{ color: "rgba(255,255,255,0.3)", fontFamily: "Nunito_600SemiBold", fontSize: 12 }}>per 100g</Text>
                                )}
                            </View>
                            <View style={{ flexDirection: "row", gap: 8 }}>
                                {[
                                    { label: "Calories", value: cal100, setter: setManualCal, unit: "kcal" },
                                    { label: "Carbs", value: carbs100, setter: setManualCarbs, unit: "g" },
                                    { label: "Fat", value: fat100, setter: setManualFat, unit: "g" },
                                    { label: "Protein", value: protein100, setter: setManualProtein, unit: "g" },
                                ].map(({ label, value, setter, unit }) => (
                                    <View
                                        key={label}
                                        style={{
                                            flex: 1,
                                            backgroundColor: "rgba(255,255,255,0.05)",
                                            borderWidth: 1,
                                            borderColor: "rgba(255,255,255,0.09)",
                                            borderRadius: 14,
                                            paddingVertical: 12,
                                            paddingHorizontal: 6,
                                            alignItems: "center",
                                            minHeight: 76,
                                            justifyContent: "center",
                                        }}
                                    >
                                        <Text style={{ color: "rgba(255,255,255,0.35)", fontFamily: "Nunito_600SemiBold", fontSize: 10, marginBottom: 4 }}>{label}</Text>
                                        {hasIngredients ? (
                                            <Text style={{ color: "white", fontFamily: "Nunito_800ExtraBold", fontSize: 17 }}>{value}</Text>
                                        ) : (
                                            <TextInput
                                                value={value}
                                                onChangeText={setter}
                                                keyboardType="numeric"
                                                placeholder="0"
                                                placeholderTextColor="rgba(255,255,255,0.2)"
                                                maxLength={5}
                                                style={{ color: "white", fontFamily: "Nunito_800ExtraBold", fontSize: 17, textAlign: "center", padding: 0 }}
                                            />
                                        )}
                                        <Text style={{ color: "rgba(255,255,255,0.25)", fontFamily: "Nunito_600SemiBold", fontSize: 10, marginTop: 2 }}>{unit}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                    </View>
                </ScrollView>

                {/* Fixed Save button */}
                <View style={{ position: "absolute", bottom: insets.bottom + 12, left: 16, right: 16 }}>
                    <Button
                        className="rounded-[30px] mx-0 w-full py-5"
                        textClassName="text-xl"
                        onPress={handleSave}
                        disabled={!canSave || isSaving}
                    >
                        {isSaving ? "Saving…" : "Save Meal"}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};
export default CreateMeal;
