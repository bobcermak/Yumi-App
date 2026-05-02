import { View, Text, ScrollView } from "react-native";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { ActivityCard, Button } from "@/components";
import { ACTIVITY_LEVELS } from "@/types/activityLevelsType";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";

const ActivityLevel = () => {
    //Context
    const { activityLevel, setActivityLevel, handleContinue } = useOnboarding();

    return (
        <View className="w-[360px] self-center h-full">
            <ScrollView
                contentContainerClassName="items-center pb-52 pt-8"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View 
                    entering={FadeInDown.delay(200).duration(250)}
                    className="items-center mb-10"
                >
                    <Text className="title text-center font-nunito-800 text-white text-4xl">
                        Activity Level
                    </Text>
                    <Text className="base-text text-center text-white/50 mt-3">
                        This helps us calculate your <Text className="font-nunito-700 text-yellow">daily energy</Text> needs more accurately. Choose the one that fits you <Text className="font-nunito-700 text-pink">best</Text>.
                    </Text>
                </Animated.View>
                <View className="w-full gap-4">
                    {ACTIVITY_LEVELS.map((level, index) => (
                        <Animated.View 
                            key={level.id}
                            entering={(index % 2 === 0 ? FadeInLeft : FadeInRight).delay(300 + index * 100).duration(250)}
                        >
                            <ActivityCard
                                level={level}
                                isSelected={activityLevel === index}
                                onPress={() => setActivityLevel(index)}
                            />
                        </Animated.View>
                    ))}
                </View>
            </ScrollView>
            <Animated.View 
                entering={FadeInUp.delay(800).duration(250)}
                className="w-full absolute bottom-16 left-0 right-0"
            >
                <Button
                    className="rounded-[30px] mx-0 w-full py-5"
                    textClassName="text-xl"
                    onPress={handleContinue}
                >
                    Continue
                </Button>
            </Animated.View>
        </View>
    );
};
export default ActivityLevel;