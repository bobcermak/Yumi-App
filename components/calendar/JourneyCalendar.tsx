import { useState, useMemo, type FC } from "react";
import { View } from "react-native";
import { startOfWeek, addDays, isSameDay, subWeeks, addWeeks } from "date-fns";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, runOnJS, withTiming } from "react-native-reanimated";
import CalendarHeader from "./CalendarHeader";
import CalendarDay from "./CalendarDay";

type JourneyCalendarProps = {
    activeDates?: string[];
};
const JourneyCalendar: FC<JourneyCalendarProps> = ({ activeDates = [] }) => {
    //Hooks
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const today = new Date();

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
            <View style={{ overflow: 'hidden' }}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={animatedStyle} className="flex-row justify-between items-center">
                        {weekDays.map((date, index) => (
                            <CalendarDay 
                                key={index}
                                date={date}
                                isToday={isSameDay(date, today)}
                                isActive={activeDates.some(d => isSameDay(new Date(d), date))}
                            />
                        ))}
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
};
export default JourneyCalendar;