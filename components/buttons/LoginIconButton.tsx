import { TouchableOpacity, type TouchableOpacityProps } from "react-native";
import { type FC } from "react";

type LoginIconButtonProps = TouchableOpacityProps & {
    onPress: () => void,
    icon: React.ReactNode
};
const LoginIconButton: FC<LoginIconButtonProps> = ({ icon, onPress, ...props }) => {
    return (
        <TouchableOpacity className="w-32 h-20 bg-dark rounded-[20px] items-center justify-center border border-white/5 shadow-lg" onPress={onPress} {...props}>
            {icon}
        </TouchableOpacity>
    );
}
export default LoginIconButton;