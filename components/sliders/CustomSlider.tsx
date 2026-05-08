import { Tick } from "@/components";
import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState, type FC } from "react";
import { Animated, PanResponder, Text, View } from "react-native";

type CustomSliderProps = {
    value: number,
    minimumValue: number,
    maximumValue: number,
    step?: number,
    onValueChange: (val: number) => void,
    trackColor?: string,
    unit: "KG" | "LB",
    onSlidingStart?: () => void,
    onSlidingComplete?: () => void
}
const CustomSlider: FC<CustomSliderProps> = ({ value, minimumValue, maximumValue, step = 1, onValueChange, trackColor = "#C5E384", unit, onSlidingStart, onSlidingComplete }) => {
    //Constants 
    const SLIDER_WIDTH = 362;
    const PIXELS_PER_UNIT = 10;
    //Hooks
    const [localValue, setLocalValue] = useState(value);
    const scrollAnim = useRef(new Animated.Value(-(value - minimumValue) * PIXELS_PER_UNIT)).current;
    const initialScrollRef = useRef(-(value - minimumValue) * PIXELS_PER_UNIT);

    useEffect(() => {
        const targetScroll = -(value - minimumValue) * PIXELS_PER_UNIT;
        setLocalValue(value);
        Animated.spring(scrollAnim, {
            toValue: targetScroll,
            useNativeDriver: true,
            bounciness: 0,
        }).start();
    }, [value, minimumValue]);
    const localValueRef = useRef(localValue);
    localValueRef.current = localValue;
    const minRef = useRef(minimumValue);
    minRef.current = minimumValue;
    const maxRef = useRef(maximumValue);
    maxRef.current = maximumValue;
    const stepRef = useRef(step);
    stepRef.current = step;
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;
    const onSlidingStartRef = useRef(onSlidingStart);
    onSlidingStartRef.current = onSlidingStart;
    const onSlidingCompleteRef = useRef(onSlidingComplete);
    onSlidingCompleteRef.current = onSlidingComplete;
    const panResponder = useRef(PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gs) => Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 5,
        onPanResponderGrant: () => {
            scrollAnim.stopAnimation((v) => {
                initialScrollRef.current = v;
            });
            onSlidingStartRef.current?.();
        },
        onPanResponderMove: (_, gs) => {
            const newScroll = initialScrollRef.current + gs.dx;
            const minScroll = -(maxRef.current - minRef.current) * PIXELS_PER_UNIT;
            const maxScroll = 0;
            const boundedScroll = Math.max(minScroll, Math.min(maxScroll, newScroll));
            scrollAnim.setValue(boundedScroll);
            const rawVal = minRef.current + (Math.abs(boundedScroll) / PIXELS_PER_UNIT);
            const stepped = Math.round(rawVal / stepRef.current) * stepRef.current;
            const newVal = Math.max(minRef.current, Math.min(maxRef.current, stepped));

            if (newVal !== localValueRef.current) {
                setLocalValue(newVal);
                Haptics.selectionAsync();
            }
        },
        onPanResponderRelease: () => {
            const finalVal = localValueRef.current;
            Animated.spring(scrollAnim, {
                toValue: -(finalVal - minRef.current) * PIXELS_PER_UNIT,
                useNativeDriver: true,
                tension: 60,
                friction: 12,
            }).start();
            onValueChangeRef.current(finalVal);
            onSlidingCompleteRef.current?.();
        },
        onPanResponderTerminate: () => {
            onSlidingCompleteRef.current?.();
        }
    })).current;
    return (
        <View
            className="w-full items-center"
            {...panResponder.panHandlers}
        >
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
            >
                <Text className="absolute top-6 left-0 right-0 text-center text-5xl font-nunito-700 text-dark py-2">
                    <Text className="font-nunito-800">{localValue}</Text> {unit}
                </Text>
                <Animated.View
                    style={{
                        paddingLeft: SLIDER_WIDTH / 2 - PIXELS_PER_UNIT / 2,
                        paddingRight: SLIDER_WIDTH / 2 - PIXELS_PER_UNIT / 2,
                        transform: [{ translateX: scrollAnim }],
                    }}
                    className="flex-row items-center h-[90px] mb-4"
                >
                    {Array.from({ length: maximumValue - minimumValue + 1 }).map((_, i) => {
                        const val = minimumValue + i;
                        const isMajor = val % 10 === 0;
                        const isMinor = val % 5 === 0 && !isMajor;
                        const isSelected = val === localValue;
                        return (
                            <Tick
                                key={i}
                                val={val}
                                isSelected={isSelected}
                                isMajor={isMajor}
                                isMinor={isMinor}
                                PIXELS_PER_UNIT={PIXELS_PER_UNIT}
                            />
                        );
                    })}
                </Animated.View>
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