import { View, Text } from "react-native";
import { Image } from "expo-image";
import { TrendUp, TrendDown } from "phosphor-react-native";

type ProfilePictureProps = {
  size?: number,
  uri?: string | null,
  rating?: number | null,
  isPremium?: boolean | null
};
type TrendIcon = typeof TrendUp | typeof TrendDown;
const ProfilePicture = ({ size = 60, uri, rating, isPremium }: ProfilePictureProps) => {
  //Functions
  const getRatingColorAndTrend = (rating?: number | null): {color: string, trend: TrendIcon} => {
    if (rating === undefined || rating === null) return { color: "#CA877E", trend: TrendDown };
    if (rating >= 8) return { color: "#84C754", trend: TrendUp};
    if (rating >= 4) return { color: "#C5E384", trend: TrendUp};
    return { color: "#CA877E", trend: TrendDown};
  };
  //Constants
  const ratingColorAndTrend = getRatingColorAndTrend(rating);
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
            backgroundColor: ratingColorAndTrend.color,
            transform: [{ translateX: "-50%" }] 
          }} 
          className="absolute -bottom-[10px] left-[50%] p-1 rounded-[6px] flex-row items-center gap-0.5"
        >
          <Text className="text-dark text-xs font-nunito-700">
            {rating.toFixed(1)}
          </Text>
          <ratingColorAndTrend.trend size={12} color="#1D1D1D" weight="bold"/>
        </View>
      )}
    </View>
  );
};
export default ProfilePicture;