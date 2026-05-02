import { TouchableOpacity } from "react-native";
import { type FC } from "react";
import * as Haptics from "expo-haptics";

type IconProps = {
    onPress: () => void,
    className?: string,
    children: React.ReactNode
}
const Icon: FC<IconProps> = ({ onPress, className, children }) => {
    const defaultClassName = "w-10 h-10 bg-yellow rounded-full items-center justify-center";
    //Functions
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };
    return (
        <TouchableOpacity onPress={handlePress} className={`${defaultClassName} ${className}`} 
        style={{
            shadowColor: "#C5E384",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5
        }}>
            {children}
        </TouchableOpacity>
    );
}
export default Icon;