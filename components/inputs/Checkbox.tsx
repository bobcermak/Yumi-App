import { type FC } from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { Check } from "phosphor-react-native";

type CheckboxProps = {
    checked: boolean,
    onToggle: () => void,
    label: string,
    underLineLabel?: string
};
const Checkbox: FC<CheckboxProps> = ({ checked, onToggle, label, underLineLabel }) => {
    return (
        <TouchableOpacity 
            onPress={onToggle} 
            activeOpacity={0.25}
            className="flex-row items-center gap-2 my-2"
        >
            <View 
                className={`w-6 h-6 rounded-md items-center justify-center border ${checked ? 'bg-yellow border-yellow' : 'bg-transparent border-white/30'}`}
                style={checked ? {
                    shadowColor: "#C5E384",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.5,
                    shadowRadius: 4,
                    elevation: 5
                } : {}}
            >
                {checked && <Check size={12} weight="bold" color="#121212"/>}
            </View>
            <Text className="text-white/80 font-nunito-600 text-base flex-1">
                {label} <Text className="underline">{underLineLabel}</Text>
            </Text>
        </TouchableOpacity>
    );
};
export default Checkbox;