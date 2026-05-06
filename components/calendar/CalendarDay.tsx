import { type FC } from "react";
import { View, Text } from "react-native";
import { format, isBefore, startOfDay } from "date-fns";

type CalendarDayProps = {
    date: Date;
    isToday: boolean;
    isActive: boolean;
    isTargetDay?: boolean;
};
const CalendarDay: FC<CalendarDayProps> = ({ date, isToday, isActive, isTargetDay }) => {
    const dayLabel = format(date, "EEEEE");
    const dayNumber = format(date, "dd");
    const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
    //Functions
    const getBgClass = () => {
        if (isToday) return 'bg-yellow';
        if (isTargetDay) return 'bg-[#CA877E]';
        return 'bg-transparent';
    };
    const getDayLabelColor = () => {
        if (isToday || isTargetDay) return 'text-dark/65';
        if (isPast) return 'text-white/35';
        return 'text-white/65';
    };
    const getDayNumberColor = () => {
        if (isToday || isTargetDay) return 'text-dark';
        if (isPast) return 'text-white/35';
        return 'text-white';
    };
    return (
        <View className="items-center">
            <View 
                className={`items-center justify-center rounded-[10px] px-[6px] py-1 ${getBgClass()}`}
                style={(isToday || isTargetDay) ? {
                    shadowColor: isToday ? "#C5E384" : "#CA877E",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                } : {}}
            >
                <Text className={`text-sm font-nunito-800 ${getDayLabelColor()}`}>
                    {dayLabel}
                </Text>
                <Text className={`text-lg font-nunito-800 ${getDayNumberColor()}`}>
                    {dayNumber}
                </Text>
            </View>
            <View className="h-1.5 mt-1 items-center justify-center">
                {isActive && !isToday && !isTargetDay && (
                    <View className="w-1.5 h-1.5 rounded-full bg-yellow"/>
                )}
            </View>
        </View>
    );
}
export default CalendarDay;