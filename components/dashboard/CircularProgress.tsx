import { useEffect, type FC } from "react";
import { View, Text } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from "react-native-reanimated";
import { Fire } from "phosphor-react-native";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
type CircularProgressProps = {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    trackColor?: string;
};
const CircularProgress: FC<CircularProgressProps> = ({ value, max, size = 140, strokeWidth = 12, color = "#C5E384", trackColor = "#FFFFFF20" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const visualPercentage = max > 0 ? Math.min(value / max, 1) : 0;
    const actualPercentage = max > 0 ? value / max : 0;
    const progress = useSharedValue(0);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = circumference - progress.value * circumference;
        return {
            strokeDashoffset,
        };
    });
    const displayPercentage = Math.round(actualPercentage * 100);
    useEffect(() => {
        progress.value = withTiming(visualPercentage, {
            duration: 1500,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
    }, [visualPercentage]);
    return (
        <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: "-90deg" }] }}>
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={trackColor}
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                <AnimatedCircle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    animatedProps={animatedProps}
                    strokeLinecap="round"
                />
            </Svg>
            <View style={{ position: "absolute", alignItems: "center", justifyContent: "center" }}>
                <View 
                    className="w-12 h-12 rounded-full items-center justify-center mb-1"
                    style={{
                        backgroundColor: `${color}25`,
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.5,
                        shadowRadius: 12,
                        elevation: 10,
                    }}
                >
                    <Fire size={24} color={color} weight="fill"/>
                </View>
                <Text className={`text-sm opacity-50 font-nunito-600`} style={{ color: color }}>
                    {displayPercentage}%
                </Text>
            </View>
        </View>
    );
};
export default CircularProgress;