import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { Button } from "@/components";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { validateFullName, validateNickname } from "@/lib/helpers/onBoardingHelpers";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import Animated, { FadeInDown, FadeInUp, FadeInLeft, FadeInRight } from "react-native-reanimated";

const UserInformation = () => {
    //Context
    const { fullName, setFullName, nickname, setNickname, handleContinue, nicknameTaken, isNicknameLoading, suggestions } = useOnboarding();
    //Hooks
    const [error, setError] = useState<string>("");

    const hasFullName = validateFullName(fullName);
    const isValidNickname = validateNickname(nickname);
    const isValid = hasFullName && isValidNickname && !nicknameTaken && !isNicknameLoading;

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
        if (nickname.length < 3) {
            setError("Nickname must be at least 3 characters long.");
            return;
        }
        if (nickname.length > 15) {
            setError("Nickname cannot exceed 15 characters.");
            return;
        }
        if (!isValidNickname) {
            setError("Nickname can only contain lowercase letters, numbers, and underscores.");
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
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
            style={{ flex: 1, width: '100%' }}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="flex-grow items-center justify-center pb-16 pt-8 gap-12"
                    keyboardShouldPersistTaps="handled"
                >
                <View className="w-[360px] gap-12 self-center">
                    <Animated.View 
                        entering={FadeInDown.delay(200).duration(250)}
                        className="items-center"
                    >
                        <Text className="title text-center font-nunito-800 text-white text-4xl">
                            Setup Your Account
                        </Text>
                        <Text className="base-text text-center text-white/50 mt-3">
                            Let&apos;s get to know you <Text className="font-nunito-700 text-yellow">better</Text> so we can personalize your nutrition plan and help you reach your health <Text className="font-nunito-700 text-pink">goals faster</Text>.
                        </Text>
                    </Animated.View>
                    <View className="gap-12">
                        <View className="gap-6">
                            <Animated.View 
                                entering={FadeInLeft.delay(400).duration(250)}
                                className="gap-1"
                            >
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
                                            onChangeText={(text) => setFullName(text.replace(/(^|\s)\S/g, match => match.toUpperCase()))}
                                            placeholder="John Doe"
                                            placeholderTextColor="rgba(255,255,255,0.5)"
                                            className="bg-transparent px-4 py-4 text-white text-base font-nunito-600"
                                            style={{ includeFontPadding: false }}
                                        />
                                    </LinearGradient>
                                </View>
                                {fullName.trim().length > 0 && !hasFullName && (
                                    <Text className="text-pink font-nunito-600 text-sm ml-1 mt-1">Enter your first and last name.</Text>
                                )}
                            </Animated.View>
                            <Animated.View 
                                entering={FadeInRight.delay(600).duration(250)}
                                className="gap-1"
                            >
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
                                                onChangeText={(text) => setNickname(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                placeholder="john_doe"
                                                placeholderTextColor="rgba(255,255,255,0.5)"
                                                className="bg-transparent px-4 py-4 text-white text-base flex-1 font-nunito-600"
                                                autoCapitalize="none"
                                                maxLength={15}
                                                style={{ includeFontPadding: false }}
                                            />
                                            {isNicknameLoading && <ActivityIndicator size="small" color="#C5E384"/>}
                                        </View>
                                    </LinearGradient>
                                </View>
                                {nickname.length > 0 && !isValidNickname && (
                                    <Text className="text-pink font-nunito-600 text-sm ml-1 mt-1">
                                        {nickname.length < 3 ? "At least 3 characters." : "Only lowercase, numbers & underscores."}
                                    </Text>
                                )}
                                {nicknameTaken && !isNicknameLoading && suggestions.length > 0 && (
                                    <View className="mt-3 gap-2">
                                        <Text className="text-pink font-nunito-700 text-sm ml-2">This nickname is taken. Try one of these:</Text>
                                        <View className="flex-row gap-1.5 flex-wrap ml-2">
                                            {suggestions.map((s) => (
                                                <TouchableOpacity
                                                    key={s}
                                                    onPress={() => selectSuggestion(s)}
                                                    className="bg-dark px-4 py-2 rounded-[10px] border border-yellow/50"
                                                    style={{
                                                        shadowColor: "#000000",
                                                        shadowOffset: { width: 0, height: 1 },
                                                        shadowOpacity: 0.25,
                                                        shadowRadius: 4,
                                                        elevation: 8,
                                                        borderRadius: 15,
                                                    }}
                                                >
                                                    <Text className="text-yellow font-nunito-700 text-base">{s}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </Animated.View>
                        </View>
                        <Animated.View 
                            entering={FadeInUp.delay(800).duration(250)}
                            className="gap-4"
                        >
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
                        </Animated.View>
                    </View>
                </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
}
export default UserInformation;