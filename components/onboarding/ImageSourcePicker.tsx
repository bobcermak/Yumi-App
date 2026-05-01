import { type FC, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, Pressable } from "react-native";
import { Camera, Image as ImageIcon } from "phosphor-react-native";
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from "react-native-reanimated";

type ImageSourcePickerProps = {
    visible: boolean,
    onClose: () => void,
    onSelect: (type: 'camera' | 'library') => void,
    title?: string,
    description?: string
}
const ImageSourcePicker:FC<ImageSourcePickerProps> = ({ visible, onClose, onSelect, title = "Select Source", description }) => {
    //Hooks
    const [showContent, setShowContent] = useState<boolean>(false);

    useEffect(() => {
        if (visible) {
            setShowContent(true);
        } else {
            setShowContent(false);
        }
    }, [visible]);
    const handleClose = () => {
        setShowContent(false);
        setTimeout(onClose, 250);
    };
    const handleSelect = (type: 'camera' | 'library') => {
        setShowContent(false);
        setTimeout(() => {
            onSelect(type);
            onClose();
        }, 250);
    };
    if (!visible && !showContent) return null;
    return (
        <Modal
            visible={visible || showContent}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <Pressable 
                className="flex-1 justify-end"
                onPress={handleClose}
            >
                {showContent && (
                    <Animated.View 
                        entering={FadeIn.duration(250)}
                        exiting={FadeOut.duration(250)}
                        className="absolute inset-0 bg-black/60"
                    />
                )}
                {showContent && (
                    <Animated.View 
                        entering={SlideInDown.duration(250)}
                        exiting={SlideOutDown.duration(250)}
                        className="w-full bg-dark rounded-t-[40px] p-6 border-t border-white/5"
                    >
                        <View className="w-12 h-1 bg-white/50 rounded-full self-center mb-6"/> 
                        <View className="mb-6 items-center">
                            <Text className="text-white font-nunito-800 text-xl mb-1">
                                {title}
                            </Text>
                            {description && (
                                <Text className="text-white/50 font-nunito-600 text-sm px-4 text-center">
                                    {description}
                                </Text>
                            )}
                        </View>
                        <View className="gap-3">
                            <TouchableOpacity 
                                onPress={() => handleSelect('camera')}
                                activeOpacity={0.25}
                                className="w-full bg-white/5 py-5 rounded-[20px] flex-row items-center px-6 gap-4 border border-white/5"
                            >
                                <View className="w-12 h-12 rounded-full bg-pink/20 items-center justify-center">
                                    <Camera color="#CA877E" size={24} weight="regular"/>
                                </View>
                                <View>
                                    <Text className="text-white font-nunito-700 text-lg">Take Photo</Text>
                                    <Text className="text-white/30 font-nunito-600 text-sm">Use your camera</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => handleSelect('library')}
                                activeOpacity={0.25}
                                className="w-full bg-white/5 py-5 rounded-[20px] flex-row items-center px-6 gap-4 border border-white/5"
                            >
                                <View className="w-12 h-12 rounded-full bg-yellow/20 items-center justify-center">
                                    <ImageIcon color="#C5E384" size={24} weight="regular"/>
                                </View>
                                <View>
                                    <Text className="text-white font-nunito-700 text-lg">Choose from Gallery</Text>
                                    <Text className="text-white/30 font-nunito-600 text-sm">Pick from your library</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={handleClose}
                                activeOpacity={0.25}
                                className="w-full py-4 mt-2 items-center"
                            >
                                <Text className="text-white/40 font-nunito-700 text-xl">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                )}
            </Pressable>
        </Modal>
    );
};
export default ImageSourcePicker;