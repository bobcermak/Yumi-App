import { useState, useMemo, useEffect, type FC } from "react";
import { View } from "react-native";
import { startOfWeek, addDays, isSameDay, subWeeks, addWeeks, format } from "date-fns";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, withTiming } from "react-native-reanimated";
import CalendarHeader from "./CalendarHeader";
import CalendarDay from "./CalendarDay";

type JourneyCalendarProps = {
    activeDates?: string[];
    targetDate?: string | null;
    selectedDate?: Date;
    onSelectDate?: (date: Date) => void;
};
const JourneyCalendar: FC<JourneyCalendarProps> = ({ activeDates = [], targetDate, selectedDate, onSelectDate }) => {
    //Hooks
    const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date());
    const [internalSelectedDate, setInternalSelectedDate] = useState<Date | undefined>(selectedDate);
    const today = new Date();
    const targetDateObj = targetDate ? new Date(targetDate) : null;

    useEffect(() => {
        if (selectedDate) {
            setInternalSelectedDate(selectedDate);
            const currentWeekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
            const newWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
            if (!isSameDay(currentWeekStart, newWeekStart)) {
                setCurrentDate(selectedDate);
            }
        }
    }, [selectedDate]);
    //Animations
    const translateX = useSharedValue(0);
    const opacity = useSharedValue(1);
    //Functions
    const weekDays = useMemo(() => {
        const start = startOfWeek(currentDate, { weekStartsOn: 1 });
        return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
    }, [currentDate]);
    const updateDate = (direction: 'prev' | 'next') => {
        setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    };
    const animateWeekChange = (direction: 'prev' | 'next') => {
        'worklet';
        const outValue = direction === 'prev' ? 30 : -30;
        const inValue = direction === 'prev' ? -30 : 30;
        opacity.value = withTiming(0, { duration: 100 });
        translateX.value = withTiming(outValue, { duration: 125 }, (finished) => {
            if (finished) {
                runOnJS(updateDate)(direction);
                translateX.value = inValue;
                opacity.value = withTiming(1, { duration: 125 });
                translateX.value = withSpring(0, { damping: 80, stiffness: 250 });
            }
        });
    };
    //Gestures
    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((e) => {
            translateX.value = e.translationX * 0.2;
            opacity.value = 1 - Math.abs(e.translationX) / 200;
        })
        .onEnd((e) => {
            if (e.translationX > 50) {
                animateWeekChange('prev');
            } else if (e.translationX < -50) {
                animateWeekChange('next');
            } else {
                translateX.value = withSpring(0);
                opacity.value = withSpring(1);
            }
        });
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        opacity: opacity.value
    }));
    return (
        <View 
            className="bg-white/5 border border-white/10 rounded-[20px] p-6 mt-4 gap-4"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5
            }}
        >
            <CalendarHeader 
                currentDate={currentDate} 
                onPrev={() => animateWeekChange('prev')} 
                onNext={() => animateWeekChange('next')} 
            />
            <View className="overflow-hidden h-[88px] justify-center">
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={animatedStyle} className="flex-row justify-between items-center">
                        {weekDays.map((date, index) => (
                            <CalendarDay 
                                key={index}
                                date={date}
                                isToday={isSameDay(date, today)}
                                isActive={activeDates.includes(format(date, "yyyy-MM-dd"))}
                                isTargetDay={targetDateObj ? isSameDay(date, targetDateObj) : false}
                                isSelected={internalSelectedDate ? isSameDay(date, internalSelectedDate) : false}
                                onPress={(d) => {
                                    setInternalSelectedDate(d);
                                    onSelectDate?.(d);
                                }}
                            />
                        ))}
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
};
export default JourneyCalendar;