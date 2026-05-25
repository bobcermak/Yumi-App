import { useCallback, useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, RefreshControl } from "react-native";
import { Image } from "expo-image";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Fire, GearSix, PencilSimple, TrendUp, TrendDown, ImageSquare } from "phosphor-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { getEffectiveStreak } from "@/lib/services/supabase/queries/profiles";
import supabase from "@/lib/services/supabase/client";
import { AIRewind, ProgressPhoto } from "@/types/database/dbModels";
import { ProfilePicture, JourneyCalendar } from "@/components";

const getRatingColor = (r?: number | null) => {
    if (r == null) return "#CA877E";
    if (r >= 8) return "#84C754";
    if (r >= 4) return "#C5E384";
    return "#CA877E";
};

const Profile = () => {
    const { userProfile, refreshProfile } = useAuth();
    const { overviewData, activeDates, targetDate, setSelectedDate } = useIndexContext();
    const insets = useSafeAreaInsets();

    const [rewind, setRewind] = useState<AIRewind | null>(null);
    const [progressPhotos, setProgressPhotos] = useState<ProgressPhoto[]>([]);
    const [refreshing, setRefreshing] = useState(false);

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
        await Promise.all([fetchData(), refreshProfile()]);
        setRefreshing(false);
    }, [fetchData, refreshProfile]);

    const TAB_BAR_HEIGHT = 148;

    const weightDiff =
        userProfile?.current_weight != null && userProfile?.goal_weight != null
            ? Math.abs(userProfile.current_weight - userProfile.goal_weight)
            : null;

    const daysLeft =
        userProfile?.target_date
            ? differenceInCalendarDays(parseISO(userProfile.target_date), new Date())
            : null;

    return (
        <View className="flex-1">
            <Animated.View style={animatedPageStyle}>
                <ScrollView
                    className="flex-1 mt-[56px] w-[380px] self-center"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#C5E384"
                            colors={["#C5E384"]}
                            progressBackgroundColor="#1D1D1D"
                        />
                    }
                >
                    {/* ── PAGE HEADER ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(50)}
                        className="flex-row items-center justify-between px-2 py-3 w-[380px] self-center"
                    >
                        <Text className="text-white font-nunito-800" style={{ fontSize: 30 }}>
                            My Profile
                        </Text>
                        <View className="flex-row items-center gap-2">
                            {streak > 0 && (
                                <View
                                    className="flex-row items-center gap-1.5 px-3 py-2 rounded-full bg-dark border border-white/10"
                                >
                                    <Fire size={15} color="#FF6B35" weight="fill" />
                                    <Text className="text-white font-nunito-700 text-sm">{streak}</Text>
                                </View>
                            )}
                            <TouchableOpacity
                                className="w-11 h-11 items-center justify-center rounded-[14px] bg-dark border border-white/10"
                                activeOpacity={0.25}
                            >
                                <GearSix size={20} color="rgba(255,255,255,0.55)" weight="regular" />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                    {/* ── PROFILE CARD ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(100)}
                        className="w-[362px] self-center"
                    >
                        <View
                            className="bg-dark rounded-[20px] px-5 py-5 border border-white/10"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 6 },
                                shadowOpacity: 0.35,
                                shadowRadius: 12,
                                elevation: 7,
                            }}
                        >
                            <View className="flex-row items-center gap-4">
                                <ProfilePicture
                                    uri={userProfile?.avatar_url}
                                    rating={userProfile?.total_rating}
                                    isPremium={userProfile?.is_premium}
                                    size={76}
                                />
                                <View className="flex-1" style={{ gap: 2 }}>
                                    <Text
                                        className="text-white font-nunito-800"
                                        style={{ fontSize: 22, lineHeight: 28 }}
                                        numberOfLines={1}
                                    >
                                        {userProfile?.full_name || userProfile?.username || "—"}
                                    </Text>
                                    <Text className="text-white/40 font-nunito-600 text-base">
                                        @{userProfile?.username || "—"}
                                    </Text>
                                    {userProfile?.is_premium && (
                                        <View className="flex-row mt-1">
                                            <View
                                                className="px-2.5 py-0.5 rounded-full"
                                                style={{
                                                    backgroundColor: "rgba(132,199,84,0.15)",
                                                    borderWidth: 1,
                                                    borderColor: "rgba(132,199,84,0.3)",
                                                }}
                                            >
                                                <Text className="text-green font-nunito-700 text-xs">Yumi+</Text>
                                            </View>
                                        </View>
                                    )}
                                </View>
                                <TouchableOpacity
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 20,
                                        backgroundColor: "rgba(197,227,132,0.1)",
                                        borderWidth: 1,
                                        borderColor: "rgba(197,227,132,0.25)",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                    activeOpacity={0.25}
                                >
                                    <PencilSimple size={17} color="#C5E384" weight="regular" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Animated.View>

                    {/* ── STATS CARD ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(150)}
                        className="w-[362px] self-center mt-3"
                    >
                        <View
                            className="bg-dark rounded-[20px] px-5 py-5 border border-white/10"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <View className="flex-row items-center">
                                {/* Weight */}
                                <View className="flex-1 items-center" style={{ gap: 2 }}>
                                    <Text className="text-white/40 font-nunito-600 text-xs">Weight</Text>
                                    <Text className="text-white font-nunito-800 text-2xl">
                                        {userProfile?.current_weight ?? "—"}
                                    </Text>
                                    <Text className="text-white/25 font-nunito-600 text-xs">kg</Text>
                                </View>
                                <View style={{ width: 1, height: 44, backgroundColor: "rgba(255,255,255,0.07)" }} />
                                {/* Daily Limit */}
                                <View className="flex-1 items-center" style={{ gap: 2 }}>
                                    <Text className="text-white/40 font-nunito-600 text-xs">Daily Limit</Text>
                                    <Text className="font-nunito-800 text-2xl" style={{ color: "#C5E384" }}>
                                        {userProfile?.daily_calorie_limit ?? "—"}
                                    </Text>
                                    <Text className="text-white/25 font-nunito-600 text-xs">cal</Text>
                                </View>
                                <View style={{ width: 1, height: 44, backgroundColor: "rgba(255,255,255,0.07)" }} />
                                {/* Water Goal */}
                                <View className="flex-1 items-center" style={{ gap: 2 }}>
                                    <Text className="text-white/40 font-nunito-600 text-xs">Water Goal</Text>
                                    <Text className="font-nunito-800 text-2xl" style={{ color: "#3182CE" }}>
                                        {userProfile?.daily_water_limit != null
                                            ? userProfile.daily_water_limit.toFixed(1)
                                            : "—"}
                                    </Text>
                                    <Text className="text-white/25 font-nunito-600 text-xs">L / day</Text>
                                </View>
                                <TouchableOpacity className="ml-2 p-1" activeOpacity={0.25}>
                                    <PencilSimple size={14} color="rgba(255,255,255,0.18)" weight="regular" />
                                </TouchableOpacity>
                            </View>

                            {/* Goal progress bar */}
                            {weightDiff !== null && userProfile?.goal_weight != null && (
                                <View className="mt-4 pt-4" style={{ borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.05)" }}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-white/40 font-nunito-600 text-xs">
                                            Goal:{" "}
                                            <Text className="text-white/55">{userProfile.goal_weight} kg</Text>
                                            {daysLeft != null && daysLeft > 0 && (
                                                <Text className="text-white/25"> · {daysLeft} days left</Text>
                                            )}
                                        </Text>
                                        <Text className="font-nunito-700 text-xs" style={{ color: "#C5E384" }}>
                                            {weightDiff.toFixed(1)} kg to go
                                        </Text>
                                    </View>
                                    <View
                                        className="h-1.5 rounded-full overflow-hidden"
                                        style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                                    >
                                        <View
                                            style={{
                                                height: "100%",
                                                width: "40%",
                                                backgroundColor: "#C5E384",
                                                borderRadius: 999,
                                            }}
                                        />
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.View>

                    {/* ── MY JOURNEY ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(200)}
                        className="w-[362px] self-center mt-8"
                    >
                        <Text className="title">My Journey</Text>
                        <JourneyCalendar
                            activeDates={activeDates}
                            targetDate={targetDate}
                            selectedDate={overviewData.date}
                            onSelectDate={setSelectedDate}
                        />
                    </Animated.View>

                    {/* ── REWIND & GLOW ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(250)}
                        className="w-[362px] self-center mt-8"
                    >
                        <Text className="title mb-4">Rewind & Glow</Text>
                        {rewind ? (
                            <View
                                className="rounded-[20px] p-5 border border-white/10"
                                style={{ backgroundColor: "#192218" }}
                            >
                                {rewind.period_start && rewind.period_end && (
                                    <Text
                                        className="font-nunito-600 text-xs mb-3"
                                        style={{ color: "rgba(132,199,84,0.5)" }}
                                    >
                                        {format(parseISO(rewind.period_start), "MMM d")}
                                        {" – "}
                                        {format(parseISO(rewind.period_end), "MMM d, yyyy")}
                                    </Text>
                                )}
                                <Text className="text-white font-nunito-600 text-base" style={{ lineHeight: 24 }}>
                                    {rewind.summary_text}
                                </Text>
                            </View>
                        ) : (
                            <View
                                className="rounded-[20px] p-6 items-center border border-white/5"
                                style={{ backgroundColor: "#192218", gap: 6 }}
                            >
                                <Text style={{ fontSize: 26 }}>✨</Text>
                                <Text className="text-white/40 font-nunito-700 text-sm text-center">
                                    Weekly Rewind coming soon
                                </Text>
                                <Text
                                    className="font-nunito-600 text-xs text-center"
                                    style={{ color: "rgba(255,255,255,0.2)", lineHeight: 18 }}
                                >
                                    Your AI-generated summary will appear here{"\n"}after your first week of logging.
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* ── PROGRESS PHOTOS ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(300)}
                        className="w-[362px] self-center mt-8"
                    >
                        <Text className="title mb-4">Progress Photos</Text>
                        {progressPhotos.length > 0 ? (
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10, paddingRight: 2 }}
                            >
                                {progressPhotos.map((photo, index) => (
                                    <View
                                        key={photo.id}
                                        style={{
                                            width: 118,
                                            height: 158,
                                            borderRadius: 16,
                                            overflow: "hidden",
                                        }}
                                    >
                                        <Image
                                            source={{ uri: photo.image_url }}
                                            style={{ width: "100%", height: "100%" }}
                                            contentFit="cover"
                                        />
                                        {/* Bottom dim overlay */}
                                        <View
                                            style={{
                                                position: "absolute",
                                                bottom: 0,
                                                left: 0,
                                                right: 0,
                                                height: 64,
                                                backgroundColor: "rgba(0,0,0,0.5)",
                                            }}
                                        />
                                        {/* Number badge */}
                                        <Text
                                            style={{
                                                position: "absolute",
                                                bottom: 6,
                                                left: 8,
                                                fontFamily: "Nunito-900",
                                                fontSize: 30,
                                                color: "rgba(255,255,255,0.45)",
                                                lineHeight: 34,
                                            }}
                                        >
                                            {index + 1}
                                        </Text>
                                        {/* Weight badge */}
                                        {photo.weight != null && (
                                            <View
                                                style={{
                                                    position: "absolute",
                                                    top: 8,
                                                    right: 8,
                                                    backgroundColor: "rgba(18,18,18,0.78)",
                                                    paddingHorizontal: 7,
                                                    paddingVertical: 3,
                                                    borderRadius: 8,
                                                    borderWidth: 1,
                                                    borderColor: "rgba(255,255,255,0.1)",
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: "#fff",
                                                        fontFamily: "Nunito-700",
                                                        fontSize: 11,
                                                    }}
                                                >
                                                    {photo.weight} kg
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </ScrollView>
                        ) : (
                            <View
                                className="rounded-[20px] items-center justify-center p-8"
                                style={{
                                    backgroundColor: "rgba(255,255,255,0.02)",
                                    borderWidth: 1,
                                    borderColor: "rgba(255,255,255,0.08)",
                                    gap: 8,
                                }}
                            >
                                <ImageSquare size={32} color="rgba(255,255,255,0.14)" weight="regular" />
                                <Text className="text-white/30 font-nunito-700 text-sm">
                                    No progress photos yet
                                </Text>
                                <Text
                                    className="font-nunito-600 text-xs text-center"
                                    style={{ color: "rgba(255,255,255,0.18)", lineHeight: 18 }}
                                >
                                    Add photos during onboarding to track{"\n"}your visual progress over time
                                </Text>
                            </View>
                        )}
                    </Animated.View>

                    {/* ── MY EVOLUTION ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(350)}
                        className="w-[362px] self-center mt-8"
                    >
                        <Text className="title mb-4">My Evolution</Text>
                        <View
                            className="bg-dark rounded-[20px] p-5 border border-white/10"
                            style={{
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.2,
                                shadowRadius: 8,
                                elevation: 4,
                            }}
                        >
                            <View className="flex-row items-start justify-between mb-4">
                                {/* Rating */}
                                <View style={{ gap: 2 }}>
                                    <Text className="text-white/40 font-nunito-600 text-xs">Your Rating</Text>
                                    <View className="flex-row items-center gap-2">
                                        <Text
                                            style={{
                                                color: getRatingColor(userProfile?.total_rating),
                                                fontFamily: "Nunito-800",
                                                fontSize: 42,
                                                lineHeight: 48,
                                            }}
                                        >
                                            {userProfile?.total_rating?.toFixed(1) ?? "—"}
                                        </Text>
                                        {userProfile?.total_rating != null && (
                                            userProfile.total_rating >= 4 ? (
                                                <TrendUp
                                                    size={22}
                                                    color={getRatingColor(userProfile.total_rating)}
                                                    weight="bold"
                                                />
                                            ) : (
                                                <TrendDown size={22} color="#CA877E" weight="bold" />
                                            )
                                        )}
                                    </View>
                                    <Text className="text-white/20 font-nunito-600 text-xs">
                                        Based on your progress
                                    </Text>
                                </View>
                                {/* Streak box */}
                                <View
                                    className="items-center justify-center rounded-[16px] px-5 py-3"
                                    style={{
                                        backgroundColor: "rgba(255,107,53,0.08)",
                                        borderWidth: 1,
                                        borderColor: "rgba(255,107,53,0.15)",
                                        gap: 2,
                                    }}
                                >
                                    <Fire size={20} color="#FF6B35" weight="fill" />
                                    <Text className="text-white font-nunito-800 text-2xl">{streak}</Text>
                                    <Text className="text-white/30 font-nunito-600 text-xs">day streak</Text>
                                </View>
                            </View>
                            {/* Graph placeholder */}
                            <View
                                className="rounded-[12px] items-center justify-center"
                                style={{
                                    height: 76,
                                    backgroundColor: "rgba(197,227,132,0.03)",
                                    borderWidth: 1,
                                    borderColor: "rgba(197,227,132,0.1)",
                                }}
                            >
                                <Text
                                    className="font-nunito-600 text-xs"
                                    style={{ color: "rgba(197,227,132,0.3)" }}
                                >
                                    Evolution graph — coming soon
                                </Text>
                            </View>
                        </View>
                    </Animated.View>

                    {/* ── MY CLUBS ── */}
                    <Animated.View
                        entering={FadeInDown.duration(250).delay(400)}
                        className="w-[362px] self-center mt-8 mb-4"
                    >
                        <Text className="title mb-4">My Clubs</Text>
                        <View
                            className="rounded-[20px] items-center justify-center p-8 border border-white/10"
                            style={{
                                backgroundColor: "rgba(255,255,255,0.02)",
                                gap: 10,
                            }}
                        >
                            <Text className="text-white/30 font-nunito-700 text-sm">
                                No clubs joined yet
                            </Text>
                            <TouchableOpacity
                                className="px-5 py-2.5 rounded-full"
                                style={{
                                    backgroundColor: "rgba(132,199,84,0.1)",
                                    borderWidth: 1,
                                    borderColor: "rgba(132,199,84,0.22)",
                                }}
                                activeOpacity={0.25}
                            >
                                <Text
                                    style={{
                                        color: "#84C754",
                                        fontFamily: "Nunito-700",
                                        fontSize: 14,
                                    }}
                                >
                                    Explore Clubs
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>

                </ScrollView>
            </Animated.View>
        </View>
    );
};
export default Profile;
