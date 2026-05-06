import { DailyOverviewCard, HomeHeader, JourneyCalendar, SearchInput, Toast, Button } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { useRouter } from "expo-router";
import { CalendarDots, CaretLeft, CaretRight } from "phosphor-react-native";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import IndexProvider from "@/contexts/IndexContext";

const IndexContent = () => {
    //Contexts
    const { userProfile } = useAuth();
    const { toast, overviewData, handleUpdateCaloriesMax, activeDates, targetDate } = useIndexContext();
    //Router
    const router = useRouter();
    return (
        <View className="flex-1">
            <Toast toast={toast}/>
            <ScrollView className="mt-[88px] w-[380px] self-center" showsVerticalScrollIndicator={false}>
                <View className="gap-4">
                    <HomeHeader
                        firstName={userProfile?.full_name?.split(" ")[0] || userProfile?.username || "Friend"}
                        avatarUrl={userProfile?.avatar_url}
                        rating={userProfile?.total_rating}
                        isPremium={userProfile?.is_premium}
                        streakCount={userProfile?.streak_count}
                    />
                    <SearchInput
                        className="w-[362px] self-center"
                        onSearchPress={() => router.push("/(tabs)/search?focus=true")}
                    />
                </View>
                <View className="w-[362px] self-center mt-8">
                    <View className="flex-row justify-between items-end">
                        <Text className="title">My Journey</Text>
                        <View className="pl-4 pt-2">
                            <CalendarDots size={24} color="#FFFFFF80" weight="regular" />
                        </View>
                    </View>
                    <JourneyCalendar activeDates={activeDates} targetDate={targetDate}/>
                </View>
                <View className="w-[362px] self-center mt-8">
                    <View className="flex-row justify-between items-end">
                        <Button icon={<CalendarDots size={20} color="#1D1D1D" weight="regular" />}>Today</Button>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => { }}
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                            >
                                <CaretLeft size={20} color="white" weight="regular" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => { }}
                                className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                            >
                                <CaretRight size={20} color="white" weight="regular" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <DailyOverviewCard
                        date={overviewData.date}
                        calories={overviewData.calories}
                        macros={overviewData.macros}
                        onUpdateCaloriesMax={handleUpdateCaloriesMax}
                    />
                </View>
                <View className="h-[1000px]"></View>
            </ScrollView>
        </View>
    );
};
const Index = () => {
    return (
        <IndexProvider>
            <IndexContent/>
        </IndexProvider>
    );
};
export default Index;