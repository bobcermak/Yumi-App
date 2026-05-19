import { Button, Icon } from "@/components";
import type { MagicScanResult } from "@/lib/services/food-search/magic-scan";
import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { ScrollView, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MealLog = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { scanResult: scanResultParam } = useLocalSearchParams<{ scanResult: string }>();

  const result: MagicScanResult | null = scanResultParam
    ? (JSON.parse(scanResultParam) as MagicScanResult)
    : null;

  if (!result) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-white font-nunito-700 text-xl">No scan result</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ paddingBottom: 40 + insets.bottom }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row w-[380px] self-center justify-center items-center py-4 mt-[88px]">
        <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular" />
        </Icon>
        <Text className="font-nunito-700 text-[28px] text-white">Result</Text>
      </View>

      <View className="w-[362px] self-center">
        <Animated.View entering={FadeInDown.duration(300)} className="mt-2 mb-6">
          <Text className="font-nunito-800 text-3xl text-white" numberOfLines={2}>
            {result.name}
          </Text>
          <View className="flex-row items-center mt-2">
            <View className="bg-yellow/10 border border-yellow/20 px-3 py-1 rounded-full">
              <Text className="text-yellow font-nunito-600 text-xs">
                ~{result.weight_g}g · via {result.model}
              </Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).duration(300)} className="flex-row flex-wrap gap-3 mb-6">

        </Animated.View>

       

        <Animated.View entering={FadeInDown.delay(240).duration(300)}>
          <Button
            className="rounded-[30px] mx-0 w-full py-5"
            textClassName="text-xl"
            onPress={() => {}}
          >
            Record
          </Button>
        </Animated.View>
      </View>
    </ScrollView>
  );
};
export default MealLog;
