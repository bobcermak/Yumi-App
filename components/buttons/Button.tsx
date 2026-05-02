import * as Haptics from "expo-haptics";
import { type FC, ReactNode } from "react";
import { GestureResponderEvent, Text, TouchableOpacity, TouchableOpacityProps, View } from "react-native";

type ButtonProps = TouchableOpacityProps & {
    icon?: ReactNode,
    className?: string,
    textClassName?: string,
    children: ReactNode,
};
const Button: FC<ButtonProps> = ({ icon, children, className, textClassName, disabled, onPress, ...props }) => {
    const defaultButtonStyles = "bg-yellow px-4 py-3 rounded-[10px] mx-auto flex-row justify-center items-center shadow-xl";
    const defaultTextStyles = "text-base font-nunito-800 text-dark text-center w-full";
    //Functions
    const handlePress = (e: GestureResponderEvent) => {
        if (!disabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (onPress) onPress(e);
        }
    };
    return (
        <TouchableOpacity
            activeOpacity={0.25}
            disabled={disabled}
            onPress={handlePress}
            className={`${defaultButtonStyles} ${className || ""} ${disabled ? "opacity-50" : ""}`}
            {...props}
            style={{
                shadowColor: disabled ? "transparent" : "#C5E384",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: disabled ? 0 : 5
            }}
        >
            {icon ? (
                <View className="mr-2">
                    {icon}
                </View>
            ) : null}
            <Text className={`${defaultTextStyles} ${textClassName || ""}`}>{children}</Text>
        </TouchableOpacity>
    );
};
export default Button;