import { Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { HomeHeader } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";

const Index = () => {
  const { userProfile } = useAuth();

  return (
    <ScrollView className="mt-[88px] w-[380px] self-center" showsVerticalScrollIndicator={false}>
      <HomeHeader 
        firstName={userProfile?.full_name?.split(" ")[0] || userProfile?.username || "Friend"}
        avatarUrl={userProfile?.avatar_url}
        rating={userProfile?.total_rating}
        isPremium={userProfile?.is_premium}
        streakCount={userProfile?.streak_count}
      />
    </ScrollView>
  );
};
export default Index;