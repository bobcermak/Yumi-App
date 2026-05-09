import { format, isBefore, startOfDay } from "date-fns";
import { type FC } from "react";
import { Text, View, Pressable } from "react-native";

type CalendarDayProps = {
    date: Date;
    isToday: boolean;
    isActive: boolean;
    isTargetDay?: boolean;
    isSelected?: boolean;
    onPress?: (date: Date) => void;
};
const CalendarDay: FC<CalendarDayProps> = ({ date, isToday, isActive, isTargetDay, isSelected, onPress }) => {
    const dayLabel = format(date, "EEEEE");
    const dayNumber = format(date, "dd");
    const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
    //Functions
    const getBgClass = () => {
        if (isToday) return 'bg-yellow';
        if (isSelected) return 'bg-white/20';
        if (isTargetDay) return 'bg-[#CA877E]';
        return 'bg-transparent';
    };
    const getDayLabelColor = () => {
        if (isSelected || isToday || isTargetDay) return 'text-dark/65';
        if (isPast) return 'text-white/35';
        return 'text-white/65';
    };
    const getDayNumberColor = () => {
        if (isToday || isTargetDay) return 'text-dark';
        if (isSelected) return 'text-white';
        if (isPast) return 'text-white/35';
        return 'text-white';
    };
    return (
        <Pressable 
            onPress={() => onPress?.(date)}
            hitSlop={12}
            className="items-center px-1 h-[80px]"
            style={({ pressed }) => ({
                opacity: pressed ? 0.6 : 1
            })}
        >
            <View
                className={`items-center justify-center rounded-[12px] w-10 h-[64px] ${getBgClass()}`}
                style={(isSelected || isToday || isTargetDay) ? {
                    shadowColor: isToday ? "#C5E384" : (isTargetDay ? "#CA877E" : "#FFFFFF"),
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: (isToday || isTargetDay) ? 0.4 : 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                    borderWidth: isSelected ? 1 : 0,
                    borderColor: 'rgba(255,255,255,0.3)'
                } : {}}
            >
                <Text className={`text-sm font-nunito-800 ${getDayLabelColor()}`}>
                    {dayLabel}
                </Text>
                <Text className={`text-lg font-nunito-800 ${getDayNumberColor()}`}>
                    {dayNumber}
                </Text>
            </View>
            <View className="h-2 absolute bottom-1 items-center justify-center">
                {isActive && !isTargetDay && !isToday && (
                    <View className="w-1.5 h-1.5 rounded-full bg-yellow"/>
                )}
            </View>
        </Pressable>
    );
}
export default CalendarDay;