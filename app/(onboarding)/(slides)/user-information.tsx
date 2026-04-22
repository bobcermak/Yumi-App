import { Text, View, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { Button } from "@/components";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

const UserInformation = () => {
    //Context
    const { 
        fullName, 
        setFullName, 
        nickname, 
        setNickname, 
        handleContinue,
        nicknameTaken,
        isNicknameLoading,
        suggestions
    } = useOnboarding();
    //Hooks
    const [error, setError] = useState<string>("");

    const hasFullName = fullName.trim().split(/\s+/).length >= 2;
    const isValid = hasFullName && nickname.trim().length > 0 && !nicknameTaken && !isNicknameLoading;

    //Functions
    const onContinue = () => {
        if (!fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (!hasFullName) {
            setError("Please enter both first and last name.");
            return;
        }
        if (!nickname.trim()) {
            setError("Please choose a nickname.");
            return;
        }
        if (nicknameTaken) {
            setError("This nickname is already taken.");
            return;
        }
        setError("");
        handleContinue();
    };
    const selectSuggestion = (suggested: string) => {
        setNickname(suggested);
        setError("");
    };
    return (
        <View className="flex-1 items-center justify-center self-center pb-16 gap-12 w-[360px]">
            <View className="items-center">
                <Text className="title text-center font-nunito-800 text-white text-4xl">
                    Setup Your Account
                </Text>
                <Text className="base-text text-center text-white/50 mt-4">
                    Let's get to know you <Text className="font-nunito-700 text-yellow">better</Text> so we can personalize your nutrition plan and help you reach your health <Text className="font-nunito-700 text-pink">goals faster</Text>.
                </Text>
            </View>
            <View className="gap-12">
                <View className="gap-6">
                    <View className="gap-1">
                        <Text className="base-text text-lg font text-white/80 ml-1">Full Name</Text>
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
                                colors={['#2C2C2C', '#1D1D1D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 15,
                                    overflow: "hidden",
                                }}
                            >
                                <TextInput
                                    value={fullName}
                                    onChangeText={setFullName}
                                    placeholder="John Doe"
                                    placeholderTextColor="rgba(255,255,255,0.5)"
                                    className="bg-transparent px-4 py-4 text-white text-base"
                                />
                            </LinearGradient>
                        </View>
                        {fullName.trim().length > 0 && !hasFullName && (
                            <Text className="text-pink font-nunito-600 text-sm ml-1 mt-1">Enter your first and last name.</Text>
                        )}
                    </View>
                    <View className="gap-1">
                        <Text className="base-text text-lg text-white/80 ml-1">Nickname</Text>
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
                                colors={['#2C2C2C', '#1D1D1D']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{
                                    borderRadius: 15,
                                    overflow: "hidden",
                                }}
                            >
                                <View className="flex-row items-center pr-4">
                                    <TextInput
                                        value={nickname}
                                        onChangeText={setNickname}
                                        placeholder="john_doe"
                                        placeholderTextColor="rgba(255,255,255,0.5)"
                                        className="bg-transparent px-4 py-4 text-white text-base flex-1"
                                    />
                                    {isNicknameLoading && <ActivityIndicator size="small" color="#C5E384"/>}
                                </View>
                            </LinearGradient>
                        </View>
                        {!nicknameTaken && !isNicknameLoading && suggestions.length > 0 && (
                            <View className="mt-2 gap-2">
                                <Text className="text-pink font-nunito-600 text-sm ml-1">This nickname is taken. Try one of these:</Text>
                                <View className="flex-row gap-2">
                                    {suggestions.map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => selectSuggestion(s)}
                                            className="bg-dark px-4 py-2 rounded-xl border border-yellow/30"
                                        >
                                            <Text className="text-yellow font-nunito-700 text-sm">{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>
                </View>
                <View className="gap-4">
                    <Button
                        className="rounded-[30px] mx-0 w-full py-5"
                        textClassName="text-xl"
                        onPress={onContinue}
                        disabled={!isValid}
                    >
                        Continue
                    </Button>
                    {error ? (
                        <Text className="text-pink text-center font-nunito-600 text-sm">{error}</Text>
                    ) : null}
                </View>
            </View>
        </View>
    );
}
export default UserInformation;