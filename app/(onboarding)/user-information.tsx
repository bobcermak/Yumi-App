import { Text, View } from "react-native";
import { Icon } from "@/components"
import { ArrowLeft } from "phosphor-react-native";

const UserInformation = () => {
    return (
        <View className="flex-1 items-center mt-[88px]">
            <Icon onPress={() => {}}>
                <ArrowLeft size={20} color="#1D1D1D"/>
            </Icon>
            <View className="mt-[120px] max-w-[340px] items-center">
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
export default UserInformation;