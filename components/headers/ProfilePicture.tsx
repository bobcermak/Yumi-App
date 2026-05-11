import { View, Text } from "react-native";
import { Image } from "expo-image";
import { TrendUp, TrendDown, Minus } from "phosphor-react-native";

type ProfilePictureProps = {
  size?: number,
  uri?: string | null,
  rating?: number | null,
  isPremium?: boolean | null,
  trend?: "up" | "down" | "stable"
};
const ProfilePicture = ({ size = 60, uri, rating, isPremium, trend = "up" }: ProfilePictureProps) => {
  //Functions
  const getRatingColor = (rating?: number | null): string => {
    if (rating === undefined || rating === null) return "#FFFFFF30";
    if (rating >= 8) return "#84C754";
    if (rating >= 6) return "#C5E384";
    if (rating >= 4) return "#ED8936";
    return "#E53E3E";
  };
  //Constants
  const ratingColor = getRatingColor(rating);
  const TrendIcon = trend === "up" ? TrendUp : trend === "down" ? TrendDown : Minus;
  return (
    <View style={{ width: size, height: size }} className="relative">
      <View className="w-full h-full rounded-full border-2 border-pink overflow-hidden opacity-80">
        <Image
          source={uri ? { uri } : require("@/assets/images/anon-profile-picture.jpg")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>
      {isPremium && (
        <View className="absolute -top-3 left-6 bg-green py-1 px-2 rounded-[12px]">
          <Text className="text-white text-xs font-nunito-700">Yumi+</Text>
        </View>
      )}
      {rating !== undefined && rating !== null && (
        <View 
          style={{ 
            backgroundColor: ratingColor, 
            transform: [{ translateX: "-50%" }] 
          }} 
          className="absolute -bottom-[10px] left-[50%] p-1 rounded-[6px] flex-row items-center gap-0.5"
        >
          <Text className="text-dark text-xs font-nunito-700">
            {rating.toFixed(1)}
          </Text>
          <TrendIcon size={12} color="#1D1D1D" weight="bold"/>
        </View>
      )}
    </View>
  );
};
export default ProfilePicture;