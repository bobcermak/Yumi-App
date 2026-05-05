import { View, Text } from "react-native";
import { Image } from "expo-image";
import { TrendUp } from "phosphor-react-native";

type ProfilePictureProps = {
  size?: number;
  uri?: string | null;
  rating?: number | null;
  isPremium?: boolean | null;
};
const ProfilePicture = ({ size = 60, uri, rating, isPremium }: ProfilePictureProps) => {
  const displayUri = uri;
  const displayRating = rating;
  const displayIsPremium = isPremium;

  return (
    <View style={{ width: size, height: size }} className="relative">
      <View className="w-full h-full rounded-full border-2 border-pink overflow-hidden opacity-80">
        <Image
          source={displayUri ? { uri: displayUri } : require("@/assets/images/anon-profile-picture.jpg")}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />
      </View>
      {displayIsPremium && (
        <View className="absolute -top-3 left-6 bg-green py-1 px-2 rounded-[12px]">
          <Text className="text-white text-xs font-nunito-700">Yumi+</Text>
        </View>
      )}
      {displayRating !== undefined && displayRating !== null && (
        <View className="absolute -bottom-[10px] left-[50%] translate-x-[-50%] bg-yellow p-1 rounded-[6px] flex-row items-center gap-0.5">
          <Text className="text-dark text-xs font-nunito-700">{displayRating.toFixed(1)}</Text>
          <TrendUp size={12} color="#1D1D1D" weight="bold"/>
        </View>
      )}
    </View>
  );
};
export default ProfilePicture;