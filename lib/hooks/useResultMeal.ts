import { useState, useEffect, useRef } from "react";
import { TextInput } from "react-native";
import { calculateTotalValue, calculateMacros, getMacroRatio, formatMacroDisplay, cleanNumericInput } from "@/lib/helpers/mealHelpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { addToFavorites, checkIsFavorite, removeFromFavorites } from "@/lib/services/supabase/queries/foods";

export type ResultMealData = {
  grams: number,
  count: number,
  calories: number,
  waterMl: number,
};
type UseResultMealProps = {
  id?: string,
  calories_per_100g: number,
  carbs_per_100g: number,
  protein_per_100g: number,
  fat_per_100g: number,
  initialGrams: number,
  initialCount: number,
  isFavoriteExternal?: boolean,
  onToggleFavoriteExternal?: () => void,
  onDataChange?: (data: ResultMealData) => void
}
export const useResultMeal = ({ id, calories_per_100g, carbs_per_100g, protein_per_100g, fat_per_100g, initialGrams, initialCount, isFavoriteExternal, onToggleFavoriteExternal, onDataChange }: UseResultMealProps) => {
  //Context
  const { userProfile } = useAuth();
  const { showToast } = useIndexContext();
  //Refs
  const calorieInputRef = useRef<TextInput>(null);
  const gramsInputRef = useRef<TextInput>(null);
  //Hooks
  const [grams, setGrams] = useState<number>(initialGrams);
  const [count, setCount] = useState<number>(initialCount);
  const [isPercentaged, setIsPercentaged] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<'none' | 'count'>('none');
  const [isCalFocused, setIsCalFocused] = useState<boolean>(false);
  const [calInputVal, setCalInputVal] = useState<string>('');
  const [isGramsFocused, setIsGramsFocused] = useState<boolean>(false);
  const [gramInputVal, setGramInputVal] = useState<string>('');
  const [isFavoriteLocal, setIsFavoriteLocal] = useState<boolean>(false);
  const [waterMl, setWaterMl] = useState<number>(initialGrams * initialCount);

  useEffect(() => {
    setGrams(initialGrams);
  }, [initialGrams]);
  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);
  const isFavorite = isFavoriteExternal ?? isFavoriteLocal;

  // Calculations
  const factor = grams / 100;
  const calories = calculateTotalValue(calories_per_100g, grams, 1);
  const totalCalories = calories * count;
  const carbs = calculateMacros(factor, carbs_per_100g);
  const protein = calculateMacros(factor, protein_per_100g);
  const fat = calculateMacros(factor, fat_per_100g);
  const totalMacros = carbs + protein + fat;
  const carbsRatio = getMacroRatio(carbs, totalMacros);
  const proteinRatio = getMacroRatio(protein, totalMacros);
  const fatRatio = getMacroRatio(fat, totalMacros);
  const carbsDisplay = formatMacroDisplay(carbs, isPercentaged, totalMacros);
  const proteinDisplay = formatMacroDisplay(protein, isPercentaged, totalMacros);
  const fatDisplay = formatMacroDisplay(fat, isPercentaged, totalMacros);
  //Functions
  useEffect(() => {
    setWaterMl(grams * count);
  }, [grams, count]);
  useEffect(() => {
    onDataChange?.({ grams, count, calories: totalCalories, waterMl });
  }, [grams, count, totalCalories, waterMl]);
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      if (userProfile?.id && id && isFavoriteExternal === undefined) {
        const favorite = await checkIsFavorite(userProfile.id, id);
        setIsFavoriteLocal(favorite);
      }
    };
    fetchFavoriteStatus();
  }, [userProfile?.id, id, isFavoriteExternal]);
  const handleToggleFavorite = async () => {
    if (onToggleFavoriteExternal) {
      onToggleFavoriteExternal();
      return;
    }
    if (!userProfile?.id || !id) return;
    const newState = !isFavorite;
    setIsFavoriteLocal(newState);
    try {
      if (newState) {
        await addToFavorites(userProfile.id, id);
      } else {
        await removeFromFavorites(userProfile.id, id);
      }
      showToast(newState ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      setIsFavoriteLocal(!newState);
      showToast("Action failed", undefined, 'error');
      console.error("[useResultMeal] Error toggling favorite:", error);
    }
  };
  const handleGramsDataChange = (newGrams: number) => setGrams(newGrams);
  const handleCaloriesDataChange = (newCalories: number) => {
    if (calories_per_100g === 0) return;
    const newGrams = (newCalories / calories_per_100g) * 100;
    setGrams(Math.round(newGrams));
  };
  const handleCalorieInputChange = (val: string) => {
    let cleanVal = cleanNumericInput(val);
    let numVal = parseInt(cleanVal) || 0;
    if (numVal > 9999) numVal = 9999;
    if (cleanVal !== '') {
      if (calories_per_100g > 0) {
        const expectedGrams = (numVal / calories_per_100g) * 100;
        if (expectedGrams > 9999) {
          setGrams(9999);
          const maxCals = Math.min(Math.round(calories_per_100g * 99.99), 9999);
          setCalInputVal(maxCals.toString());
          return;
        }
      }
      handleCaloriesDataChange(numVal);
      setCalInputVal(numVal.toString());
    } else {
      handleCaloriesDataChange(0);
      setCalInputVal('');
    }
  };
  const handleGramsInputChange = (val: string) => {
    let cleanVal = cleanNumericInput(val);
    let numVal = parseInt(cleanVal) || 0;
    if (numVal > 9999) numVal = 9999;
    if (cleanVal !== '') {
      if (calories_per_100g > 0) {
        const expectedCals = Math.round(calories_per_100g * (numVal / 100));
        if (expectedCals > 9999) {
          const maxGrams = Math.min(Math.round((9999 / calories_per_100g) * 100), 9999);
          setGrams(maxGrams);
          setGramInputVal(maxGrams.toString());
          return;
        }
      }
      setGramInputVal(numVal.toString());
      handleGramsDataChange(numVal);
    } else {
      setGramInputVal('');
      handleGramsDataChange(0);
    }
  };
  return {
    state: {
      grams,
      count,
      isPercentaged,
      editMode,
      isCalFocused,
      calInputVal,
      isGramsFocused,
      gramInputVal,
      waterMl,
      calories,
      totalCalories,
      carbsRatio,
      proteinRatio,
      fatRatio,
      carbsDisplay,
      proteinDisplay,
      fatDisplay,
      isFavorite
    },
    refs: {
      calorieInputRef,
      gramsInputRef,
    },
    handlers: {
      setEditMode,
      setIsPercentaged,
      setIsCalFocused,
      setCalInputVal,
      setIsGramsFocused,
      setGramInputVal,
      handleDecrementCount: () => setCount(prev => Math.max(1, prev - 1)),
      handleIncrementCount: () => setCount(prev => prev + 1),
      handleTogglePercentage: () => setIsPercentaged(prev => !prev),
      handleCalorieInputChange,
      handleGramsInputChange,
      handleToggleFavorite,
      handleCalorieFocus: () => {
        setCalInputVal(calories.toString());
        setIsCalFocused(true);
      },
      handleGramsFocus: () => {
        setGramInputVal(grams.toString());
        setIsGramsFocused(true);
      },
    }
  };
};