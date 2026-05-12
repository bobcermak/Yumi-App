import { type FC } from "react";
import { View, Text } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { CheckCircle, WarningCircle } from "phosphor-react-native";
import { ToastType } from "@/types/indexContextType";

type ToastProps = {
    toast: ToastType | null;
};
const Toast: FC<ToastProps> = ({ toast }) => {
    if (!toast) return null;
    const isError = toast.type === 'error';
    return (
        <Animated.View
            entering={FadeInUp.duration(250).springify()}
            exiting={FadeOutUp.duration(250)}
            className="absolute top-[120px] left-0 right-0 items-center z-[999] elevation-10 px-4"
        >
            <View
                className="px-6 pt-3.5 pb-3 rounded-[40px] flex-row items-center gap-2 border border-white/10"
                style={{
                    backgroundColor: isError ? "#E7A7A2" : "#C5E384",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8
                }}
            >
                {isError ? (
                    <WarningCircle size={24} color="#1D1D1D" weight="fill"/>
                ) : (
                    <CheckCircle size={24} color="#1D1D1D" weight="fill"/>
                )}
                <Text className="text-dark font-nunito-800 text-base" numberOfLines={1}>
                    {toast.message}
                    {toast.dateStr && (
                        <Text className="font-nunito-800 text-xl"> {toast.dateStr}</Text>
                    )}
                </Text>
            </View>
        </Animated.View>
    );
};
export default Toast;