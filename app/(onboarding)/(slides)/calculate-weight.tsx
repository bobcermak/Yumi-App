import { View, Text } from "react-native";

const CalculateWeight = () => {
    return (
        <View className="flex-1 items-center justify-center self-center pb-16 gap-12 w-[360px]">
            <View className="items-center">
                <Text className="title text-center font-nunito-800 text-white text-4xl">
                    Setup Your Account
                </Text>
                <Text className="base-text text-center text-white/50 mt-4">
                    Let's get to know you <Text className="font-nunito-700 text-yellow">better</Text> so we can personalize your nutrition plan and help you reach your health <Text className="font-nunito-700 text-pink">goals faster</Text>.
                </Text>
            </View>
        </View>
    );
}
export default CalculateWeight;