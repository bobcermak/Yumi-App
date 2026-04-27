import { View, Text, ScrollView } from "react-native";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { Calendar } from "react-native-calendars";
import { Button, CustomSlider, SegmentedControl } from "@/components";
import { useState } from "react";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight, FadeIn } from "react-native-reanimated";

const CalculateWeight = () => {
    //Context
    const { currentWeight, setCurrentWeight, targetWeight, setTargetWeight, weightUnit, setWeightUnit, goalDate, setGoalDate, handleContinue } = useOnboarding();
    //Hooks
    const [error, setError] = useState<string>("");

    //Calculations
    const minWeight = weightUnit === 'kg' ? 15 : 33;
    const maxWeight = weightUnit === 'kg' ? 200 : 440;
    const today = new Date().toISOString().split('T')[0];
    //Functions
    const toggleUnit = (unit: 'kg' | 'lb') => {
        if (unit !== weightUnit) {
            setWeightUnit(unit);
            const newMin = unit === 'kg' ? 15 : 33;
            const newMax = unit === 'kg' ? 200 : 440;
            if (unit === 'lb') {
                setCurrentWeight(Math.max(newMin, Math.min(newMax, Math.round(currentWeight * 2.20462))));
                setTargetWeight(Math.max(newMin, Math.min(newMax, Math.round(targetWeight * 2.20462))));
            } else {
                setCurrentWeight(Math.max(newMin, Math.min(newMax, Math.round(currentWeight / 2.20462))));
                setTargetWeight(Math.max(newMin, Math.min(newMax, Math.round(targetWeight / 2.20462))));
            }
        }
    };
    const onContinue = () => {
        if (!goalDate) {
            setError("Please select a target date.");
            return;
        }
        if (targetWeight === currentWeight) {
            setError("Target weight must be different from current weight.");
            return;
        }
        setError("");
        handleContinue();
    };
    return (
        <ScrollView
            contentContainerClassName="items-center pb-16 pt-8"
            className="w-[360px] self-center"
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
                    <Text className="font-nunito-700 text-pink">target weight</Text> and choose a date on the calendar to see when you'll celebrate your first{" "}
                    <Text className="font-nunito-700 text-yellow">success</Text>.
                </Text>
            </Animated.View>
            <View className="w-full gap-12">
                <Animated.View entering={FadeIn.delay(300).duration(250)}>
                    <SegmentedControl
                        options={['kg', 'lb']}
                        selectedValue={weightUnit}
                        onValueChange={toggleUnit}
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
                    />
                </Animated.View>

                <Animated.View 
                    entering={FadeInUp.delay(600).duration(250)}
                    className="gap-4 w-full"
                >
                    <Text className="text-2xl font-nunito-700 text-white text-center mb-0">Target Date</Text>
                    <View className="rounded-[20px] overflow-hidden border border-white/10 bg-dark">
                        <Calendar
                            minDate={today}
                            onDayPress={(day: any) => setGoalDate(day.dateString)}
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
                    </View>
                </Animated.View>
                
                <Animated.View 
                    entering={FadeInUp.delay(700).duration(250)}
                    className="gap-4 w-full"
                >
                    <Button
                        className="rounded-[30px] mx-0 w-full py-5"
                        textClassName="text-xl"
                        onPress={onContinue}
                        disabled={!goalDate}
                    >
                        Continue
                    </Button>
                    {error ? (
                        <Text className="text-pink text-center font-nunito-600 text-sm">{error}</Text>
                    ) : null}
                </Animated.View>
            </View>
        </ScrollView>
    );
};
export default CalculateWeight;