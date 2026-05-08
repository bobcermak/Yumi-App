import { format } from "date-fns";
import { CaretLeft, CaretRight } from "phosphor-react-native";
import { type FC } from "react";
import { Text, View } from "react-native";
import Icon from "../buttons/Icon";

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
                <Icon onPress={onPrev} className="bg-white/10" shadowColor="transparent">
                    <CaretLeft size={20} color="white" weight="regular"/>
                </Icon>
                <Icon onPress={onNext} className="bg-white/10" shadowColor="transparent">
                    <CaretRight size={20} color="white" weight="regular"/>
                </Icon>
            </View>
        </View>
    );
};
export default CalendarHeader;