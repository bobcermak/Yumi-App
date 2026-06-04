import type { FoodSearchResult } from "@/types/foodSearchResult";
import { CheckCircle, X } from "phosphor-react-native";
import { type FC } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

type AdditionalFoodCardProps = {
  food: FoodSearchResult;
  mealType: string;
  onDone: () => void;
};

const AdditionalFoodCard: FC<AdditionalFoodCardProps> = ({ food, mealType, onDone }) => {
  return (
    <Animated.View entering={FadeInDown.duration(300).springify()} style={{ marginTop: 16 }}>
      <View style={{
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(197,227,132,0.07)",
        borderRadius: 16, borderWidth: 1, borderColor: "rgba(197,227,132,0.18)",
        paddingHorizontal: 14, paddingVertical: 12,
      }}>
        <Image
          source={food.image_url ? { uri: food.image_url } : require("@/assets/images/not-found-meal.webp")}
          style={{ width: 44, height: 44, borderRadius: 10 }}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: "#FFFFFF", fontFamily: "Nunito_700Bold", fontSize: 14 }} numberOfLines={1}>
            {food.name}
          </Text>
          <Text style={{ color: "rgba(197,227,132,0.7)", fontFamily: "Nunito_600SemiBold", fontSize: 12, marginTop: 2 }}>
            Added to {mealType}
          </Text>
        </View>
        <CheckCircle size={22} color="#C5E384" weight="fill" style={{ marginRight: 10 }} />
        <TouchableOpacity
          onPress={onDone}
          activeOpacity={0.25}
          style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center" }}
        >
          <X size={13} color="rgba(255,255,255,0.45)" weight="bold" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default AdditionalFoodCard;
