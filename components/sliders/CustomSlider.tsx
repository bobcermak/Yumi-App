import { View, Text, PanResponder } from "react-native";
import { useRef, useState, useEffect, type FC } from "react";

type CustomSliderProps = {
    value: number,
    minimumValue: number,
    maximumValue: number,
    step?: number,
    onValueChange: (val: number) => void,
    trackColor?: string,
}
const CustomSlider: FC<CustomSliderProps> = ({ value, minimumValue, maximumValue, step = 1, onValueChange, trackColor = "#C5E384" }) => {
    //Constants 
    const SLIDER_WIDTH = 360;
    const PIXELS_PER_UNIT = 10;
    //Hooks
    const [localValue, setLocalValue] = useState(value);
    useEffect(() => {
        setLocalValue(value);
    }, [value]);
    const initialValueRef = useRef(localValue);
    const localValueRef = useRef(localValue);
    localValueRef.current = localValue;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            initialValueRef.current = localValueRef.current;
        },
        onPanResponderMove: (e, gestureState) => {
            const raw = initialValueRef.current - (gestureState.dx / PIXELS_PER_UNIT);
            const stepped = Math.round(raw / step) * step;
            const newVal = Math.max(minimumValue, Math.min(maximumValue, stepped));
            if (newVal !== localValueRef.current) {
                setLocalValue(newVal);
            }
        },
        onPanResponderRelease: () => {
            onValueChangeRef.current(localValueRef.current);
        }
    })).current;
    //Calculations
    const trackTranslateX = -(localValue - minimumValue) * PIXELS_PER_UNIT;
    return (
        <View className="w-full items-center">
            <View
                style={{
                    width: SLIDER_WIDTH,
                    backgroundColor: trackColor,
                    shadowColor: trackColor,
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 8,
                }}
                className="h-[180px] rounded-[24px] justify-end relative self-center overflow-hidden"
                {...panResponder.panHandlers}
            >
                <Text className="absolute top-6 left-0 right-0 text-center text-5xl font-nunito-700 text-dark pb-1">
                    <Text className="font-nunito-800">{localValue}</Text> kg
                </Text>
                <View
                    style={{
                        paddingLeft: SLIDER_WIDTH / 2 - PIXELS_PER_UNIT / 2,
                        paddingRight: SLIDER_WIDTH / 2 - PIXELS_PER_UNIT / 2,
                        transform: [{ translateX: trackTranslateX }],
                    }}
                    className="flex-row items-center h-[90px] mb-4"
                >
                    {Array.from({ length: maximumValue - minimumValue + 1 }).map((_, i) => {
                        const val = minimumValue + i;
                        const isMajor = val % 10 === 0;
                        const isMinor = val % 5 === 0 && !isMajor;
                        const isSelected = val === localValue;
                        return (
                            <View key={i} style={{ width: PIXELS_PER_UNIT }} className="items-center justify-center h-full relative">
                                <View
                                    style={{
                                        height: isSelected ? 48 : (isMajor ? 32 : (isMinor ? 20 : 10)),
                                        backgroundColor: isSelected ? '#1D1D1D' : (isMajor ? 'rgba(29, 29, 29, 0.8)' : 'rgba(29, 29, 29, 0.4)'),
                                        width: isSelected ? 4 : 2,
                                        borderRadius: isSelected ? 2 : 1
                                    }}
                                />
                                {isMajor && (
                                    <Text
                                        style={{ left: (PIXELS_PER_UNIT - 50) / 2 }}
                                        className="text-dark/80 text-md font-nunito-700 absolute bottom-0 w-[50px] text-center"
                                    >
                                        {val}
                                    </Text>
                                )}
                            </View>
                        );
                    })}
                </View>
            </View>
            <View className="h-[10px] w-8 overflow-hidden items-center mt-2">
                <View
                    style={{
                        backgroundColor: trackColor,
                        transform: [{ rotate: '45deg' }],
                        top: 3,
                    }}
                    className="w-4 h-4 rounded-[3px] absolute"
                />
            </View>
        </View>
    )
}
export default CustomSlider;