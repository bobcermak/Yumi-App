import * as Haptics from "expo-haptics";
import { type FC, type ReactNode } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
type PressableScaleProps = {
    onPress?: () => void,
    disabled?: boolean,
    haptic?: boolean,
    scaleTo?: number,
    className?: string,
    style?: StyleProp<ViewStyle>,
    hitSlop?: number,
    children: ReactNode
};
const PressableScale: FC<PressableScaleProps> = ({ onPress, disabled, haptic = true, scaleTo = 0.97, className, style, hitSlop, children }) => {
    const pressed = useSharedValue(0);
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: 1 - pressed.value * (1 - scaleTo) }],
        opacity: 1 - pressed.value * 0.15
    }));
    //Functions
    const handlePress = () => {
        if (disabled) return;
        if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
    };
    return (
        <Pressable
            disabled={disabled}
            hitSlop={hitSlop}
            onPressIn={() => pressed.set(withTiming(1, { duration: 110, easing: EASE_OUT }))}
            onPressOut={() => pressed.set(withTiming(0, { duration: 160, easing: EASE_OUT }))}
            onPress={handlePress}
        >
            <Animated.View className={className} style={[style, animatedStyle]}>
                {children}
            </Animated.View>
        </Pressable>
    );
};
export default PressableScale;