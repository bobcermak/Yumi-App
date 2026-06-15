import { useEffect } from "react";
import { useWindowDimensions } from "react-native";
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";

const ScanLine = () => {
    const { height: SCREEN_H } = useWindowDimensions();
    const translateY = useSharedValue(0);
    useEffect(() => {
        cancelAnimation(translateY);
        translateY.value = 0;
        translateY.value = withRepeat(
            withTiming(SCREEN_H, { duration: 2200, easing: Easing.inOut(Easing.quad) }),
            -1,
            true,
        );
    }, [SCREEN_H]);
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