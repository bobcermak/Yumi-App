import { TouchableOpacity } from "react-native";
import { FC } from "react";

type IconProps = {
    onPress: () => void,
    className?: string,
    children: React.ReactNode
}
const Icon: FC<IconProps> = ({ onPress, className, children }) => {
    const defaultClassName = "w-10 h-10 bg-yellow rounded-full items-center justify-center";
    return (
        <TouchableOpacity onPress={onPress} className={`${defaultClassName} ${className}`} 
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