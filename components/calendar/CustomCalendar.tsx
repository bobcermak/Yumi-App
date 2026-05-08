import { type FC, useCallback, type ComponentType } from "react";
import { View, Text, Pressable } from "react-native";
import { Calendar, type DateData } from "react-native-calendars";
import { format, isAfter, startOfDay, isSameDay, isBefore } from "date-fns";
import { CaretLeft, CaretRight } from "phosphor-react-native";

type DayState = "disabled" | "selected" | "today" | "";
type DayProps = {
    date: DateData;
    state?: DayState;
    marking?: object;
    onPress?: (date: DateData) => void;
    onLongPress?: (date: DateData) => void;
}

type CustomCalendarProps = {
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    activeDates?: string[];
    targetDate?: string | null;
    minDate?: string | null;
    showStreak?: boolean;
    allowFuture?: boolean;
};
const CustomCalendar: FC<CustomCalendarProps> = ({ selectedDate, onDateSelect, activeDates = [], targetDate, minDate, showStreak = true, allowFuture = false, }) => {
    const today = new Date();
    const targetDateObj = targetDate ? new Date(targetDate) : null;
    const minDateObj = minDate ? startOfDay(new Date(minDate)) : null;

    //Functions
    const renderDay = useCallback(({ date, state }: DayProps) => {
        const dayDate = new Date(date.timestamp);
        const isSelected = isSameDay(dayDate, selectedDate);
        const isTodayDay = isSameDay(dayDate, today);
        const isTarget = targetDateObj ? isSameDay(dayDate, targetDateObj) : false;
        const isActive = activeDates.includes(format(dayDate, "yyyy-MM-dd"));
        const isTooEarly = minDateObj ? isBefore(startOfDay(dayDate), minDateObj) : false;
        const isTooLate = !allowFuture && isAfter(startOfDay(dayDate), startOfDay(today));
        const isDisabled = state === 'disabled' || isTooEarly || isTooLate;
        const isPast = isBefore(startOfDay(dayDate), startOfDay(today));
        const getBgClass = () => {
            if (isTodayDay) return 'bg-yellow';
            if (isSelected) return 'bg-white/20';
            if (isTarget) return 'bg-[#CA877E]';
            return 'bg-transparent';
        };
        const getTextColorClass = () => {
            if (isTodayDay || isTarget) return 'text-dark';
            if (isSelected) return 'text-white';
            if (isDisabled) return 'text-white/20';
            if (isPast) return 'text-white/70';
            return 'text-white';
        };
        return (
            <Pressable
                onPress={() => !isDisabled && onDateSelect(dayDate)}
                hitSlop={8}
                className="items-center justify-center w-10 h-12"
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
                <View
                    className={`w-9 h-9 items-center justify-center rounded-full ${getBgClass()}`}
                    style={(isSelected || isTodayDay || isTarget) ? {
                        shadowColor: isTodayDay ? "#C5E384" : (isTarget ? "#CA877E" : "#FFFFFF"),
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: (isTodayDay || isTarget) ? 0.4 : 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                        borderWidth: isSelected && !isTodayDay ? 1 : 0,
                        borderColor: 'rgba(255,255,255,0.3)',
                    } : {}}
                >
                    <Text className={`text-base font-nunito-600 ${getTextColorClass()}`}>
                        {date.day}
                    </Text>
                </View>
                <View className="h-1 mt-0.5 items-center justify-center">
                    {showStreak && isActive && !isTarget && (
                        <View className={`w-1 h-1 rounded-full ${isTodayDay ? 'bg-dark/40' : 'bg-yellow'}`} />
                    )}
                </View>
            </Pressable>
        );
    }, [selectedDate, onDateSelect, activeDates, targetDateObj, minDateObj, showStreak, allowFuture, today]);
    return (
        <View className="rounded-[20px] overflow-hidden bg-dark">
            <Calendar
                current={format(selectedDate, "yyyy-MM-dd")}
                minDate={minDate || undefined}
                maxDate={!allowFuture ? format(today, "yyyy-MM-dd") : undefined}
                //@ts-ignore
                dayComponent={renderDay as unknown as ComponentType<DayProps>}
                showSixWeeks={true}
                enableSwipeMonths={true}
                renderArrow={(direction: 'left' | 'right') =>
                    direction === 'left'
                        ? <CaretLeft color="#C5E384" size={24} weight="bold" />
                        : <CaretRight color="#C5E384" size={24} weight="bold" />
                }
                theme={{
                    backgroundColor: "transparent",
                    calendarBackground: "transparent",
                    textSectionTitleColor: "#ffffff50",
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
    );
};
export default CustomCalendar;