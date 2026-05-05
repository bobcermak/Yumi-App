import { type FC } from "react";
import { View, Text } from "react-native";
import { format, isBefore, startOfDay } from "date-fns";

type CalendarDayProps = {
    date: Date;
    isToday: boolean;
    isActive: boolean;
};
const CalendarDay: FC<CalendarDayProps> = ({ date, isToday, isActive }) => {
    const dayLabel = format(date, "EEEEE");
    const dayNumber = format(date, "dd");
    const isPast = isBefore(startOfDay(date), startOfDay(new Date()));
    return (
        <View className="items-center">
            <View 
                className={`items-center justify-center rounded-[10px] px-[6px] py-1 ${isToday ? 'bg-yellow' : 'bg-transparent'}`}
                style={isToday ? {
                    shadowColor: "#C5E384",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 5
                } : {}}
            >
                <Text 
                    className={`text-sm font-nunito-800 ${isToday ? 'text-dark/65' : isPast ? 'text-white/35' : 'text-white/65'}`}
                >
                    {dayLabel}
                </Text>
                <Text 
                    className={`text-lg font-nunito-800 ${isToday ? 'text-dark' : isPast ? 'text-white/35' : 'text-white'}`}
                >
                    {dayNumber}
                </Text>
            </View>
            <View className="h-1.5 mt-1 items-center justify-center">
                {isActive && !isToday && (
                    <View className="w-1.5 h-1.5 rounded-full bg-yellow"/>
                )}
            </View>
        </View>
    );
}
export default CalendarDay;