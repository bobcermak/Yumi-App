import { View } from "react-native";
import { type FC } from "react";

type PulseBadgeProps = {
    children: React.ReactNode,
    className?: string,
    rotation?: string
};
const PulseBadge: FC<PulseBadgeProps> = ({ children, className = "", rotation = "0deg" }) => {
    return (
        <View 
            className={`absolute bg-dark px-3 py-2 rounded-[10px] flex-row items-center gap-1 shadow-dark/10 shadow-lg ${className}`}
            style={{ transform: [{ rotate: rotation }] }}
        >
            {children}
        </View>
    );
};
export default PulseBadge;