import { Icon } from "@/components";
import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Text, View } from "react-native";

const SearchResults = () => {
  //Router
  const router = useRouter();
  return (
    <View className="flex-1 mt-[88px]">
      <View className="flex-row w-[380px] self-center justify-center items-center py-4">
        <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular" />
        </Icon>
        <Text className="font-nunito-700 text-[28px] text-white">Results</Text>
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-white/60">Search results will be here...</Text>
      </View>
    </View>
  );
};
export default SearchResults;