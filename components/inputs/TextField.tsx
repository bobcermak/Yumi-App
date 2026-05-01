import { type FC, useState } from "react";
import { View, Text, TextInput, TextInputProps, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, EyeSlash } from "phosphor-react-native";

type TextFieldProps = TextInputProps & {
    label?: string,
    error?: string,
    isPassword?: boolean
};
const TextField: FC<TextFieldProps> = ({ label, error, isPassword, ...props }) => {
    //Hooks
    const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

    return (
        <View className="gap-1 mb-4">
            {label && (
                <Text className="text-white/80 text-lg font-nunito-600 ml-1">
                    {label}
                </Text>
            )}
            <View
                style={{
                    shadowColor: "#000000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.25,
                    shadowRadius: 4,
                    elevation: 8,
                    borderRadius: 15,
                }}
            >
                <LinearGradient
                    colors={["#2C2C2C", "#1D1D1D"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        borderRadius: 15,
                        overflow: "hidden",
                    }}
                >
                    <View className="flex-row items-center pr-4">
                        <TextInput
                            {...props}
                            secureTextEntry={isPassword && !isPasswordVisible}
                            placeholderTextColor="rgba(255,255,255,0.5)"
                            className="bg-transparent px-4 py-4 text-white text-base flex-1 font-nunito-600"
                            style={{ includeFontPadding: false }}
                        />
                        {isPassword && (
                            <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                                {!isPasswordVisible ? (
                                    <EyeSlash size={24} color="rgba(255,255,255,0.5)" />
                                ) : (
                                    <Eye size={24} color="rgba(255,255,255,0.5)" />
                                )}
                            </TouchableOpacity>
                        )}
                    </View>
                </LinearGradient>
            </View>
            {error && (
                <Text className="text-pink font-nunito-600 text-sm ml-1 mt-1">
                    {error}
                </Text>
            )}
        </View>
    );
};
export default TextField;