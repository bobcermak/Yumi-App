import { Stack } from "expo-router";
import { View } from "react-native";
import { Icon, ProgressSegment } from "@/components";
import { ArrowLeft } from "phosphor-react-native";
import { useOnboarding  } from "@/lib/hooks/useOnboarding";

const SLIDES = ["user-information", "calculate-weight", "activity-level", "results-weight", "take-photo"];
const SlidesLayout = () => {
    //Context
    const { currentIndex, handleBack } = useOnboarding();

    return (
        <View className="flex-1 mt-[88px] w-[380px] px-1 mx-auto">
            <View className="flex-row items-center gap-4 pb-6">
                <Icon onPress={handleBack}>
                    <ArrowLeft size={20} color="#1D1D1D"/>
                </Icon>
                <View className="flex-1 flex-row gap-2">
                    {SLIDES.map((_, index) => (
                        <ProgressSegment key={index} isActive={index <= currentIndex}/>
                    ))}
                </View>
            </View>
            <Stack screenOptions={{
                headerShown: false,
                animation: "slide_from_right",
            }}>
                <Stack.Screen name="user-information"/>
                <Stack.Screen name="calculate-weight"/>
                <Stack.Screen name="activity-level"/>
                <Stack.Screen name="results-weight"/>
                <Stack.Screen name="take-photo"/>
            </Stack>
        </View>
    );
};
export default SlidesLayout;