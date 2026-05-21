import { useEffect } from "react";
import { Dimensions } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const { height: SCREEN_H } = Dimensions.get("window");
const ScanLine = () => {
    const translateY = useSharedValue(0);
    useEffect(() => {
        translateY.value = withRepeat(
            withTiming(SCREEN_H, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
            -1,
            true,
        );
    }, []);
    const style = useAnimatedStyle(() => ({ transform: [{ translateY: translateY.value }] }));
    return (
        <Animated.View
            pointerEvents="none"
            style={[
                {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: -2,
                    height: 3,
                    backgroundColor: "#C5E384",
                    shadowColor: "#C5E384",
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 12,
                    elevation: 8,
                    opacity: 0.9,
                },
                style,
            ]}
        />
    );
};
export default ScanLine;