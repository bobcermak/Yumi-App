import { Icon, MealCard } from "@/components";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Cookie, CookingPot, EggCrack, Orange, Pizza, Plus } from "phosphor-react-native";
import { forwardRef, useMemo, useState, useEffect, useRef, useImperativeHandle } from "react";
import { Text, View, Keyboard } from "react-native";

const DashboardSheet = forwardRef<BottomSheet>((props, ref) => {
  //Hooks
  const internalRef = useRef<BottomSheet>(null);
  useImperativeHandle(ref, () => internalRef.current as BottomSheet);
  const [isKeyboardVisible, setKeyboardVisible] = useState<boolean>(false);
  const snapPoints = useMemo(() => {
    return isKeyboardVisible 
      ? [105, "20%", "35%", "50%", "65%", "80%", "100%"]
      : [105, "20%", "35%", "50%", "65%", "80%"];
  }, [isKeyboardVisible]);
  const currentMeal = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 10) return "Breakfast";
    if (hour >= 10 && hour < 12) return "Morning Snack";
    if (hour >= 12 && hour < 15) return "Lunch";
    if (hour >= 15 && hour < 18) return "Afternoon Snack";
    return "Dinner";
  }, []);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(currentMeal);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        internalRef.current?.snapToIndex(6);
      }, 50);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
      internalRef.current?.snapToIndex(5);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  return (
    <BottomSheet
      ref={internalRef}
      index={3}
      snapPoints={snapPoints}
      detached={false}
      bottomInset={0}
      backgroundStyle={{
        backgroundColor: '#121212',
      }}
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
      <BottomSheetScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5">
          <View className="flex-row justify-between items-center mt-10 pb-5">
            <Text className="text-white text-xl font-nunito-800">Today&apos;s Food</Text>
            <Icon className="w-[36px] h-[36px]" onPress={() => { }}>
              <Plus size={24} color="#1D1D1D" weight="regular" />
            </Icon>
          </View>
          <View className="mt-1 gap-4 pb-10">
            <MealCard
              icon={<EggCrack size={20} color="#84C754" weight="regular" />}
              title="Breakfast"
              allCal={0}
              isDayTime={currentMeal === "Breakfast"}
              expanded={expandedMeal === "Breakfast"}
              onToggle={() => setExpandedMeal(expandedMeal === "Breakfast" ? null : "Breakfast")}
            />
            <MealCard
              icon={<Cookie size={20} color="#84C754" weight="regular" />}
              title="Morning Snack"
              allCal={221}
              isDayTime={currentMeal === "Morning Snack"}
              expanded={expandedMeal === "Morning Snack"}
              onToggle={() => setExpandedMeal(expandedMeal === "Morning Snack" ? null : "Morning Snack")}
              ingredients={[
                { id: 1, title: 'Cookie', cal: 100 },
                { id: 2, amount: '2x', title: 'Avocado', baseCal: 60.5, cal: 121 }
              ]}
            />
            <MealCard
              icon={<CookingPot size={20} color="#84C754" weight="regular" />}
              title="Lunch"
              allCal={0}
              isDayTime={currentMeal === "Lunch"}
              expanded={expandedMeal === "Lunch"}
              onToggle={() => setExpandedMeal(expandedMeal === "Lunch" ? null : "Lunch")}
            />
            <MealCard
              icon={<Orange size={20} color="#84C754" weight="regular" />}
              title="Afternoon Snack"
              allCal={0}
              isDayTime={currentMeal === "Afternoon Snack"}
              expanded={expandedMeal === "Afternoon Snack"}
              onToggle={() => setExpandedMeal(expandedMeal === "Afternoon Snack" ? null : "Afternoon Snack")}
            />
            <MealCard
              icon={<Pizza size={20} color="#84C754" weight="regular" />}
              title="Dinner"
              allCal={221}
              isDayTime={currentMeal === "Dinner"}
              expanded={expandedMeal === "Dinner"}
              onToggle={() => setExpandedMeal(expandedMeal === "Dinner" ? null : "Dinner")}
              ingredients={[
                { id: 1, title: 'Cookie', cal: 100 },
                { id: 2, amount: '2x', title: 'Avocado', baseCal: 60.5, cal: 121 }
              ]}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
export default DashboardSheet;