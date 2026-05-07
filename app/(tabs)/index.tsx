import { Button, CalendarBottomSheet, DailyOverviewCard, HomeHeader, JourneyCalendar, SearchInput, Toast, DailyPulseCard } from "@/components";
import IndexProvider from "@/contexts/IndexContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import BottomSheet from "@gorhom/bottom-sheet";
import { format, isToday } from "date-fns";
import { useRouter, useFocusEffect } from "expo-router";
import { CalendarDots, CaretLeft, CaretRight } from "phosphor-react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const IndexContent = () => {
    //Refs
    const todayCalendarRef = useRef<BottomSheet>(null);
    const journeyCalendarRef = useRef<BottomSheet>(null);
    //Contexts
    const { userProfile } = useAuth();
    const { toast, overviewData, dashboardDate, isDataLoading, handleUpdateCaloriesMax, activeDates, targetDate, setSelectedDate, goToPrevDay, goToNextDay, refreshData } = useIndexContext();
    useFocusEffect(
        useCallback(() => {
            const fetchInitialData = async () => {
                if (userProfile?.id) {
                    await refreshData();
                }
            };
            fetchInitialData();
        }, [userProfile?.id])
    );
    //Hooks
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useSharedValue(1);
    const pageOpacity = useSharedValue(0);
    const insets = useSafeAreaInsets();

    const TAB_BAR_HEIGHT = 148;

    //Router
    const router = useRouter();

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        const start = Date.now();
        await refreshData();
        const elapsed = Date.now() - start;
        const minTime = 1500;
        if (elapsed < minTime) {
            await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
        }
        setRefreshing(false);
    }, [refreshData]);
    //Animations
    useEffect(() => {
        pageOpacity.value = withTiming(1, { duration: 250 });
    }, []);
    useEffect(() => {
        if (isDataLoading) {
            fadeAnim.value = withTiming(0.4, { duration: 150 });
        } else {
            fadeAnim.value = withTiming(1, { duration: 300 });
        }
    }, [isDataLoading]);
    const animatedPageStyle = useAnimatedStyle(() => ({
        opacity: pageOpacity.value,
        flex: 1
    }));
    const animatedCardStyle = useAnimatedStyle(() => ({
        opacity: fadeAnim.value,
        transform: [{ scale: 0.98 + (fadeAnim.value * 0.02) }]
    }));
    //Gestures
    const swipeGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onEnd((e) => {
            if (e.translationX > 50) {
                runOnJS(goToPrevDay)();
            } else if (e.translationX < -50) {
                runOnJS(goToNextDay)();
            }
        });
    const todayButtonLabel = isToday(dashboardDate) ? "Today" : format(dashboardDate, "dd MMM, yyyy");
    return (
        <View className="flex-1">
            <Toast toast={toast} />
            <Animated.View style={animatedPageStyle}>
                <ScrollView 
                    className="mt-[88px] w-[380px] self-center" 
                    showsVerticalScrollIndicator={false} 
                    contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + insets.bottom }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C5E384"/>
                    }
                >
                    <Animated.View entering={FadeInDown.duration(250).delay(100)} className="gap-4">
                        <HomeHeader
                            firstName={userProfile?.full_name?.split(" ")[0] || userProfile?.username || "Friend"}
                            avatarUrl={userProfile?.avatar_url}
                            rating={userProfile?.total_rating}
                            isPremium={userProfile?.is_premium}
                            streakCount={userProfile?.streak_count}
                            onCalendarPress={() => journeyCalendarRef.current?.snapToIndex(0)}
                        />
                        <SearchInput
                            className="w-[362px] self-center"
                            onSearchPress={() => router.push("/(tabs)/search?focus=true")}
                        />
                    </Animated.View>
                <View className="w-[362px] self-center mt-8">
                    <View className="flex-row justify-between items-end">
                        <Text className="title">My Journey</Text>
                        <TouchableOpacity
                            onPress={() => journeyCalendarRef.current?.snapToIndex(0)}
                            className="pl-4 pt-2"
                            activeOpacity={0.25}
                        >
                            <CalendarDots size={24} color="#FFFFFF80" weight="regular" />
                        </TouchableOpacity>
                    </View>
                    <JourneyCalendar
                        activeDates={activeDates}
                        targetDate={targetDate}
                        selectedDate={overviewData.date}
                        onSelectDate={setSelectedDate}
                    />
                </View>
                    <Animated.View entering={FadeInDown.duration(250).delay(200)} className="w-[362px] self-center mt-8">
                        <View className="flex-row justify-between items-end">
                            <Button
                                onPress={() => todayCalendarRef.current?.snapToIndex(0)}
                                icon={<CalendarDots size={20} color="#1D1D1D" weight="regular" />}
                            >
                                {todayButtonLabel}
                            </Button>
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={goToPrevDay}
                                    className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                >
                                    <CaretLeft size={20} color="white" weight="regular" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={goToNextDay}
                                    className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                                >
                                    <CaretRight size={20} color="white" weight="regular" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        <GestureDetector gesture={swipeGesture}>
                            <Animated.View style={animatedCardStyle}>
                                <DailyOverviewCard
                                    date={dashboardDate}
                                    calories={overviewData.calories}
                                    macros={overviewData.macros}
                                    onUpdateCaloriesMax={handleUpdateCaloriesMax}
                                />
                            </Animated.View>
                        </GestureDetector>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.duration(250).delay(300)} className="w-[362px] self-center mt-8">
                        <Text className="title mb-4">Daily Pulse</Text>
                        <DailyPulseCard 
                            streak={userProfile?.streak_count || 0}
                            protein={overviewData.macros.protein}
                            carbs={overviewData.macros.carbs}
                            fats={overviewData.macros.fats}
                        />
                    </Animated.View>
            </ScrollView>
            </Animated.View>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} pointerEvents="box-none">
                <CalendarBottomSheet
                    ref={todayCalendarRef}
                    selectedDate={overviewData.date}
                    onDateSelect={setSelectedDate}
                    activeDates={activeDates}
                    targetDate={targetDate}
                    minDate={userProfile?.start_date}
                    showStreak={false}
                    allowFuture={false}
                />
                <CalendarBottomSheet
                    ref={journeyCalendarRef}
                    selectedDate={overviewData.date}
                    onDateSelect={setSelectedDate}
                    activeDates={activeDates}
                    targetDate={targetDate}
                    minDate={userProfile?.start_date}
                    showStreak={true}
                    allowFuture={true}
                />
            </View>
        </View>
    );
};
const Index = () => {
    return (
        <IndexProvider>
            <IndexContent />
        </IndexProvider>
    );
};
export default Index;