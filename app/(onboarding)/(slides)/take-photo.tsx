import { View, Text, TouchableOpacity, Image } from "react-native";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { Button } from "@/components";
import { Camera } from "phosphor-react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";

const TakePhoto = () => {
    //Context
    const { photoUri, handleFinish } = useOnboarding();

    return (
        <View className="flex-1 items-center justify-between pb-16 pt-8 px-8">
            <Animated.View 
                entering={FadeInDown.delay(200).duration(250)}
                className="items-center"
            >
                <Text className="title text-center font-nunito-800 text-white text-4xl">
                    Take a Photo
                </Text>
                <Text className="base-text text-center text-white/50 mt-3">
                    Add a <Text className="font-nunito-700 text-yellow">profile photo</Text> so we can recognize you. You can always change this <Text className="font-nunito-700 text-yellow">later</Text> in <Text className="font-nunito-700 text-pink">settings</Text>.
                </Text>
            </Animated.View>
            <Animated.View 
                entering={ZoomIn.delay(400).duration(250)}
                className="items-center justify-center -mt-6"
            >
                <TouchableOpacity 
                    activeOpacity={0.25}
                    className="w-56 h-56 rounded-full bg-dark border-2 border-dashed border-white/10 items-center justify-center overflow-hidden"
                >
                    {photoUri ? (
                        <Image source={{ uri: photoUri }} className="w-full h-full" />
                    ) : (
                        <View className="items-center gap-3">
                            <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center">
                                <Camera size={40} color="#ffffff" weight="thin" />
                            </View>
                            <Text className="text-white/30 font-nunito-600 text-lg">Upload Photo</Text>
                        </View>
                    )}
                </TouchableOpacity>
            </Animated.View>
            <Animated.View 
                entering={FadeInUp.delay(600).duration(250)}
                className="w-full gap-6"
            >
                <Button 
                    className="rounded-[30px] w-full py-5"
                    textClassName="text-xl"
                    onPress={handleFinish}
                >
                    Complete Setup
                </Button>
                <TouchableOpacity onPress={handleFinish}>
                    <Text className="text-white/40 text-center font-nunito-700 uppercase tracking-widest text-sm">
                        Skip for now
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};
export default TakePhoto;