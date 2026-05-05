import { format } from "date-fns";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { type FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";

type CalendarHeaderProps = {
    currentDate: Date;
    onPrev: () => void;
    onNext: () => void;
};
const CalendarHeader: FC<CalendarHeaderProps> = ({ currentDate, onPrev, onNext }) => {
    return (
        <View className="flex-row justify-between items-end">
            <Text className="text-white text-2xl font-nunito-800">
                {format(currentDate, "MMMM yyyy")}
            </Text>
            <View className="flex-row gap-3">
                <TouchableOpacity
                    onPress={onPrev}
                    className="w-10 h-10 rounded-full bg-white/50 items-center justify-center"
                >
                    <CaretLeft size={20} color="white" weight="regular" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onNext}
                    className="w-10 h-10 rounded-full bg-white/50 items-center justify-center"
                >
                    <CaretRight size={20} color="white" weight="regular" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default CalendarHeader;