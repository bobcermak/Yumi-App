import { View, Text, TouchableOpacity } from "react-native";
import ProfilePicture from "./ProfilePicture";
import Icon from "../buttons/Icon";
import { type FC } from "react";
import { CalendarDots, Bell } from "phosphor-react-native";
import { useRouter } from "expo-router";
import { getEffectiveStreak } from "@/lib/services/supabase/queries/profiles";

type HomeHeaderProps = {
  firstName: string,
  avatarUrl?: string | null,
  rating?: number | null,
  isPremium?: boolean | null,
  streakCount?: number | null,
  lastLogDate?: string | null,
  onCalendarPress: () => void
}
const HomeHeader: FC<HomeHeaderProps> = ({ firstName, avatarUrl, rating, isPremium, streakCount, lastLogDate, onCalendarPress }) => {
  const streak = getEffectiveStreak(streakCount, lastLogDate);
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
    router.push("/(tabs)/profile");
  };
  return (
    <View className="flex-row items-center justify-between px-2 py-3 w-[380px] self-center">
      <View className="flex-row items-center gap-3 flex-1 mr-4">
        <TouchableOpacity onPress={handleProfilePress} activeOpacity={0.25}>
          <ProfilePicture uri={avatarUrl} rating={rating} isPremium={isPremium}/>
        </TouchableOpacity>
        <View className="flex-1">
          <Text className="text-white/50 base-text font-nunito-800" numberOfLines={1}>
            {getStreakMessage()}
          </Text>
          <Text 
            className={`font-nunito-800 ${hasDiacritics ? '-mt-1' : '-mt-2.5'}`} 
            numberOfLines={1} 
            ellipsizeMode="tail"
          >
            <Text className="text-white text-[2rem]">Hey, </Text>
            <Text className="text-pink text-[2rem]">{name}</Text>
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <Icon onPress={onCalendarPress} className="bg-dark w-12 h-12" shadowColor="#000000">
            <CalendarDots size={24} color="white" weight="regular"/>
        </Icon>
        {/* <Icon onPress={() => {}} className="relative bg-dark w-12 h-12" shadowColor="#000000">
            <Bell size={24} color="white" weight="regular"/>
            {true && (
                <View className="absolute top-[12.5px] right-[11px] w-[8px] h-[8px] rounded-full bg-[#CA877E]"/>
            )}
        </Icon> */}
      </View>
    </View>
  );
};
export default HomeHeader;