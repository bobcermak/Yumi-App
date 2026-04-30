import { Button, ImageSourcePicker, PhotoUploadCard } from "@/components";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { pickImageHelper } from "@/lib/helpers/imageHelpers";
import { User } from "phosphor-react-native";
import { useState } from "react";
import { Image, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";

const TakePhoto = () => {
    //Context
    const { photoUri, setPhotoUri, progressPhotos, setProgressPhotos, deleteProgressPhoto, handleFinish } = useOnboarding();
    //Hooks
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickingFor, setPickingFor] = useState<{ isProfile: boolean, index?: number } | null>(null);
    const [isDeleteMode, setIsDeleteMode] = useState(false);

    //Functions
    const pickImage = async (type: 'camera' | 'library') => {
        if (!pickingFor) return;
        const { isProfile, index } = pickingFor;
        setPickerVisible(false);
        const countOtherFilled = progressPhotos.filter((p, idx) => p && idx !== index).length;
        const limit = isProfile ? 1 : Math.max(1, 3 - countOtherFilled);
        setTimeout(async () => {
            const optimizedUris = await pickImageHelper(type, { isProfile, limit });
            if (optimizedUris && optimizedUris.length > 0) {
                if (isProfile) {
                    setPhotoUri(optimizedUris[0]);
                } else {
                    const newPhotos = [...progressPhotos];
                    optimizedUris.forEach((uri, i) => {
                        const targetIndex = (index !== undefined ? index + i : i);
                        if (targetIndex < 3) {
                            newPhotos[targetIndex] = uri;
                        }
                    });
                    setProgressPhotos(newPhotos);
                }
            }
        }, 100);
    };
    const handlePress = (isProfile: boolean, index?: number) => {
        setPickingFor({ isProfile, index });
        setPickerVisible(true);
    };
    const handleDelete = (index: number) => {
        deleteProgressPhoto(index);
        if (progressPhotos.filter((p, idx) => p && idx !== index).length === 0) {
            setIsDeleteMode(false);
        }
    };
    return (
        <Pressable
            className="flex-1"
            onPress={() => isDeleteMode && setIsDeleteMode(false)}
        >
            <ScrollView
                className="flex-1 pb-10 pt-5 px-6"
                showsVerticalScrollIndicator={false}
            >
                <Animated.View
                    entering={FadeIn.delay(200).duration(300)}
                    className="items-center mb-8"
                >
                    <Text className="title text-center font-nunito-800 text-white text-4xl">
                        Your Photos
                    </Text>
                    <Text className="base-text text-center text-white/50 mt-2">
                        Let&apos;s capture your <Text className="font-nunito-700 text-yellow">starting point</Text>. These will help you track your amazing <Text className="font-nunito-700 text-pink">transformation</Text>.
                    </Text>
                </Animated.View>
                <Animated.View
                    entering={FadeIn.delay(300).duration(300)}
                    className="items-center mb-8"
                >
                    <Text className="text-white/80 font-nunito-700 uppercase tracking-widest text-xs mb-4">Profile Picture</Text>
                    <TouchableOpacity
                        onPress={() => !isDeleteMode && handlePress(true)}
                        activeOpacity={0.7}
                        className="w-40 h-40 rounded-full bg-dark border-2 border-dashed border-white/10 items-center justify-center overflow-hidden"
                        style={{
                            shadowColor: "#000000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.5,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        {photoUri ? (
                            <Image source={{ uri: photoUri }} className="w-full h-full" />
                        ) : (
                            <View className="items-center gap-2">
                                <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center">
                                    <User color="white" weight="regular" size={32} />
                                </View>
                                <Text className="text-white/50 font-nunito-700 text-xs">Add Photo</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </Animated.View>
                <Animated.View
                    entering={FadeIn.delay(400).duration(300)}
                    className="mb-8"
                >
                    <View className="flex-row justify-center items-center gap-3 mb-4">
                        <Text className="text-white/80 font-nunito-700 uppercase tracking-widest text-xs text-center">Initial Progress Photos</Text>
                    </View>
                    <View className="flex-row justify-between">
                        {[0, 1, 2].map((i) => (
                            <PhotoUploadCard
                                key={i}
                                index={i}
                                uri={progressPhotos[i]}
                                isDeleteMode={isDeleteMode}
                                onPress={() => handlePress(false, i)}
                                onLongPress={() => setIsDeleteMode(true)}
                                onDelete={() => handleDelete(i)}
                            />
                        ))}
                    </View>
                </Animated.View>
                <Animated.View
                    entering={FadeInUp.delay(500).duration(300)}
                    className="w-full gap-5"
                >
                    <Button
                        className="rounded-[30px] w-full py-5"
                        onPress={handleFinish}
                    >
                        Complete Setup
                    </Button>
                    <TouchableOpacity onPress={handleFinish}>
                        <Text className="text-white/50 text-center font-nunito-700 tracking-widest text-base">
                            Skip For Now
                        </Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
            <ImageSourcePicker
                visible={pickerVisible}
                onClose={() => setPickerVisible(false)}
                onSelect={pickImage}
                title={pickingFor?.isProfile ? "Profile Photo" : "Progress Photo"}
                description={pickingFor?.isProfile ? "Choose how to upload your profile picture" : "You can select up to 3 photos from gallery"}
            />
        </Pressable>
    );
};
export default TakePhoto;