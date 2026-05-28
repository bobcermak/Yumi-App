import { Button, CalendarBottomSheet, DailyOverviewCard, HomeHeader, JourneyCalendar, SearchInput, DailyPulseCard, Icon, WaterTracker } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { getEffectiveStreak } from "@/lib/services/supabase/queries/profiles";
import BottomSheet from "@gorhom/bottom-sheet";
import { format, isToday, isBefore, isSameDay } from "date-fns";
import { useRouter, useFocusEffect } from "expo-router";
import { CalendarDots, CaretLeft, CaretRight } from "phosphor-react-native";
import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Home = () => {
    //Refs
    const todayCalendarRef = useRef<BottomSheet>(null);
    const journeyCalendarRef = useRef<BottomSheet>(null);
    //Contexts
    const { userProfile } = useAuth();
    const { overviewData, dashboardDate, handleUpdateCaloriesMax, activeDates, targetDate, setSelectedDate, goToPrevDay, goToNextDay, refreshData, refreshKey, waterMl, waterGoalMl, handleSetWater, mealLogs } = useIndexContext();
    
    useFocusEffect(
        useCallback(() => {
            const fetchInitialData = async () => {
                if (userProfile?.id) {
                    await refreshData();
                }
            };
            fetchInitialData();
        }, [userProfile?.id, refreshData])
    );
    //Hooks
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const pageOpacity = useSharedValue<number>(0);
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
    }, [pageOpacity]);
    const animatedPageStyle = useAnimatedStyle(() => ({
        opacity: pageOpacity.value,
        flex: 1
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
    const isNextDisabled = isToday(dashboardDate);
    const isPrevDisabled = userProfile?.start_date 
        ? isBefore(dashboardDate, new Date(userProfile.start_date)) || isSameDay(dashboardDate, new Date(userProfile.start_date))
        : false;
    const todayButtonLabel = isToday(dashboardDate) ? "Today" : format(dashboardDate, "dd MMM, yyyy");
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
                    <Animated.View key={`header-${refreshKey}`} entering={FadeInDown.duration(250).delay(100)} className="gap-4">
                        <HomeHeader
                            firstName={userProfile?.full_name?.split(" ")[0] || userProfile?.username || "Friend"}
                            avatarUrl={userProfile?.avatar_url}
                            rating={userProfile?.total_rating}
                            isPremium={userProfile?.is_premium}
                            streakCount={userProfile?.streak_count}
                            lastLogDate={userProfile?.last_log_date}
                            onCalendarPress={() => journeyCalendarRef.current?.snapToIndex(0)}
                        />
                        <SearchInput
                            className="w-[362px] self-center"
                            onSearchPress={() => router.push("/(tabs)/search?focus=true")}
                        />
                    </Animated.View>
                    <Animated.View key={`journey-section-${refreshKey}`} entering={FadeInDown.duration(250).delay(150)} className="w-[362px] self-center mt-8">
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
                    </Animated.View>
                    <Animated.View key={`overview-${refreshKey}`} entering={FadeInDown.duration(250).delay(250)} className="w-[362px] self-center mt-8">
                        <View className="flex-row justify-between items-end">
                            <Button
                                onPress={() => todayCalendarRef.current?.snapToIndex(0)}
                                icon={<CalendarDots size={20} color="#1D1D1D" weight="regular" />}
                            >
                                {todayButtonLabel}
                            </Button>
                            <View className="flex-row gap-2">
                                <Icon
                                    onPress={goToPrevDay}
                                    disabled={isPrevDisabled}
                                    className={`bg-white/20 ${isPrevDisabled ? "opacity-20" : "opacity-100"}`}
                                    shadowColor="transparent"
                                >
                                    <CaretLeft size={20} color="white" weight="regular" />
                                </Icon>
                                <Icon
                                    onPress={goToNextDay}
                                    disabled={isNextDisabled}
                                    className={`bg-white/20 ${isNextDisabled ? "opacity-20" : "opacity-100"}`}
                                    shadowColor="transparent"
                                >
                                    <CaretRight size={20} color="white" weight="regular" />
                                </Icon>
                            </View>
                        </View>
                        <GestureDetector gesture={swipeGesture}>
                            <View>
                                <DailyOverviewCard
                                    date={dashboardDate}
                                    calories={overviewData.calories}
                                    macros={overviewData.macros}
                                    onUpdateCaloriesMax={handleUpdateCaloriesMax}
                                />
                            </View>
                        </GestureDetector>
                    </Animated.View>
                    <Animated.View key={`water-${refreshKey}`} entering={FadeInDown.duration(250).delay(320)} className="w-[362px] self-center mt-8">
                        <WaterTracker
                            waterMl={waterMl}
                            goalMl={waterGoalMl}
                            onSetWater={handleSetWater}
                        />
                    </Animated.View>
                    <Animated.View key={`pulse-${refreshKey}`} entering={FadeInDown.duration(250).delay(400)} className="w-[362px] self-center mt-8">
                        <Text className="title mb-4">Daily Pulse</Text>
                        <DailyPulseCard
                            streak={getEffectiveStreak(userProfile?.streak_count, userProfile?.last_log_date)}
                            protein={overviewData.macros.protein}
                            carbs={overviewData.macros.carbs}
                            fats={overviewData.macros.fats}
                            rating={(() => {
                                const rated = mealLogs.filter(m => m.rating !== null && m.rating !== undefined);
                                return rated.length > 0
                                    ? Math.round((rated.reduce((s, m) => s + m.rating!, 0) / rated.length) * 10) / 10
                                    : null;
                            })()}
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
                    showStreak={true}
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
export default Home;