import { Icon, MealCard } from "@/components";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import type { FoodSearchResult } from "@/types/foodSearchResult";
import { computeHealthRating } from "@/lib/helpers/mealHelpers";
import { differenceInCalendarDays, format, isToday, isYesterday } from "date-fns";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Cookie, CookingPot, EggCrack, Orange, Pizza, Plus } from "phosphor-react-native";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeIn, FadeOut, useAnimatedStyle, useSharedValue, withRepeat, withTiming, Easing } from "react-native-reanimated";

const DashboardSheet = forwardRef<BottomSheet>(function DashboardSheet(props, ref) {
  const router = useRouter();
  //Context
  const { mealLogs, deleteMeal, updateMeal, showToast, dashboardDate } = useIndexContext();
  //Hooks
  const internalRef = useRef<BottomSheet>(null);
  const scrollViewRef = useRef<any>(null);
  const scrollOffsetRef = useRef(0);
  useImperativeHandle(ref, () => internalRef.current as BottomSheet);
  const [isSheetLoading, setIsSheetLoading] = useState<boolean>(false);
  const snapPoints = useMemo(() => [105, "20%", "35%", "50%", "65%", "80%"], []);
  const currentMealType = useMemo(() => getMealTypeByTime(), []);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(currentMealType);
  const dateLabel = useMemo(() => {
    if (isToday(dashboardDate)) return "Today's Food";
    if (isYesterday(dashboardDate)) return "Yesterday's Food";
    const daysAgo = differenceInCalendarDays(new Date(), dashboardDate);
    if (daysAgo <= 6) return `${format(dashboardDate, "EEEE")}'s Food`;
    return `${format(dashboardDate, "d MMM")}'s Food`;
  }, [dashboardDate]);
  const mealSections = useMemo(() => {
    const sections = [
      { title: "Breakfast", type: "breakfast", icon: <EggCrack size={20} color="#84C754" weight="regular" /> },
      { title: "Morning Snack", type: "morning_snack", icon: <Cookie size={20} color="#84C754" weight="regular" /> },
      { title: "Lunch", type: "lunch", icon: <CookingPot size={20} color="#84C754" weight="regular" /> },
      { title: "Afternoon Snack", type: "afternoon_snack", icon: <Orange size={20} color="#84C754" weight="regular" /> },
      { title: "Dinner", type: "dinner", icon: <Pizza size={20} color="#84C754" weight="regular" /> },
    ];
    return sections.map(section => {
      const logsForType = mealLogs.filter(log => log.type === section.type);
      const ingredients = logsForType.flatMap(log => {
        const grouped = new Map<string, typeof log.meal_ingredients>();
        for (const ing of log.meal_ingredients) {
          const key = (ing.food_id ?? ing.name) + '_' + log.id;
          if (!grouped.has(key)) grouped.set(key, []);
          grouped.get(key)!.push(ing);
        }
        const items = Array.from(grouped.values()).map(items => {
          const first = items[0];
          const totalCal = items.reduce((sum, i) => sum + i.calories, 0);
          const totalAmount = items.reduce((sum, i) => sum + i.amount_g, 0);
          const cal100 = totalAmount > 0 ? (totalCal / totalAmount) * 100 : totalCal;
          const totalCarbs = items.reduce((sum, i) => sum + (i.carbs || 0), 0);
          const totalFat = items.reduce((sum, i) => sum + (i.fat || 0), 0);
          const totalProtein = items.reduce((sum, i) => sum + (i.protein || 0), 0);
          const carbs100 = totalAmount > 0 ? (totalCarbs / totalAmount) * 100 : 0;
          const fat100 = totalAmount > 0 ? (totalFat / totalAmount) * 100 : 0;
          const protein100 = totalAmount > 0 ? (totalProtein / totalAmount) * 100 : 0;
          const foodItem: FoodSearchResult = {
            id: first.food_id || first.id,
            name: first.name,
            calories_per_100g: cal100,
            carbs_per_100g: carbs100,
            fat_per_100g: fat100,
            protein_per_100g: protein100,
            health_rating: computeHealthRating({ calories_per_100g: cal100, protein_per_100g: protein100, fat_per_100g: fat100, carbs_per_100g: carbs100 }),
            source: "usda",
          };
          return {
            id: first.id,
            mealLogId: log.id,
            title: first.name,
            cal: totalCal,
            count: items.length > 1 ? items.length : undefined,
            baseCal: items.length > 1 ? first.calories : undefined,
            foodItem,
          };
        });
        if (items.length === 0 && (log.total_calories || 0) > 0) {
          const fbCal = log.total_calories || 0;
          const fbCarbs = log.total_carbs || 0;
          const fbFat = log.total_fat || 0;
          const fbProtein = log.total_protein || 0;
          const fallbackFood: FoodSearchResult = {
            id: log.id,
            name: log.name,
            calories_per_100g: fbCal,
            carbs_per_100g: fbCarbs,
            fat_per_100g: fbFat,
            protein_per_100g: fbProtein,
            health_rating: computeHealthRating({ calories_per_100g: fbCal, protein_per_100g: fbProtein, fat_per_100g: fbFat, carbs_per_100g: fbCarbs }),
            source: "usda",
          };
          return [{ id: log.id, mealLogId: log.id, title: log.name, cal: log.total_calories || 0, count: undefined, baseCal: undefined, foodItem: fallbackFood }];
        }
        return items;
      });
      const totalCal = logsForType.reduce((sum, log) => sum + (log.total_calories || 0), 0);
      return { ...section, ingredients, totalCal };
    });
  }, [mealLogs]);
  useEffect(() => {
    const offset = scrollOffsetRef.current;
    if (offset > 0) {
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo({ y: offset, animated: false });
      });
    }
  }, [mealSections]);
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 900, easing: Easing.linear }),
      -1
    );
  }, []);
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  //Functions
  const handleIngredientEdit = async (mealLogId: string, newCal: number) => {
    setIsSheetLoading(true);
    try {
      await updateMeal(mealLogId, { total_calories: newCal });
    } catch {
      showToast("Update failed", undefined, 'error');
    } finally {
      setIsSheetLoading(false);
    }
  };
  const handleIngredientDelete = (mealLogId: string) => {
    Alert.alert(
      "Remove meal",
      "Are you sure you want to remove this meal?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setIsSheetLoading(true);
            try {
              await deleteMeal(mealLogId);
            } catch {
              showToast("Delete failed", undefined, 'error');
            } finally {
              setIsSheetLoading(false);
            }
          },
        },
      ]
    );
  };
  const handleIngredientPress = (ingId: string | number, sectionIngredients: typeof mealSections[0]['ingredients']) => {
    const ing = sectionIngredients.find(i => i.id === ingId);
    if (!ing || !('foodItem' in ing) || !ing.foodItem) return;
    router.push({
      pathname: "/search-item/[id]",
      params: {
        id: ing.foodItem.id,
        item: JSON.stringify(ing.foodItem),
        mealLogId: ing.mealLogId,
        mealType: "",
        source: "delete",
      },
    });
  };
  return (
    <BottomSheet
      ref={internalRef}
      index={1}
      snapPoints={snapPoints}
      detached={false}
      bottomInset={0}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      backgroundStyle={{ backgroundColor: '#121212' }}
      style={{
        marginHorizontal: 16,
        borderRadius: 40,
        overflow: 'hidden',
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#FFFFFF10'
      }}
      handleIndicatorStyle={{
        backgroundColor: '#FFFFFF',
        width: 40,
        height: 4,
        borderRadius: 100,
        marginTop: 12
      }}
      enableOverDrag={false}
    >
      {isSheetLoading && (
        <Animated.View
          entering={FadeIn.duration(180)}
          exiting={FadeOut.duration(180)}
          className="absolute inset-0 z-50 items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        >
          <Animated.View
            entering={FadeIn.duration(220).springify()}
            className="items-center gap-3 px-8 py-6 rounded-[24px] border border-white/10"
            style={{
              backgroundColor: '#1A1A1A',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.5,
              shadowRadius: 20,
              elevation: 20,
            }}
          >
            <Animated.View style={spinnerStyle}>
              <View
                className="w-10 h-10 rounded-full border-[3px] border-transparent"
                style={{ borderTopColor: '#C5E384', borderRightColor: '#C5E38440' }}
              />
            </Animated.View>
            <Text className="text-white/70 font-nunito-700 text-sm tracking-wide">Updating...</Text>
          </Animated.View>
        </Animated.View>
      )}
      <BottomSheetScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        onScroll={({ nativeEvent }) => { scrollOffsetRef.current = nativeEvent.contentOffset.y; }}
      >
        <View className="px-5">
          <View className="flex-row justify-between items-center mt-10 pb-5">
            <TouchableOpacity activeOpacity={0.25} onPress={() => internalRef.current?.snapToIndex(3)} className="flex-1 mr-3">
              <Text className="text-white text-xl font-nunito-800">{dateLabel}</Text>
            </TouchableOpacity>
            <Icon className="w-[36px] h-[36px]" onPress={() => router.push({ pathname: "/(tabs)/quick-add", params: { mealType: currentMealType, logDate: isToday(dashboardDate) ? "" : format(dashboardDate, 'yyyy-MM-dd') } })}>
              <Plus size={24} color="#1D1D1D" weight="regular" />
            </Icon>
          </View>
          <View className="mt-1 gap-4 pb-10">
            {mealSections.map((section) => (
              <MealCard
                key={section.type}
                icon={section.icon}
                title={section.title}
                allCal={Math.round(section.totalCal)}
                isDayTime={isToday(dashboardDate) && currentMealType === section.title}
                expanded={expandedMeal === section.title}
                onToggle={() => setExpandedMeal(expandedMeal === section.title ? null : section.title)}
                onAddPress={() => router.push({ pathname: "/(tabs)/quick-add", params: { mealType: section.title, logDate: isToday(dashboardDate) ? "" : format(dashboardDate, 'yyyy-MM-dd') } })}
                ingredients={section.ingredients}
                onIngredientEdit={(id, newCal) => {
                  const ing = section.ingredients.find(i => i.id === id);
                  if (ing) handleIngredientEdit(ing.mealLogId, newCal);
                }}
                onIngredientDelete={(id) => {
                  const ing = section.ingredients.find(i => i.id === id);
                  if (ing) handleIngredientDelete(ing.mealLogId);
                }}
                onIngredientPress={(id) => handleIngredientPress(id, section.ingredients)}
              />
            ))}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
DashboardSheet.displayName = "DashboardSheet";
export default DashboardSheet;