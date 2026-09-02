import { useCallback, useEffect, useState } from "react";
import { ScrollView, View, Text, RefreshControl, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown, ReduceMotion, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Fire, GearSix, PencilSimple, ImageSquare, Quotes, UsersThree, Plus, ArrowRight } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useRouter } from "expo-router";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { getEffectiveStreak } from "@/lib/services/supabase/queries/profiles";
import { uploadImage } from "@/lib/services/supabase/queries/storage";
import { addProgressPhotos } from "@/lib/services/supabase/queries/setupUserAccount";
import { pickImageHelper } from "@/lib/helpers/imageHelpers";
import supabase from "@/lib/services/supabase/client";
import { AIRewind, ProgressPhoto } from "@/types/database/dbModels";
import { Divider, Icon, PressableScale, SectionLabel } from "@/components";

const INK = {
    hi:    "rgba(255,255,255,0.94)",
    mid:   "rgba(255,255,255,0.70)",
    low:   "rgba(255,255,255,0.42)",
    faint: "rgba(255,255,255,0.26)",
    ghost: "rgba(255,255,255,0.15)",
    line:  "rgba(255,255,255,0.07)"
};
const GREEN = {
    full: "#C5E384",
    deep: "#84C754",
    soft: "rgba(197,227,132,0.55)",
    dim:  "rgba(197,227,132,0.30)",
    wash: "rgba(197,227,132,0.12)",
    veil: "rgba(197,227,132,0.05)"
};
const EMBER = "#FF6B35";
const WATER = "#3182CE";
const CLAY = "#CA877E";
const SP = { xs: 4, sm: 8, md: 12, lg: 18, xl: 26, xxl: 38 };
const PAGE_X = 24;
const MIN_REFRESH_MS = 700;
const getRatingColor = (r?: number | null) => {
    if (r == null) return CLAY;
    if (r >= 8) return GREEN.deep;
    if (r >= 4) return GREEN.full;
    return CLAY;
};
const Profile = () => {
    const { userProfile, refreshProfile } = useAuth();
    const { activeDates, showToast } = useIndexContext();
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [rewind, setRewind] = useState<AIRewind | null>(null);
    const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [isAddingPhoto, setIsAddingPhoto] = useState(false);

    const streak = getEffectiveStreak(userProfile?.streak_count, userProfile?.last_log_date);
    const pageOpacity = useSharedValue(0);
    useEffect(() => {
        pageOpacity.value = withTiming(1, { duration: 250 });
    }, []);
    const animatedPageStyle = useAnimatedStyle(() => ({ opacity: pageOpacity.value, flex: 1 }));
    const fetchData = useCallback(async () => {
        if (!userProfile?.id) return;
        const [{ data: rewindData }, { data: photos }] = await Promise.all([
            supabase
                .from("ai_rewinds")
                .select("*")
                .eq("user_id", userProfile.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle(),
            supabase
                .from("progress_photos")
                .select("*")
                .eq("user_id", userProfile.id)
                .order("created_at", { ascending: true }),
        ]);
        if (rewindData) setRewind(rewindData);
        if (photos) setProgressPhotos(photos);
    }, [userProfile?.id]);
    useFocusEffect(useCallback(() => { fetchData(); }, [fetchData]));
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([
            fetchData(),
            refreshProfile(),
            new Promise(resolve => setTimeout(resolve, MIN_REFRESH_MS))
        ]);
        setRefreshing(false);
    }, [fetchData, refreshProfile]);
    const handleAddPhoto = useCallback(async () => {
        if (!userProfile?.id || isAddingPhoto) return;
        const uris = await pickImageHelper("library", { isProfile: false, limit: 1 });
        if (!uris || uris.length === 0) return;
        setIsAddingPhoto(true);
        try {
            const url = await uploadImage(uris[0], `${userProfile.id}/progress_${Date.now()}.webp`, "progress");
            if (!url) throw new Error("Upload returned no URL");
            const { error } = await addProgressPhotos(userProfile.id, [
                { image_url: url, weight: userProfile.current_weight ?? 0 }
            ]);
            if (error) throw error;
            await fetchData();
        } catch {
            showToast("Could not add the photo", undefined, "error");
        } finally {
            setIsAddingPhoto(false);
        }
    }, [userProfile?.id, userProfile?.current_weight, isAddingPhoto, fetchData, showToast]);
    const TAB_BAR_HEIGHT = 148;
    return (
        <View className="flex-1">
            <Animated.View style={animatedPageStyle}>
                <ScrollView
                    className="flex-1"
                    style={{ marginTop: insets.top + SP.sm }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={GREEN.full}
                            colors={[GREEN.full]}
                            progressBackgroundColor="#1D1D1D"
                        />
                    }
                >
                    <Animated.View
                        entering={FadeIn.duration(240).reduceMotion(ReduceMotion.System)}
                        className="flex-row items-center justify-between"
                        style={{ paddingHorizontal: PAGE_X, height: 40 }}
                    >
                        <View className="flex-row items-center" style={{ gap: SP.xs + 2 }}>
                            {streak > 0 && (
                                <>
                                    <Fire size={22} color={EMBER} weight="fill" />
                                    <Text
                                        className="font-nunito-800 text-base"
                                        style={{ color: INK.hi, fontVariant: ["tabular-nums"] }}
                                    >
                                        {streak}
                                    </Text>
                                </>
                            )}
                        </View>
                        <Icon className="bg-white/20" shadowColor="transparent">
                            <GearSix size={20} color="white" weight="regular" />
                        </Icon>
                    </Animated.View>
                    <Animated.View
                        entering={FadeInDown.duration(300).delay(40).reduceMotion(ReduceMotion.System)}
                        className="items-center"
                        style={{ paddingHorizontal: PAGE_X, marginTop: SP.lg }}
                    >
                        <View
                            style={{
                                width: 118,
                                height: 118,
                                borderRadius: 59,
                                padding: 3,
                                backgroundColor: "rgba(197,227,132,0.2)"
                            }}
                        >
                            <View style={{ flex: 1, borderRadius: 56, overflow: "hidden", backgroundColor: "#222222" }}>
                                <Image
                                    source={
                                        userProfile?.avatar_url
                                            ? { uri: userProfile.avatar_url }
                                            : require("@/assets/images/anon-profile-picture.jpg")
                                    }
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="cover"
                                />
                            </View>
                        </View>
                        <View className="flex-row items-center" style={{ gap: SP.sm, marginTop: SP.lg }}>
                            <Text
                                className="font-nunito-800"
                                style={{ color: INK.hi, fontSize: 28, lineHeight: 40, letterSpacing: -0.7 }}
                                numberOfLines={1}
                            >
                                {userProfile?.full_name || userProfile?.username || "—"}
                            </Text>
                            {userProfile?.is_premium && (
                                <View className="px-2 py-0.5 rounded-md" style={{ backgroundColor: "rgba(132,199,84,0.16)" }}>
                                    <Text className="font-nunito-800 text-[11px]" style={{ color: GREEN.deep }}>
                                        Yumi+
                                    </Text>
                                </View>
                            )}
                        </View>
                        <Text className="font-nunito-600 text-[15px]" style={{ color: INK.faint }}>
                            @{userProfile?.username || "—"}
                        </Text>
                        <View className="flex-row items-center" style={{ gap: SP.md, marginTop: SP.md }}>
                            <Text
                                className="font-nunito-800 text-[13px]"
                                style={{ color: getRatingColor(userProfile?.total_rating), fontVariant: ["tabular-nums"] }}
                            >
                                {userProfile?.total_rating?.toFixed(1) ?? "—"}
                                <Text className="font-nunito-600" style={{ color: INK.faint }}> rating</Text>
                            </Text>
                            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: INK.ghost }} />
                            <Text
                                className="font-nunito-700 text-[13px]"
                                style={{ color: INK.mid, fontVariant: ["tabular-nums"] }}
                            >
                                {activeDates?.length ?? 0}
                                <Text className="font-nunito-600" style={{ color: INK.faint }}> days logged</Text>
                            </Text>
                        </View>
                    </Animated.View>
                    <Animated.View
                        entering={FadeInDown.duration(300).delay(90).reduceMotion(ReduceMotion.System)}
                        className="flex-row items-center"
                        style={{ paddingHorizontal: PAGE_X, marginTop: SP.xxl }}
                    >
                        <View className="flex-1 items-center" style={{ gap: 3 }}>
                            <SectionLabel>Weight</SectionLabel>
                            <Text
                                className="font-nunito-800"
                                style={{ color: INK.hi, fontSize: 25, lineHeight: 31, letterSpacing: -0.6, fontVariant: ["tabular-nums"] }}
                            >
                                {userProfile?.current_weight ?? "—"}
                                <Text className="font-nunito-600 text-[13px]" style={{ color: INK.faint }}> kg</Text>
                            </Text>
                        </View>
                        <View style={{ width: 1, height: 34, backgroundColor: INK.line }} />
                        <View className="flex-1 items-center" style={{ gap: 3 }}>
                            <SectionLabel>Daily limit</SectionLabel>
                            <Text
                                className="font-nunito-800"
                                style={{ color: GREEN.full, fontSize: 25, lineHeight: 31, letterSpacing: -0.6, fontVariant: ["tabular-nums"] }}
                            >
                                {userProfile?.daily_calorie_limit ?? "—"}
                                <Text className="font-nunito-600 text-[13px]" style={{ color: INK.faint }}> cal</Text>
                            </Text>
                        </View>
                        <View style={{ width: 1, height: 34, backgroundColor: INK.line }} />
                        <View className="flex-1 items-center" style={{ gap: 3 }}>
                            <View className="flex-row items-center" style={{ gap: 5 }}>
                                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: WATER }} />
                                <SectionLabel>Water</SectionLabel>
                            </View>
                            <Text
                                className="font-nunito-800"
                                style={{ color: INK.hi, fontSize: 25, lineHeight: 31, letterSpacing: -0.6, fontVariant: ["tabular-nums"] }}
                            >
                                {userProfile?.daily_water_limit != null ? userProfile.daily_water_limit.toFixed(1) : "—"}
                                <Text className="font-nunito-600 text-[13px]" style={{ color: INK.faint }}> L</Text>
                            </Text>
                        </View>
                    </Animated.View>
                    <Divider />
                    <Animated.View
                        entering={FadeInDown.duration(320).delay(140).reduceMotion(ReduceMotion.System)}
                        style={{ marginTop: SP.xl }}
                    >
                        <View
                            className="flex-row items-baseline justify-between"
                            style={{ paddingHorizontal: PAGE_X, marginBottom: SP.lg }}
                        >
                            <SectionLabel>Progress photos</SectionLabel>
                            {progressPhotos.length > 0 && (
                                <Text
                                    className="font-nunito-600 text-[11px]"
                                    style={{ color: INK.ghost, fontVariant: ["tabular-nums"] }}
                                >
                                    {progressPhotos.length}
                                </Text>
                            )}
                        </View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: SP.md - 2, paddingHorizontal: PAGE_X }}
                        >
                            {progressPhotos.map((photo, index) => (
                                <View
                                    key={photo.id}
                                    style={{
                                        width: 128,
                                        height: 172,
                                        borderRadius: 22,
                                        overflow: "hidden",
                                        backgroundColor: "#1A1A1A"
                                    }}
                                >
                                    <Image
                                        source={{ uri: photo.image_url }}
                                        style={{ width: "100%", height: "100%" }}
                                        contentFit="cover"
                                    />
                                    <LinearGradient
                                        colors={["transparent", "rgba(0,0,0,0.82)"]}
                                        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 82 }}
                                    />
                                    <View
                                        className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full"
                                        style={{ backgroundColor: "rgba(18,18,18,0.6)" }}
                                    >
                                        <Text className="font-nunito-800 text-[10px]" style={{ color: INK.mid }}>
                                            {index + 1}
                                        </Text>
                                    </View>
                                    {photo.weight != null && (
                                        <Text
                                            className="absolute bottom-3 left-3 font-nunito-800"
                                            style={{ color: INK.hi, fontSize: 17, fontVariant: ["tabular-nums"] }}
                                        >
                                            {photo.weight}
                                            <Text className="font-nunito-600 text-xs" style={{ color: INK.low }}> kg</Text>
                                        </Text>
                                    )}
                                </View>
                            ))}
                            <PressableScale
                                onPress={handleAddPhoto}
                                disabled={isAddingPhoto}
                                className="items-center justify-center"
                                style={{
                                    width: 128,
                                    height: 172,
                                    borderRadius: 22,
                                    borderWidth: 1.5,
                                    borderColor: GREEN.dim,
                                    borderStyle: "dashed",
                                    backgroundColor: GREEN.veil,
                                    gap: SP.sm + 1
                                }}
                            >
                                {isAddingPhoto ? (
                                    <ActivityIndicator color={GREEN.full} />
                                ) : (
                                    <>
                                        <View
                                            className="w-10 h-10 rounded-full items-center justify-center"
                                            style={{ backgroundColor: GREEN.wash }}
                                        >
                                            <Plus size={19} color={GREEN.full} weight="bold" />
                                        </View>
                                        <Text className="font-nunito-700 text-[13px]" style={{ color: GREEN.soft }}>
                                            Add photo
                                        </Text>
                                        {progressPhotos.length === 0 && (
                                            <Text
                                                className="font-nunito-600 text-[10px] text-center px-3"
                                                style={{ color: INK.ghost }}
                                            >
                                                Track how you look{"\n"}over time
                                            </Text>
                                        )}
                                    </>
                                )}
                            </PressableScale>
                        </ScrollView>
                        {progressPhotos.length === 0 && (
                            <View
                                className="flex-row items-center"
                                style={{ gap: SP.sm, paddingHorizontal: PAGE_X, marginTop: SP.md }}
                            >
                                <ImageSquare size={13} color={INK.ghost} weight="regular" />
                                <Text className="font-nunito-600 text-[11px]" style={{ color: INK.ghost }}>
                                    Photos are saved with today&apos;s weight
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                    <Divider />
                    <Animated.View
                        entering={FadeInDown.duration(320).delay(190).reduceMotion(ReduceMotion.System)}
                        style={{ paddingHorizontal: PAGE_X, marginTop: SP.xl }}
                    >
                        <View style={{ paddingLeft: SP.lg }}>
                            <LinearGradient
                                colors={[GREEN.full, GREEN.deep, "rgba(132,199,84,0.15)"]}
                                locations={[0, 0.45, 1]}
                                style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: 3, borderRadius: 2 }}
                            />
                            {rewind ? (
                                <>
                                    <Quotes size={17} color={GREEN.dim} weight="fill" />
                                    <Text
                                        className="font-nunito-600"
                                        style={{ color: INK.hi, fontSize: 16, lineHeight: 26, letterSpacing: -0.1, marginTop: SP.md }}
                                    >
                                        {rewind.summary_text}
                                    </Text>
                                    {rewind.period_start && rewind.period_end && (
                                        <Text
                                            className="font-nunito-600 text-[11px]"
                                            style={{ color: INK.ghost, marginTop: SP.md }}
                                        >
                                            {format(parseISO(rewind.period_start), "MMM d")}
                                            {" - "}
                                            {format(parseISO(rewind.period_end), "MMM d, yyyy")}
                                        </Text>
                                    )}
                                </>
                            ) : (
                                <View className="flex-row items-center" style={{ gap: SP.md }}>
                                    <Quotes size={15} color={GREEN.dim} weight="fill" />
                                    <Text className="font-nunito-600 text-[13px] flex-1" style={{ color: INK.faint }}>
                                        Log a full week and your written rewind lands here
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Animated.View>
                    <Divider />
                    <PressableScale
                        onPress={() => router.push("/(tabs)/groups")}
                        className="flex-row items-center"
                        style={{ gap: SP.md, paddingHorizontal: PAGE_X, paddingVertical: SP.lg, marginTop: SP.sm }}
                    >
                        <View
                            className="w-9 h-9 rounded-full items-center justify-center"
                            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                        >
                            <UsersThree size={17} color={INK.low} weight="regular" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-nunito-700 text-[15px]" style={{ color: INK.mid }}>Clubs</Text>
                            <Text className="font-nunito-600 text-[11px]" style={{ color: INK.faint, marginTop: 2 }}>
                                Log together, compare streaks
                            </Text>
                        </View>
                        <Text className="font-nunito-700 text-sm text-yellow">
                            Explore
                        </Text>
                        <ArrowRight size={14} color="#C5E384" weight="bold"/>
                    </PressableScale>
                </ScrollView>
            </Animated.View>
        </View>
    );
};
export default Profile;