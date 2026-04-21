import { Button, FloatingImage } from "@/components";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

const WelcomeScreen = () => {
  //Hooks
  const router = useRouter();

  return (
    <View className="flex-1 mt-[200px] justify-end">
      <View className="w-full items-center justify-center relative -top-[12.5%]">
        <FloatingImage
          source={require("@/assets/images/yumi-welcome.png")}
          resizeMode="cover"
          className="z-10"
          imageClassName="w-80 h-80"
          style={{
            shadowColor: "#000000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        />
        <Image
          source={require("@/assets/images/app-menu.png")}
          resizeMode="contain"
          className="w-[100px] h-auto absolute rotate-[-15deg] left-10 z-0 -translate-y-[140px]"
          style={{
            shadowColor: "#C5E384",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        />
        <Image
          source={require("@/assets/images/app-add-food--magic-scan.png")}
          resizeMode="contain"
          className="w-[100px] h-auto absolute left-[62.5%] z-0 -translate-y-[100px] rotate-[20deg]"
          style={{
            shadowColor: "#C5E384",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
          }}
        />
        <Image
          source={require("@/assets/images/app-search.png")}
          resizeMode="contain"
          className="w-[100px] h-auto absolute left-[20%] z-0 -translate-y-[-130px] rotate-[-30deg]"
          style={{
            shadowColor: "#C5E384",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.25,
            shadowRadius: 4
          }}
        />
      </View>
      <View className="bg-dark p-8 py-16 rounded-t-[40px] shadow-xl gap-[2rem]">
        <View className="max-w-[340px]">
          <Text className="title text-5xl text-center font-nunito-800 text-white leading-[44px] pt-2">Welcome to <Text className="text-yellow">Yumi</Text> app</Text>
          <Text className="base-text text-center text-white/50 mt-3">Skip the search. <Text className="font-nunito-700 text-yellow">Yumi's AI scans</Text> and identifies your food instantly. Your camera is now your <Text className="font-nunito-700 text-pink">nutritionist</Text>.</Text>
        </View>
        <Button className="rounded-[30px] mx-0 w-full py-5 px-2" textClassName="text-xl" onPress={() => router.push("/user-information")}>
          Get Started
        </Button>
        <TouchableOpacity>
          <Text className="base-text text-center font-nunito-700">Already have an account? <Text className="font-nunito-700 text-yellow">Log In</Text></Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
export default WelcomeScreen;