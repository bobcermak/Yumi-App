import { Button, Checkbox, LoginIconButton, TextField } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useOnboarding } from "@/lib/hooks/useOnboarding";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Signup = () => {
  //Hooks
  const router = useRouter();
  const { email, setEmail, password, setPassword, signUp, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const { fullName, username, photoUri, progressPhotos, currentWeight, targetWeight, dailyCalories, activityLevel, weightUnit, goalDate } = useOnboarding();
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  //Functions
  const onSignup = async () => {
    setError(null);
    const onboardingData = {
      fullName,
      username,
      photoUri,
      progressPhotos,
      currentWeight,
      targetWeight,
      dailyCalories,
      activityLevel,
      weightUnit,
      goalDate
    };
    console.log("[Signup Screen] Data from useOnboarding:", onboardingData);
    const { error: signUpError } = await signUp(onboardingData);
    if (signUpError) {
      setError(signUpError.message);
    }
  };
  const onGoogleLogin = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
    }
  };
  const onAppleLogin = async () => {
    setError(null);
    const { error: appleError } = await signInWithApple();
    if (appleError) {
      setError(appleError.message);
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="w-[362px] mt-6 mx-auto flex-1 justify-center">
          <Animated.View
            entering={FadeInDown.delay(200).duration(250)}
            className="mb-10"
          >
            <Text className="title font-nunito-800 text-white text-4xl">Sign Up</Text>
            <Text className="text-white/50 font-nunito-600 mt-2">Create an account to start your journey.</Text>
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(300).duration(250)}
            className="gap-2 mb-2"
          >
            <TextField
              label="Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              isPassword
            />
            <Checkbox
              checked={acceptedTerms}
              onToggle={() => setAcceptedTerms(!acceptedTerms)}
              label="I accept the terms and"
              underLineLabel="privacy policy"
            />
            <Button
              className="rounded-[30px] w-full py-5 mt-10"
              textClassName="text-xl"
              onPress={onSignup}
              disabled={!acceptedTerms || !email || !password || isLoading}
            >
              {isLoading ? "Signing Up..." : "Sign Up"}
            </Button>
            {error && (
              <View className="mt-4 items-center">
                <Text className="text-pink text-center font-nunito-600">{error}</Text>
                {error.toLowerCase().includes("username") && (
                  <TouchableOpacity onPress={() => router.push("/(onboarding)/(slides)/user-information" as never)} className="mt-2">
                    <Text className="text-yellow font-nunito-700 underline">Change Username</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(400).duration(250)}
            className="flex-row items-center my-10"
          >
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="mx-3 text-white/30 font-nunito-600">Or Register with</Text>
            <View className="flex-1 h-[1px] bg-white/10" />
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(500).duration(250)}
            className="flex-row justify-center gap-4 mb-14"
          >
            <LoginIconButton onPress={onGoogleLogin} icon={<Image source={require("@/assets/icons/google-logo.png")} resizeMode="contain" className="w-[32px] h-auto" />} />
            <LoginIconButton onPress={onAppleLogin} icon={<Image source={require("@/assets/icons/apple-logo.png")} resizeMode="contain" className="w-[32px] h-auto" />} />
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
export default Signup;