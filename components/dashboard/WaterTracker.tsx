import { Drop } from "phosphor-react-native";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

const ML_PER_GLASS = 250;

type WaterTrackerProps = {
    waterMl: number;
    goalMl: number;
    onSetWater: (ml: number) => void;
};

const WaterTracker: FC<WaterTrackerProps> = ({ waterMl, goalMl, onSetWater }) => {
    const glasses = Math.round(goalMl / ML_PER_GLASS);
    const filledCount = Math.min(glasses, Math.floor(waterMl / ML_PER_GLASS));
    const progressRatio = Math.min(1, waterMl / goalMl);

    const handleGlassTap = (index: number) => {
        if (index < filledCount) {
            // tap on filled → unfill from this glass onward
            onSetWater(index * ML_PER_GLASS);
        } else {
            // tap on empty → fill up to and including this glass
            onSetWater((index + 1) * ML_PER_GLASS);
        }
    };

    return (
        <View
            className="w-[362px] self-center bg-dark rounded-[20px] px-5 py-6 border border-white/10"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
            }}
        >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-2">
                    <Drop size={20} color="#60A5FA" weight="fill" />
                    <Text className="text-white font-nunito-800 text-xl">Hydration</Text>
                </View>
                <Text className="text-white/50 font-nunito-600 text-base">
                    <Text className="text-white font-nunito-700">{waterMl}</Text>
                    {" / "}{goalMl} ml
                </Text>
            </View>

            {/* Glasses row */}
            <View className="flex-row justify-between mb-5">
                {Array.from({ length: glasses }).map((_, i) => {
                    const filled = i < filledCount;
                    return (
                        <Animated.View key={i} entering={FadeInDown.delay(i * 30).duration(250).springify()}>
                            <TouchableOpacity
                                onPress={() => handleGlassTap(i)}
                                activeOpacity={0.6}
                                style={{
                                    width: 36,
                                    height: 44,
                                    borderRadius: 10,
                                    borderWidth: 1.5,
                                    borderColor: filled ? '#3B82F6' : 'rgba(255,255,255,0.12)',
                                    backgroundColor: filled ? '#3B82F620' : 'rgba(255,255,255,0.04)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Drop
                                    size={18}
                                    color={filled ? '#60A5FA' : 'rgba(255,255,255,0.2)'}
                                    weight={filled ? 'fill' : 'regular'}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>

            {/* Progress bar */}
            <View className="h-2 rounded-full bg-white/8 overflow-hidden">
                <Animated.View
                    style={{
                        height: '100%',
                        width: `${Math.round(progressRatio * 100)}%`,
                        backgroundColor: progressRatio >= 1 ? '#34D399' : '#3B82F6',
                        borderRadius: 999,
                    }}
                />
            </View>

            {/* Footer label */}
            <View className="flex-row justify-between mt-2">
                <Text className="text-white/30 font-nunito-600 text-xs">0 ml</Text>
                {progressRatio >= 1 ? (
                    <Text className="text-emerald-400 font-nunito-700 text-xs">Goal reached! 🎉</Text>
                ) : (
                    <Text className="text-white/30 font-nunito-600 text-xs">
                        {goalMl - waterMl} ml to go
                    </Text>
                )}
                <Text className="text-white/30 font-nunito-600 text-xs">{goalMl} ml</Text>
            </View>
        </View>
    );
};

export default WaterTracker;
