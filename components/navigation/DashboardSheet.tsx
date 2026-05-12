import { Icon, MealCard } from "@/components";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Cookie, CookingPot, EggCrack, Orange, Pizza, Plus } from "phosphor-react-native";
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Keyboard, Text, View } from "react-native";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";

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
  const currentMeal = useMemo(() => getMealTypeByTime(), []);
  const [expandedMeal, setExpandedMeal] = useState<string | null>(currentMeal);
  const [meals, setMeals] = useState<{ title: string, icon: React.ReactNode, ingredients: { id: string | number, amount?: string, title: string, baseCal?: number, cal: number }[] }[]>([
    {
      title: "Breakfast",
      icon: <EggCrack size={20} color="#84C754" weight="regular" />,
      ingredients: []
    },
    {
      title: "Morning Snack",
      icon: <Cookie size={20} color="#84C754" weight="regular" />,
      ingredients: [
        { id: 1, title: 'Cookie', cal: 100 },
        { id: 2, amount: '2x', title: 'Avocado', baseCal: 60.5, cal: 121 }
      ]
    },
    {
      title: "Lunch",
      icon: <CookingPot size={20} color="#84C754" weight="regular" />,
      ingredients: []
    },
    {
      title: "Afternoon Snack",
      icon: <Orange size={20} color="#84C754" weight="regular" />,
      ingredients: []
    },
    {
      title: "Dinner",
      icon: <Pizza size={20} color="#84C754" weight="regular" />,
      ingredients: [
        { id: 1, title: 'Cookie', cal: 100 },
        { id: 2, amount: '2x', title: 'Avocado', baseCal: 60.5, cal: 121 }
      ]
    }
  ]);
  //Functions
  const updateIngredientCal = (mealTitle: string, ingredientId: string | number, newCal: number) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.title === mealTitle) {
        return {
          ...meal,
          ingredients: meal.ingredients.map(ing =>
            ing.id === ingredientId ? { ...ing, cal: newCal } : ing
          )
        };
      }
      return meal;
    }));
  };
  const deleteIngredient = (mealTitle: string, ingredientId: string | number) => {
    setMeals(prevMeals => prevMeals.map(meal => {
      if (meal.title === mealTitle) {
        return {
          ...meal,
          ingredients: meal.ingredients.filter(ing => ing.id !== ingredientId)
        };
      }
      return meal;
    }));
  };
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });
    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  return (
    <BottomSheet
      ref={internalRef}
      index={1}
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
            {meals.map((meal) => {
              const totalCal = meal.ingredients.reduce((sum, ing) => sum + (ing.cal || 0), 0);
              return (
                <MealCard
                  key={meal.title}
                  icon={meal.icon}
                  title={meal.title}
                  allCal={totalCal}
                  isDayTime={currentMeal === meal.title}
                  expanded={expandedMeal === meal.title}
                  onToggle={() => setExpandedMeal(expandedMeal === meal.title ? null : meal.title)}
                  ingredients={meal.ingredients}
                  onIngredientEdit={(id, newCal) => updateIngredientCal(meal.title, id, newCal)}
                  onIngredientDelete={(id) => deleteIngredient(meal.title, id)}
                />
              );
            })}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});
export default DashboardSheet;