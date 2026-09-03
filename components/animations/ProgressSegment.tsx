import Animated, { useAnimatedStyle, withTiming, interpolateColor, useDerivedValue } from "react-native-reanimated";
import { type FC } from "react";

type ProgressSegmentProps = {
    isActive: boolean
}
const ProgressSegment: FC<ProgressSegmentProps> = ({ isActive }) => {
    const progress = useDerivedValue(() => withTiming(isActive ? 1 : 0, { duration: 250 }));
    const animatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(progress.value, [0, 1], ["#1D1D1D", "#C5E384"]),
    }));
    return <Animated.View className="flex-1 h-[6px] rounded-[16px]" style={animatedStyle}/>;
};
export default ProgressSegment;