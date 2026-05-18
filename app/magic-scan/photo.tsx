import { useLocalSearchParams, useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MagicScanPhoto = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { photoUri } = useLocalSearchParams<{ photoUri: string }>();

  return (
    <View className="flex-1 bg-black">
      {photoUri && (
        <Image
          source={{ uri: photoUri }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
      )}
      <View className="absolute inset-0 bg-black/40" />
      <View style={{ paddingTop: insets.top + 12 }} className="absolute top-0 left-0 right-0 px-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-12 h-12 rounded-full bg-black/50 border border-white/10 items-center justify-center"
        >
          <CaretLeft size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ paddingBottom: insets.bottom + 40 }} className="absolute bottom-0 left-0 right-0 items-center gap-4 px-6">
        <Text className="text-white/60 font-nunito-600 text-base text-center">
          No barcode detected
        </Text>
        <TouchableOpacity
          onPress={() => router.replace("/(tabs)/search")}
          className="bg-yellow px-8 py-4 rounded-[20px] w-full items-center"
        >
          <Text className="text-dark font-nunito-800 text-base">Search manually</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
export default MagicScanPhoto;
