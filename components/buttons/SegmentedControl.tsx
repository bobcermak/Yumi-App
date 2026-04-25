import { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
type SegmentedControlProps<T extends string> = {
    options: readonly T[] | T[],
    selectedValue: T,
    onValueChange: (value: T) => void,
    width?: number
};
const SegmentedControl = <T extends string>({ options, selectedValue, onValueChange, width = 320 }: SegmentedControlProps<T>) => {
    //Constants
    const PADDING = 6;
    const INNER_WIDTH = width - PADDING * 2;
    const itemWidth = INNER_WIDTH / options.length;
    const selectedIndex = options.indexOf(selectedValue);
    const translateX = useSharedValue(selectedIndex * itemWidth);

    useEffect(() => {
        translateX.value = withSpring(selectedIndex * itemWidth, {
            damping: 20,
            stiffness: 200,
        });
    }, [selectedIndex, itemWidth]);
    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });
    return (
        <View 
            style={{ width, backgroundColor: '#1D1D1D' }} 
            className="flex-row items-center h-[52px] rounded-full relative p-[6px] self-center border border-white/5"
        >
            <Animated.View
                style={[
                    {
                        width: itemWidth,
                        height: '100%',
                        backgroundColor: '#C5E384',
                    },
                    animatedStyle,
                ]}
                className="absolute left-[6px] rounded-full"
            />
            {options.map((option, index) => {
                const isActive = option === selectedValue;
                return (
                    <TouchableOpacity
                        key={option}
                        style={{ width: itemWidth }}
                        className="h-full items-center justify-center z-10"
                        onPress={() => onValueChange(option)}
                        activeOpacity={0.8}
                    >
                        <Text 
                            className={`text-lg font-nunito-700 ${isActive ? 'text-dark' : 'text-white'}`}
                        >
                            {option.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};
export default SegmentedControl;