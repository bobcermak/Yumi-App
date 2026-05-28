import { View, Text, Image } from "react-native";
import { type FC, useEffect } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming, Easing } from "react-native-reanimated";
import { Fire } from "phosphor-react-native";
import PulseBadge from "../dashboard/PulseBadge";

type MacroData = {
    current: number;
    max: number;
};
type DailyPulseCardProps = {
    streak: number;
    carbs: MacroData;
    fats: MacroData;
    protein: MacroData;
    rating?: number | null;
};
const DailyPulseCard: FC<DailyPulseCardProps> = ({ streak, carbs, fats, protein, rating }) => {
    const hasRating = rating !== null && rating !== undefined;
    const isHighRating = hasRating && rating >= 7;
    const isLowRating = hasRating && rating < 5;
    const isOverFats = fats.current > (fats.max * 1.3);
    const isOverCarbs = carbs.current > (carbs.max * 1.3);
    const isSad = !isHighRating && (isLowRating || isOverFats || isOverCarbs);
    const floatAnim = useSharedValue(0);
    const floatingStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: floatAnim.value * -6 },
            { rotate: "-8deg" }
        ]
    }));
    useEffect(() => {
        floatAnim.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
            ),
            -1,
            true
        );
    }, []);
    return (
        <View className={`w-full rounded-[15px] overflow-hidden items-center justify-center h-[200px] p-6 ${isSad ? 'bg-pink/80' : 'bg-darkYellow'}`}>
            <Animated.View style={floatingStyle} className="z-0 items-center justify-center">
                <Image source={isSad
                    ? require("@/assets/images/sad-yumi.png")
                    : require("@/assets/images/happy-yumi.png")}
                    className="w-[120px] h-[120px]"
                    resizeMode="cover"
                />
            </Animated.View>
            <PulseBadge className="top-10 left-16" rotation="-25deg">
                <Text className="text-white text-base font-nunito-700">{streak}</Text>
                <Fire size={20} color={isSad ? "#CA877E" : "#C5E384"} weight="fill"/>
            </PulseBadge>
            <PulseBadge className="top-10 right-8" rotation="20deg">
                <Text className="text-white text-base font-nunito-700">{fats.current}/<Text className="text-white/80">{fats.max}g</Text></Text>
                <Text className={`text-base font-nunito-700 ${isSad ? "text-pink" : "text-yellow"}`}>Fats</Text>
            </PulseBadge>
            <PulseBadge className="bottom-10 left-4" rotation="25deg">
                <Text className="text-white text-base font-nunito-700">{protein.current}/<Text className="text-white/80">{protein.max}g</Text></Text>
                <Text className={`text-base font-nunito-700 ${isSad ? "text-pink" : "text-yellow"}`}>Protein</Text>
            </PulseBadge>
            <PulseBadge className="bottom-6 right-6" rotation="-10deg">
                <Text className="text-white text-base font-nunito-700">{carbs.current}/<Text className="text-white/80">{carbs.max}g</Text></Text>
                <Text className={`text-base font-nunito-700 ${isSad ? "text-pink" : "text-yellow"}`}>Carbs</Text>
            </PulseBadge>
        </View>
    );
};
export default DailyPulseCard;