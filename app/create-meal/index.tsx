import { useRouter } from "expo-router";
import { CaretLeft } from "phosphor-react-native";
import { Text, View } from "react-native";
import { Icon } from "@/components";

const CreateMeal = () => {
  //Router
  const router = useRouter();
  return (
    <View className="flex-1 flex-row w-[380px] self-center justify-center items-center mt-[56px] py-4">
      <Icon onPress={() => router.back()} className="absolute left-[4px] bg-yellow w-12 h-12">
        <CaretLeft size={24} color="#1D1D1D" weight="regular" />
      </Icon>
      <Text className="font-nunito-700 text-[28px] text-white">Create Meal</Text>
    </View>
  );
};
export default CreateMeal;