import { HomeHeader, JourneyCalendar, SearchInput, Button, DailyOverviewCard } from "@/components";
import { useAuth } from "@/lib/hooks/useAuth";
import { format, subDays } from "date-fns";
import { useRouter } from "expo-router";
import { CalendarDots, CaretLeft, CaretRight } from "phosphor-react-native";
import { Text, View, TouchableOpacity, ScrollView } from "react-native";

const Index = () => {
    //Context
    const { userProfile } = useAuth();
    //Router
    const router = useRouter();

    const activeDates = [
        format(subDays(new Date(), 1), "yyyy-MM-dd"),
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
    ];
    const overviewData = {
        date: new Date(),
        calories: { current: 2190, max: 2500 },
        macros: {
            carbs: { current: 133, max: 267 },
            fats: { current: 200, max: 227 },
            protein: { current: 90, max: 150 },
        }
    };
    return (
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
                        <CalendarDots size={24} color="#FFFFFF80" weight="regular"/>
                    </View>
                </View>
                <JourneyCalendar activeDates={activeDates} />
            </View>
            <View className="w-[362px] self-center mt-8">
                <View className="flex-row justify-between items-end">
                    <Button icon={<CalendarDots size={20} color="#1D1D1D" weight="regular"/>}>Today</Button>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => { }}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <CaretLeft size={20} color="white" weight="regular"/>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { }}
                            className="w-10 h-10 rounded-full bg-white/20 items-center justify-center"
                        >
                            <CaretRight size={20} color="white" weight="regular"/>
                        </TouchableOpacity>
                    </View>
                </View>
                <DailyOverviewCard 
                    date={overviewData.date}
                    calories={overviewData.calories}
                    macros={overviewData.macros}
                    onEditCalories={() => console.log('Edit calories')}
                    onEditMacro={(macro) => console.log('Edit macro', macro)}
                />
            </View>
            <View className="h-[1000px]"></View>
        </ScrollView>
    );
};
export default Index;