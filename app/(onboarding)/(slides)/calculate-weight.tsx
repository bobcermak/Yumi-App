import { Button, CustomSlider, SegmentedControl } from "@/components";
import { getTodayString } from "@/lib/helpers/dateHelpers";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import * as Haptics from "expo-haptics";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import Animated, { FadeIn, FadeInDown, FadeInLeft, FadeInRight, FadeInUp, interpolateColor, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from "react-native-reanimated";

const CalculateWeight = () => {
    //Context
    const { currentWeight, setCurrentWeight, targetWeight, setTargetWeight, weightUnit, toggleWeightUnit, goalDate, setGoalDate, handleContinue } = useOnboarding();
    //Hooks
    const [error,] = useState<string>("");
    const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);
    const [calendarKey, setCalendarKey] = useState(0);
    const shake = useSharedValue(0);
    const borderColor = useSharedValue(0);
    const warningOpacity = useSharedValue(0);

    //Calculations
    const minWeight = weightUnit === 'KG' ? 15 : 33;
    const maxWeight = weightUnit === 'KG' ? 200 : 440;
    const today = getTodayString();
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
    const handleDateSelect = (day: DateData) => {
        const wasClamped = setGoalDate(day.dateString);
        if (wasClamped) {
            triggerWarning();
            setCalendarKey(prev => prev + 1);
        }
    };
    return (
        <View className="w-[362px] self-center h-full">
            <ScrollView
                scrollEnabled={scrollEnabled}
                contentContainerClassName="items-center pb-40 pt-8"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeInDown.delay(200).duration(250)}
                    className="items-center mb-12"
                >
                    <Text className="title text-center font-nunito-800 text-white text-4xl">
                        Goal Settings
                    </Text>
                    <Text className="base-text text-center text-white/50 mt-3">
                        Every journey needs a destination. Set your{" "}
                        <Text className="font-nunito-700 text-pink">target weight</Text> and choose a date on the calendar to see when you&apos;ll celebrate your first{" "}
                        <Text className="font-nunito-700 text-yellow">success</Text>.
                    </Text>
                </Animated.View>
                <View className="w-full gap-12">
                    <Animated.View entering={FadeIn.delay(300).duration(250)}>
                        <SegmentedControl
                            options={['KG', 'LB']}
                            selectedValue={weightUnit}
                            onValueChange={toggleWeightUnit}
                            width={200}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInLeft.delay(400).duration(250)}>
                        <Text className="text-2xl font-nunito-700 text-white text-center mb-4">Current Weight</Text>
                        <CustomSlider
                            value={currentWeight}
                            minimumValue={minWeight}
                            maximumValue={maxWeight}
                            step={1}
                            onValueChange={setCurrentWeight}
                            trackColor="#C5E384"
                            unit={weightUnit}
                            onSlidingStart={() => setScrollEnabled(false)}
                            onSlidingComplete={() => setScrollEnabled(true)}
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInRight.delay(500).duration(250)}>
                        <Text className="text-2xl font-nunito-700 text-white text-center mb-4">Target Weight</Text>
                        <CustomSlider
                            value={targetWeight}
                            minimumValue={minWeight}
                            maximumValue={maxWeight}
                            step={1}
                            onValueChange={setTargetWeight}
                            trackColor="#CA877E"
                            unit={weightUnit}
                            onSlidingStart={() => setScrollEnabled(false)}
                            onSlidingComplete={() => setScrollEnabled(true)}
                        />
                    </Animated.View>
                    <Animated.View
                        entering={FadeInUp.delay(600).duration(250)}
                        className="gap-4 w-full"
                    >
                        <Text className="text-2xl font-nunito-700 text-white text-center mb-0">Target Date</Text>
                        <Animated.View style={[animatedStyle, { borderWidth: 1 }]} className="rounded-[20px] overflow-hidden bg-dark">
                            <Calendar
                                key={`cal-${calendarKey}`}
                                current={goalDate || today}
                                minDate={today}
                                onDayPress={handleDateSelect}
                                renderArrow={(direction) => direction === 'left' ? <CaretLeft color="#C5E384" size={24} weight="bold" /> : <CaretRight color="#C5E384" size={24} weight="bold" />}
                                markedDates={{
                                    [today]: {
                                        customStyles: {
                                            container: { backgroundColor: '#C5E384', borderRadius: 100 },
                                            text: { color: '#000', fontFamily: 'Nunito-700' },
                                        },
                                    },
                                    ...(goalDate && goalDate !== today ? {
                                        [goalDate]: {
                                            customStyles: {
                                                container: { backgroundColor: '#CA877E', borderRadius: 100 },
                                                text: { color: '#000', fontFamily: 'Nunito-700' },
                                            }
                                        }
                                    } : {}),
                                }}
                                markingType="custom"
                                theme={{
                                    backgroundColor: 'transparent',
                                    calendarBackground: 'transparent',
                                    textSectionTitleColor: '#ffffff50',
                                    selectedDayBackgroundColor: '#CA877E',
                                    selectedDayTextColor: '#000000',
                                    todayTextColor: '#000',
                                    dayTextColor: '#ffffff',
                                    textDisabledColor: '#ffffff20',
                                    dotColor: '#CA877E',
                                    selectedDotColor: '#ffffff',
                                    arrowColor: '#C5E384',
                                    monthTextColor: '#ffffff',
                                    indicatorColor: '#C5E384',
                                    textDayFontFamily: 'Nunito-600',
                                    textMonthFontFamily: 'Nunito-800',
                                    textMonthFontWeight: '800',
                                    textDayHeaderFontFamily: 'Nunito-600',
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
                </View>
            </ScrollView>
            <Animated.View
                entering={FadeInUp.delay(700).duration(250)}
                className="gap-4 w-full absolute bottom-16 left-0 right-0"
            >
                <Button
                    className="rounded-[30px] mx-0 w-full py-5"
                    textClassName="text-xl"
                    onPress={handleContinue}
                    disabled={!goalDate}
                >
                    Continue
                </Button>
                {error ? (
                    <Text className="text-pink text-center font-nunito-600 text-sm">{error}</Text>
                ) : null}
            </Animated.View>
        </View>
    );
};
export default CalculateWeight;