import { Drop, Minus } from "phosphor-react-native";
import { FC } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ML_PER_GLASS = 250;
const QUICK_ADD = [
    { label: "Glass",  ml: 250,  icon: "🥛" },
    { label: "Can",    ml: 330,  icon: "🥤" },
    { label: "Bottle", ml: 500,  icon: "💧" },
] as const;
const fmtL = (ml: number) =>
    ml >= 1000 ? `${(ml / 1000).toFixed(1)} L` : `${ml} ml`;
type WaterTrackerProps = {
    waterMl: number;
    goalMl: number;
    onSetWater: (ml: number) => void;
};
const WaterTracker: FC<WaterTrackerProps> = ({ waterMl, goalMl, onSetWater }) => {
    const glasses     = Math.min(8, Math.max(1, Math.round(goalMl / ML_PER_GLASS)));
    const filledCount = Math.min(glasses, Math.floor(waterMl / ML_PER_GLASS));
    const progressRatio = Math.min(1, goalMl > 0 ? waterMl / goalMl : 0);
    const progressWidth = useSharedValue(progressRatio);
    const progressStyle = useAnimatedStyle(() => ({
        width: `${Math.round(progressWidth.value * 100)}%` as any,
    }));
    //Functions
    const updateProgress = (ratio: number) => {
        progressWidth.value = withTiming(Math.min(1, ratio), { duration: 250 });
    };
    const handleAdd = (ml: number) => {
        const next = Math.min(goalMl, waterMl + ml);
        onSetWater(next);
        updateProgress(goalMl > 0 ? next / goalMl : 0);
    };
    const handleRemove = () => {
        const next = Math.max(0, waterMl - ML_PER_GLASS);
        onSetWater(next);
        updateProgress(goalMl > 0 ? next / goalMl : 0);
    };
    const handleGlassTap = (index: number) => {
        const next = index < filledCount
            ? index * ML_PER_GLASS
            : (index + 1) * ML_PER_GLASS;
        onSetWater(next);
        updateProgress(goalMl > 0 ? next / goalMl : 0);
    };
    return (
        <View
            className="w-[362px] self-center bg-dark rounded-[20px] px-5 py-6 border border-white/10"
            style={{
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.25,
                shadowRadius: 8,
                elevation: 5,
            }}
        >
            <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center gap-2">
                    <Drop size={20} color="#60A5FA" weight="fill" />
                    <Text className="text-white font-nunito-800 text-xl">Hydration</Text>
                </View>
                <Text className="text-white/50 font-nunito-600 text-base">
                    <Text className="text-white font-nunito-700">{fmtL(waterMl)}</Text>
                    {" / "}{fmtL(goalMl)}
                </Text>
            </View>
            <View className="flex-row justify-between mb-5">
                {Array.from({ length: glasses }).map((_, i) => {
                    const filled = i < filledCount;
                    return (
                        <Animated.View key={i} entering={FadeInDown.delay(i * 25).duration(220).springify()}>
                            <TouchableOpacity
                                onPress={() => handleGlassTap(i)}
                                activeOpacity={0.25}
                                style={{
                                    width: 36,
                                    height: 44,
                                    borderRadius: 10,
                                    borderWidth: 1.5,
                                    borderColor: filled ? '#3182CE' : 'rgba(255,255,255,0.12)',
                                    backgroundColor: filled ? '#3182CE50' : 'rgba(255,255,255,0.04)',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Drop
                                    size={18}
                                    color={filled ? '#3182CE' : 'rgba(255,255,255,0.2)'}
                                    weight={filled ? 'fill' : 'regular'}
                                />
                            </TouchableOpacity>
                        </Animated.View>
                    );
                })}
            </View>
            <View className="h-2 rounded-full overflow-hidden mb-1" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <Animated.View
                    style={[
                        progressStyle,
                        {
                            height: '100%',
                            backgroundColor: progressRatio >= 1 ? '#C5E384' : '#3182CE',
                            borderRadius: 999,
                        }
                    ]}
                />
            </View>
            <View className="flex-row justify-between mb-5">
                <Text className="text-white/30 font-nunito-600 text-xs">0</Text>
                {progressRatio >= 1 ? (
                    <Text className="font-nunito-700 text-xs mt-1" style={{ color: '#C5E384' }}>Goal reached! 🎉</Text>
                ) : (
                    <Text className="text-white/30 font-nunito-600 text-xs">{fmtL(goalMl - waterMl)} to go</Text>
                )}
                <Text className="text-white/30 font-nunito-600 text-xs">{fmtL(goalMl)}</Text>
            </View>
            <View className="flex-row gap-2 items-center">
                {QUICK_ADD.map(({ label, ml, icon }) => (
                    <TouchableOpacity
                        key={label}
                        onPress={() => handleAdd(ml)}
                        activeOpacity={0.25}
                        disabled={waterMl >= goalMl}
                        className="flex-1 flex-row items-center justify-center gap-1 p-4 rounded-[15px]"
                        style={{
                            backgroundColor: '#3182CE50',
                            borderWidth: 1,
                            borderColor: '#3182CE',
                            opacity: waterMl >= goalMl ? 0.35 : 1,
                        }}
                    >
                        <Text style={{ fontSize: 14 }}>{icon}</Text>
                        <Text style={{ color: '#FFFFFF', fontFamily: 'Nunito_700Bold', fontSize: 12 }}>+{ml}ml</Text>
                    </TouchableOpacity>
                ))}
                <TouchableOpacity
                    onPress={handleRemove}
                    activeOpacity={0.25}
                    disabled={waterMl <= 0}
                    className="w-12 h-12 items-center justify-center rounded-[12px] border border-white/10"
                    style={{ backgroundColor: 'rgba(255,255,255,0.04)', opacity: waterMl <= 0 ? 0.3 : 1 }}
                >
                    <Minus size={18} color="rgba(255,255,255,0.5)" weight="bold" />
                </TouchableOpacity>
            </View>
        </View>
    );
};
export default WaterTracker;