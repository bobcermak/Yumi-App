import { View, Text, TouchableOpacity } from "react-native";
import { ProfilePicture, Icon } from "@/components";
import { type FC } from "react";
import { CalendarDots, Bell } from "phosphor-react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

type HomeHeaderProps = {
  firstName: string,
  avatarUrl?: string | null,
  rating?: number | null,
  isPremium?: boolean | null,
  streakCount?: number | null
}
const HomeHeader: FC<HomeHeaderProps> = ({ firstName, avatarUrl, rating, isPremium, streakCount }) => {
  const streak = streakCount || 0;
  const name = firstName || "Friend";
  const router = useRouter();
  const hasDiacritics = /[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/.test(name);

  //Functions
  const getStreakMessage = () => {
    if (streak === 0) return "Start your journey!";
    const dayText = streak === 1 ? "day" : "days";
    if (streak < 7) return `${streak} ${dayText} strong!`;
    if (streak < 30) return `${streak} ${dayText}! Keep it up!`;
    return `${streak} ${dayText}! Unstoppable!`;
  };
  const handleProfilePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(tabs)/profile");
  };
  return (
    <View className="flex-row items-center justify-between px-2 py-3 w-[380px] self-center">
      <View className="flex-row items-center gap-3">
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.25}>
          <ProfilePicture uri={avatarUrl} rating={rating} isPremium={isPremium}/>
        </TouchableOpacity>
        <View>
          <Text className="text-white/50 base-text font-nunito-800">
            {getStreakMessage()}
          </Text>
          <View className={`flex-row items-center ${hasDiacritics ? '-mt-0.5' : '-mt-2'}`}>
            <Text className="text-white text-[2rem] font-nunito-800">Hey, </Text>
            <Text className="text-pink text-[2rem] font-nunito-800">{name}</Text>
          </View>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Icon onPress={() => {}} className="bg-dark w-12 h-12" shadowColor="#000000">
            <CalendarDots size={24} color="white" weight="regular"/>
        </Icon>
        <Icon onPress={() => {}} className="relative bg-dark w-12 h-12" shadowColor="#000000">
            <Bell size={24} color="white" weight="regular"/>
            {true && (
                <View className="absolute top-[12.5px] right-[11px] w-[8px] h-[8px] rounded-full bg-[#CA877E]"/>
            )}
        </Icon>
      </View>
    </View>
  );
};
export default HomeHeader;