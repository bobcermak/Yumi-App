import { Button } from "@/components";
import { getTodayString } from "@/lib/helpers/dateHelpers";
import { daysUntil } from "@/lib/helpers/onBoardingHelpers";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import * as Haptics from "expo-haptics";
import { CaretLeft, CaretRight, PencilSimple } from "phosphor-react-native";
import { useEffect, useMemo, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import Animated, { FadeInDown, FadeInUp, ZoomIn, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

const ResultsWeight = () => {
    //Context
    const { dailyCalories, setDailyCalories, goalDate, setGoalDate, handleContinue } = useOnboarding();
    //Hooks
    const [isEditing, setIsEditing] = useState(false);
    const [localInput, setLocalInput] = useState(dailyCalories.toString());
    const [calendarKey, setCalendarKey] = useState(0);

    useEffect(() => {
        if (dailyCalories < 600 || dailyCalories > 8000) {
            const clamped = Math.min(8000, Math.max(dailyCalories, 600));
            setDailyCalories(clamped);
        }
    }, [dailyCalories]);
    useEffect(() => {
        if (!isEditing) setLocalInput(dailyCalories.toString());
    }, [dailyCalories, isEditing]);
    const todayStr = useMemo(() => getTodayString(), []);
    const calculatedDays = useMemo(() => {
        if (!goalDate) return 0;
        return daysUntil(goalDate);
    }, [goalDate]);
    //Functions
    const handleCalorieChange = (val: string) => {
        const cleaned = val.replace(/[^0-9]/g, "");
        setLocalInput(cleaned);
        const n = parseInt(cleaned, 10);
        if (!isNaN(n)) setDailyCalories(n);
    };
    const handleDateSelect = (day: { dateString: string }) => {
        const wasClamped = setGoalDate(day.dateString);
        if (wasClamped) {
            triggerWarning();
            setCalendarKey(prev => prev + 1);
        }
    };
    const shake = useSharedValue(0);
    const borderColor = useSharedValue(0);
    const warningOpacity = useSharedValue(0);
    const triggerWarning = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        warningOpacity.value = withSequence(
            withTiming(1, { duration: 300 }),
            withDelay(3000, withTiming(0, { duration: 500 }))
        );
        shake.value = withSequence(
            withTiming(10, { duration: 50 }),
            withTiming(-10, { duration: 50 }),
            withTiming(10, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
        borderColor.value = withSequence(
            withTiming(1, { duration: 200 }),
            withTiming(0, { duration: 1000 })
        );
    };
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: shake.value }],
            borderColor: interpolateColor(
                borderColor.value,
                [0, 1],
                ['rgba(255, 255, 255, 0.1)', '#CA877E']
            )
        };
    });
    const textStyle = useAnimatedStyle(() => {
        return { opacity: warningOpacity.value };
    });
    const isLowCalories = dailyCalories < 1200;
    const isHighCalories = dailyCalories > 5000;
    const isWarning = isLowCalories || isHighCalories;
    const textColorClass = isWarning ? "text-pink" : "text-white";
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1 w-[362px] self-center h-full"
        >
            <ScrollView
                contentContainerClassName="items-center pb-40 pt-8"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInDown.delay(200).duration(250)}
                    className="items-center mb-10"
                >
                    <Text className="title text-center font-nunito-800 text-white text-4xl">
                        Daily Goal
                    </Text>
                    <Text className="base-text text-center text-white/50 mt-3">
                        We&apos;ve optimised your intake for{" "}
                        <Text className="font-nunito-700 text-yellow">maximum efficiency</Text>
                    </Text>
                </Animated.View>
                <Animated.View
                    entering={ZoomIn.delay(400).duration(250)}
                    className="items-center mb-12"
                >
                    <View className="flex-row items-center gap-4">
                        {isEditing ? (
                            <TextInput
                                value={localInput}
                                onChangeText={handleCalorieChange}
                                onBlur={() => {
                                    const n = parseInt(localInput, 10);
                                    if (!isNaN(n)) {
                                        setDailyCalories(n);
                                        setCalendarKey(prev => prev + 1);
                                    } else {
                                        setLocalInput(dailyCalories.toString());
                                    }
                                    setIsEditing(false);
                                }}
                                keyboardType="numeric"
                                autoFocus
                                textAlignVertical="center"
                                className={`${textColorClass} text-8xl font-nunito-800 min-w-[200px] text-center`}
                                style={{ includeFontPadding: false, lineHeight: 96, height: 120 }}
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={() => {
                                    setLocalInput(dailyCalories.toString());
                                    setIsEditing(true);
                                }}
                                className="items-center"
                            >
                                <Text
                                    className={`${textColorClass} text-8xl font-nunito-800`}
                                    style={{ lineHeight: 96, height: 125 }}
                                >
                                    {dailyCalories}
                                </Text>
                                <View className="opacity-50 absolute -right-8 top-[37.5%]">
                                    <PencilSimple size={24} color="#ffffff" weight="regular" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text className="text-white/50 font-nunito-700 text-xl tracking-widest -mt-8">
                        Cal Per Day
                    </Text>
                    {isLowCalories && (
                        <Text className="text-pink text-center font-nunito-600 mt-4 px-6 text-sm">
                            <Text className="font-nunito-800">WARNING:</Text> Eating less than 1,200 calories per day can be dangerous to your health and metabolism. Please consult a doctor.
                        </Text>
                    )}
                    {isHighCalories && (
                        <Text className="text-pink text-center font-nunito-600 mt-4 px-6 text-sm">
                            <Text className="font-nunito-800">WARNING:</Text> Consuming over 5,000 calories per day is extreme and may lead to rapid, unhealthy weight gain.
                        </Text>
                    )}
                    {!isWarning && (
                        <Text className="text-yellow text-center font-nunito-600 mt-4 px-6 text-sm">
                            <Text className="font-nunito-800">OPTIMAL:</Text> This target promotes a normal, healthy diet, making your journey much easier to sustain and manage.
                        </Text>
                    )}
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.delay(600).duration(250)}
                    className="w-full gap-4"
                >
                    <View className="flex-row justify-between items-end">
                        <Text className="title">Target Date</Text>
                        <View className="flex-row items-baseline gap-1">
                            <Text className="text-yellow font-nunito-800 text-xl">
                                {calculatedDays}
                            </Text>
                            <Text className="text-white/50 font-nunito-600 text-base">days left</Text>
                        </View>
                    </View>
                    <Animated.View style={[animatedStyle, { borderWidth: 1 }]} className="rounded-[20px] overflow-hidden bg-dark">
                        <Calendar
                            key={`cal-${calendarKey}`}
                            current={goalDate || todayStr}
                            minDate={todayStr}
                            onDayPress={handleDateSelect}
                            renderArrow={(direction) => direction === 'left' ? <CaretLeft color="#C5E384" size={24} weight="bold" /> : <CaretRight color="#C5E384" size={24} weight="bold" />}
                            markedDates={{
                                [todayStr]: {
                                    customStyles: {
                                        container: { backgroundColor: "#C5E384", borderRadius: 100 },
                                        text: { color: "#000", fontFamily: "Nunito-700" },
                                    },
                                },
                                ...(goalDate && goalDate !== todayStr
                                    ? {
                                        [goalDate]: {
                                            customStyles: {
                                                container: { backgroundColor: "#CA877E", borderRadius: 100 },
                                                text: { color: "#000", fontFamily: "Nunito-700" },
                                            },
                                        },
                                    }
                                    : {}),
                            }}
                            markingType="custom"
                            theme={{
                                backgroundColor: "transparent",
                                calendarBackground: "transparent",
                                textSectionTitleColor: "#ffffff50",
                                selectedDayBackgroundColor: "#CA877E",
                                selectedDayTextColor: "#000000",
                                todayTextColor: "#000",
                                dayTextColor: "#ffffff",
                                textDisabledColor: "#ffffff20",
                                arrowColor: "#C5E384",
                                monthTextColor: "#ffffff",
                                textDayFontFamily: "Nunito-600",
                                textMonthFontFamily: "Nunito-800",
                                textMonthFontWeight: "800",
                                textDayHeaderFontFamily: "Nunito-600",
                                textDayFontSize: 16,
                                textMonthFontSize: 20,
                                textDayHeaderFontSize: 14,
                            }}
                        />
                    </Animated.View>
                    <Animated.Text style={textStyle} className="text-pink text-center font-nunito-600 text-sm -mt-2">
                        This timeframe is too short. We adjusted it to a safe timeline.
                    </Animated.Text>
                </Animated.View>
            </ScrollView>
            <Animated.View
                entering={FadeInUp.delay(800).duration(250)}
                className="w-full absolute bottom-16 left-0 right-0"
            >
                <Button
                    className="rounded-[30px] mx-0 w-full py-5"
                    textClassName="text-xl"
                    onPress={handleContinue}
                >
                    Looks Great!
                </Button>
            </Animated.View>
        </KeyboardAvoidingView>
    );
};
export default ResultsWeight;