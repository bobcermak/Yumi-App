import { TouchableOpacity } from "react-native";
import { type FC } from "react";

type IconProps = {
    onPress: () => void,
    className?: string,
    shadowColor?: string,
    disabled?: boolean,
    children: React.ReactNode
}
const Icon: FC<IconProps> = ({ onPress, className, shadowColor = "#C5E384", disabled, children }) => {
    const hasBgColor = className?.includes('bg-');
    const hasWidth = className?.includes('w-[') || className?.includes('w-');
    const hasHeight = className?.includes('h-[') || className?.includes('h-');
    const finalClassName = `${hasWidth ? '' : 'w-10'} ${hasHeight ? '' : 'h-10'} ${hasBgColor ? '' : 'bg-yellow'} rounded-full items-center justify-center ${className || ''}`;
    //Functions
    const handlePress = () => {
        if (disabled) return;
        onPress();
    };
    return (
        <TouchableOpacity onPress={handlePress} disabled={disabled} className={finalClassName.trim()} 
        style={{
            shadowColor: shadowColor,
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