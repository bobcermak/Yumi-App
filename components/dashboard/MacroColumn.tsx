import { useEffect, type FC } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { PencilSimple } from "phosphor-react-native";

type MacroColumnProps = {
    label: string,
    current: number,
    max: number,
    color: string,
    icon: React.ReactNode,
    onEdit?: () => void
};
const MacroColumn: FC<MacroColumnProps> = ({ label, current, max, color, icon, onEdit }) => {
    const percentage = max > 0 ? Math.min(current / max, 1) : 0;
    const progress = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        width: `${progress.value * 100}%`,
    }));
    useEffect(() => {
        progress.value = withTiming(percentage, {
            duration: 1000,
            easing: Easing.out(Easing.cubic),
        });
    }, [percentage]);
    return (
        <View className="flex-1 items-center gap-2">
            <View className="flex-row items-center justify-center gap-1">
                {icon}
                <Text className="text-white font-nunito-800 text-base">{label}</Text>
            </View>
            <View className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: `${color}50`}}>
                <Animated.View 
                    style={[{ height: "100%", backgroundColor: color, borderRadius: 999 }, animatedStyle]} 
                />
            </View>
            <View className="flex-row items-center justify-center gap-1">
                <Text className="text-white font-nunito-700 text-sm">
                    {current} <Text className="text-white/50 font-nunito-700">/ {max} g</Text>
                </Text>
                {onEdit && (
                    <TouchableOpacity onPress={onEdit} activeOpacity={0.25} className="ml-0.5">
                        <PencilSimple size={14} color="#FFFFFF50" weight="regular"/>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
export default MacroColumn;