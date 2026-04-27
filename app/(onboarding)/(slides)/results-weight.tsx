import { View, Text, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { Button } from "@/components";
import { Calendar } from "react-native-calendars";
import { PencilSimple } from "phosphor-react-native";
import { useState, useEffect, useMemo } from "react";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { daysUntil } from "@/lib/helpers/onBoardingHelpers";
import { MIN_CALORIES } from "@/lib/helpers/onBoardingHelpers";

const ResultsWeight = () => {
    //Context
    const { dailyCalories, setDailyCalories, goalDate, setGoalDate, handleContinue } = useOnboarding();
    //Hooks
    const [isEditing, setIsEditing] = useState(false);
    const [localInput, setLocalInput] = useState(dailyCalories.toString());

    useEffect(() => {
        if (!isEditing) setLocalInput(dailyCalories.toString());
    }, [dailyCalories, isEditing]);
    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);
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
    const handleCalorieBlur = () => {
        setIsEditing(false);
        setLocalInput(dailyCalories.toString());
    };
    const handleDateSelect = (day: { dateString: string }) => {
        setGoalDate(day.dateString);
    };
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            className="flex-1"
        >
            <ScrollView
                contentContainerClassName="items-center pb-16 pt-8"
                className="w-[360px] self-center"
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
                        We've optimised your intake for{" "}
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
                                        const finalVal = Math.max(n, MIN_CALORIES); 
                                        setDailyCalories(finalVal);
                                        setLocalInput(finalVal.toString());
                                    }
                                    setIsEditing(false);
                                }}
                                keyboardType="numeric"
                                autoFocus
                                textAlignVertical="center"
                                className="text-white text-8xl font-nunito-800 min-w-[200px] text-center"
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
                                    className="text-white text-8xl font-nunito-800"
                                    style={{ lineHeight: 96, height: 125 }}
                                >
                                    {dailyCalories}
                                </Text>
                                <View className="opacity-50 absolute -right-8 top-[37.5%]">
                                    <PencilSimple size={24} color="#ffffff" weight="regular"/>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                    <Text className="text-white/50 font-nunito-700 text-xl tracking-widest -mt-8">
                        Cal Per Day
                    </Text>
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
                    <View className="rounded-[20px] overflow-hidden border border-white/10 bg-dark">
                        <Calendar
                            minDate={todayStr}
                            onDayPress={handleDateSelect}
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
                    </View>
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.delay(800).duration(250)}
                    className="w-full mt-10"
                >
                    <Button
                        className="rounded-[30px] mx-0 w-full py-5"
                        textClassName="text-xl"
                        onPress={handleContinue}
                    >
                        Looks Great!
                    </Button>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};
export default ResultsWeight;