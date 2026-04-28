import { Plus, X } from "phosphor-react-native";
import Animated, { FadeInRight, useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue, FadeIn, FadeOut } from "react-native-reanimated";
import { Image, TouchableOpacity, View, Pressable } from "react-native";
import { useEffect } from "react";

type PhotoUploadCardProps = {
    uri?: string | null,
    onPress: () => void,
    onLongPress: () => void,
    onDelete: () => void,
    isDeleteMode: boolean,
    index: number
}
const PhotoUploadCard = ({ uri, onPress, onLongPress, onDelete, isDeleteMode, index }: PhotoUploadCardProps) => {
    //Hooks
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isDeleteMode && uri) {
            rotation.value = withRepeat(
                withSequence(
                    withTiming(-1.2, { duration: 100 }),
                    withTiming(1.2, { duration: 100 })
                ),
                -1,
                true
            );
        } else {
            rotation.value = withTiming(0, { duration: 200 });
        }
    }, [isDeleteMode, uri]);
    const wiggleStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${rotation.value}deg` }]
        };
    });
    return (
        <Animated.View 
            entering={FadeInRight.delay(500 + (index * 100)).duration(250)}
            className="items-center"
            style={[{ width: '31%' }, wiggleStyle]}
        >
            <View className="w-full aspect-[3/4] mb-3">
                <TouchableOpacity 
                    onPress={isDeleteMode ? undefined : onPress}
                    onLongPress={uri ? onLongPress : undefined}
                    delayLongPress={300}
                    activeOpacity={isDeleteMode ? 1 : 0.25}
                    className="w-full h-full rounded-[15px] bg-dark border border-white/10 items-center justify-center overflow-hidden"
                    style={{
                        shadowColor: "#000000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 8,
                        elevation: 10
                    }}
                >
                    {uri ? (
                        <Image source={{ uri }} className="w-full h-full"/>
                    ) : (
                        <View className="items-center gap-2">
                            <View className="w-12 h-12 rounded-full bg-white/5 items-center justify-center border border-white/5">
                                <Plus color="white" size={24} weight="regular"/>
                            </View>
                        </View>
                    )}
                </TouchableOpacity>
                {isDeleteMode && uri && (
                    <Animated.View 
                        entering={FadeIn.duration(200)}
                        exiting={FadeOut.duration(200)}
                        className="absolute -top-2 -right-2 z-50"
                    >
                        <Pressable 
                            onPress={onDelete}
                            className="w-8 h-8 rounded-full bg-pink items-center justify-center border border-white/20"
                            style={{ elevation: 11 }}
                        >
                            <X color="white" size={16} weight="regular"/>
                        </Pressable>
                    </Animated.View>
                )}
            </View>
        </Animated.View>
    );
};
export default PhotoUploadCard;