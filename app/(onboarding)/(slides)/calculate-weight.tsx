import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { Calendar } from "react-native-calendars";
import { Button, CustomSlider, SegmentedControl } from "@/components";
import { useState } from "react";

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
            if (unit === 'lb') {
                setCurrentWeight(Math.round(currentWeight * 2.20462));
                setTargetWeight(Math.round(targetWeight * 2.20462));
            } else {
                setCurrentWeight(Math.round(currentWeight / 2.20462));
                setTargetWeight(Math.round(targetWeight / 2.20462));
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
            <View className="items-center mb-8">
                <Text className="title text-center font-nunito-800 text-white text-4xl">
                    Goal Settings
                </Text>
                <Text className="base-text text-center text-white/50 mt-3">
                    Every journey needs a destination. Set your{" "}
                    <Text className="font-nunito-700 text-pink">target weight</Text> and choose a date on the calendar to see when you'll celebrate your first{" "}
                    <Text className="font-nunito-700 text-yellow">success</Text>.
                </Text>
            </View>
            <View className="w-full gap-8">
                <SegmentedControl
                    options={['kg', 'lb']}
                    selectedValue={weightUnit}
                    onValueChange={toggleUnit}
                    width={200}
                />
                <View>
                    <Text className="title mb-4">Current Weight</Text>
                    <CustomSlider
                        value={currentWeight}
                        minimumValue={minWeight}
                        maximumValue={maxWeight}
                        step={1}
                        onValueChange={setCurrentWeight}
                        trackColor="#C5E384"
                    />
                </View>
                <View>
                    <Text className="title mb-4">Target Weight</Text>
                    <CustomSlider
                        value={targetWeight}
                        minimumValue={minWeight}
                        maximumValue={maxWeight}
                        step={1}
                        onValueChange={setTargetWeight}
                        trackColor="#CA877E"
                    />
                </View>
                <View className="gap-4 w-full mt-2">
                    <Text className="title mb-4">Target Date</Text>
                    <View className="rounded-3xl overflow-hidden border border-white/10 bg-dark">
                        <Calendar
                            minDate={today}
                            onDayPress={(day: any) => setGoalDate(day.dateString)}
                            markedDates={{
                                [today]: {
                                    customStyles: {
                                        container: { backgroundColor: '#C5E384', borderRadius: 8 },
                                        text: { color: '#000', fontFamily: 'Nunito_700Bold' },
                                    },
                                },
                                ...(goalDate && goalDate !== today ? {
                                    [goalDate]: {
                                        customStyles: {
                                            container: { backgroundColor: '#CA877E', borderRadius: 8 },
                                            text: { color: '#000', fontFamily: 'Nunito_700Bold' },
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
                                textDayFontFamily: 'Nunito_600SemiBold',
                                textMonthFontFamily: 'Nunito_700Bold',
                                textDayHeaderFontFamily: 'Nunito_600SemiBold',
                                textDayFontSize: 16,
                                textMonthFontSize: 16,
                                textDayHeaderFontSize: 14,
                            }}
                        />
                    </View>
                </View>
                <View className="gap-4 w-full mt-6">
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
                </View>
            </View>
        </ScrollView>
    );
};
export default CalculateWeight;