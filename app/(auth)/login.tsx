import { Button, Icon, LoginIconButton, TextField } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "expo-router";
import { ArrowLeft } from "phosphor-react-native";
import { useState } from "react";
import { Image, Keyboard, KeyboardAvoidingView, Platform, Text, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const Login = () => {
  //Hooks
  const router = useRouter();
  const { email, setEmail, password, setPassword, signIn, signInWithGoogle, signInWithApple, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  //Functions
  const onLogin = async () => {
    setError(null);
    const { error: signInError } = await signIn();
    if (signInError) {
      setError(signInError.message);
    }
  };
  const onGoogleLogin = async () => {
    setError(null);
    const { error: googleError } = await signInWithGoogle();
    if (googleError) {
      setError(googleError.message);
    }
  }
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
      <Icon className="ml-1" onPress={() => router.push("/(onboarding)")}>
        <ArrowLeft size={20} color="#1D1D1D" />
      </Icon>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="w-[360px] mt-6 mx-auto flex-1 justify-center">
          <Animated.View
            entering={FadeInDown.delay(200).duration(250)}
            className="mb-10"
          >
            <Text className="title font-nunito-800 text-white text-4xl">Welcome Back</Text>
            <Text className="text-white/50 font-nunito-600 mt-2">Log in to continue your progress.</Text>
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
            <TouchableOpacity className="self-end mt-2">
              <Text className="text-yellow font-nunito-700 underline">Forgot Password?</Text>
            </TouchableOpacity>
            <Button
              className="rounded-[30px] w-full py-5 mt-10"
              textClassName="text-xl"
              onPress={onLogin}
              disabled={!email || !password || isLoading}
            >
              {isLoading ? "Logging In..." : "Log In"}
            </Button>
            {error && (
              <Text className="text-pink text-center font-nunito-600 mt-4">{error}</Text>
            )}
          </Animated.View>
          <Animated.View
            entering={FadeInDown.delay(400).duration(250)}
            className="flex-row items-center my-10"
          >
            <View className="flex-1 h-[1px] bg-white/10" />
            <Text className="mx-3 text-white/30 font-nunito-600">Or Login with</Text>
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
export default Login;