import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { Icon, SearchInput } from "@/components";
import { CaretLeft } from "phosphor-react-native";

const AddItem = () => {
  //Router
  const router = useRouter();
  return (
    <View className="flex-1 mt-[88px]">
      <View className="flex-row w-[380px] self-center justify-center items-center py-4">
        <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
          <CaretLeft size={24} color="#1D1D1D" weight="regular" />
        </Icon>
        <Text className="font-nunito-700 text-[28px] text-white">Add Item</Text>
      </View>
      <View className="w-[362px] self-center mt-4">
        <SearchInput 
          isInput 
          placeholder="Search to add more..." 
        />
      </View>
      <View className="flex-1 items-center justify-center">
        <Text className="text-white/60">Search for more ingredients...</Text>
      </View>
    </View>
  );
};
export default AddItem;