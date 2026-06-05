import { createContext, useState, useMemo, useEffect, useCallback, type FC } from "react";
import { useGlobalSearchParams, useRouter } from 'expo-router';
import { FoodSearchResult } from "@/types/foodSearchResult";
import { SearchItemContextType } from "@/types/searchItemContextType";
import { useAuth } from "@/lib/hooks/useAuth";
import { useIndexContext } from "@/lib/hooks/useIndexContext";
import { checkIsFavorite, toggleFavoriteFood, upsertExternalFood } from "@/lib/services/supabase/queries/foods";
import { logMeal } from "@/lib/services/supabase/queries/mealLogs";
import { getMealTypeByTime } from "@/lib/helpers/dateHelpers";
import { prepareMealLogData } from "@/lib/helpers/mealHelpers";
import { format } from "date-fns";
import { posthog } from "@/lib/config/posthog";

export const SearchItemContext = createContext<SearchItemContextType | undefined>(undefined);
export const SearchItemProvider: FC<{ children: React.ReactNode }> = ({ children }) => {
    //Contexts
    const { showToast, refreshData, waterMl, handleSetWater, deleteMeal, updateMeal } = useIndexContext();
    const { userProfile } = useAuth();
    //Router
    const router = useRouter();
    //Params
    const { item: itemStr, isFavorite: isFavoriteParam, mealType: mealTypeParam, source: sourceParam, mealLogId: mealLogIdParam, logDate: logDateParam } = useGlobalSearchParams<{ id: string, item: string, isFavorite?: string, mealType?: string, source?: string, mealLogId?: string, logDate?: string }>();

    const initialItem: FoodSearchResult | null = useMemo(() => {
        try {
            return itemStr ? JSON.parse(itemStr) : null;
        } catch (e) {
            return null;
        }
    }, [itemStr]);
    //Hooks
    const [item, setItem] = useState<FoodSearchResult | null>(initialItem);
    const [isFavorite, setIsFavorite] = useState<boolean>(isFavoriteParam === 'true');
    const [mealType, setMealType] = useState<string>(mealTypeParam || getMealTypeByTime());
    useEffect(() => {
        if (mealTypeParam) setMealType(mealTypeParam);
    }, [mealTypeParam]);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [mealData, setMealData] = useState({ grams: 100, count: 1, calories: 0, waterMl: 100 });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isFavoriteLoading, setIsFavoriteLoading] = useState<boolean>(false);
    const [isDrink, setIsDrink] = useState<boolean>(!!(initialItem?.is_drink));
    //Functions
    useEffect(() => {
        if (initialItem) {
            setItem(initialItem);
            setIsDrink(!!(initialItem.is_drink));
        }
    }, [initialItem]);
    useEffect(() => {
        const fetchFavorite = async () => {
            if (userProfile?.id && item) {
                const favorite = await checkIsFavorite(userProfile.id, item.id, item.name, item.brand);
                setIsFavorite(favorite);
            }
        };
        fetchFavorite();
    }, [userProfile?.id, item]);
    const handleToggleFavorite = useCallback(async () => {
        if (!userProfile?.id || !item || isFavoriteLoading) return;
        setIsFavoriteLoading(true);
        try {
            const { isFavorite: newState, newFoodId } = await toggleFavoriteFood(userProfile.id, item);
            setIsFavorite(newState);
            if (item.id !== newFoodId) {
                setItem(prev => prev ? { ...prev, id: newFoodId } : null);
            }
            posthog.capture('food_favorite_toggled', {
                action: newState ? 'added' : 'removed',
                food_id: item.id,
                food_name: item.name ?? null,
                is_branded: !!item.brand,
            });
            showToast(newState ? "Added to favorites" : "Removed from favorites");
        } catch (error) {
            showToast("Action failed", undefined, 'error');
            console.error("[SearchItemContext] Error toggling favorite:", error);
        } finally {
            setIsFavoriteLoading(false);
        }
    }, [userProfile?.id, item, isFavoriteLoading, showToast]);
    const handleAddToMeal = useCallback(async (waterMlOverride?: number) => {
        if (!userProfile?.id || !item) return;
        setIsLoading(true);
        try {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            let effectiveItem = item;
            if (!uuidRegex.test(item.id)) {
                const foodId = await upsertExternalFood(item, isDrink);
                effectiveItem = { ...item, id: foodId };
                setItem(effectiveItem);
            }
            const { mealLog, ingredients } = prepareMealLogData(effectiveItem, mealData, mealType, logDateParam || undefined);
            await logMeal(
                userProfile.id,
                mealLog,
                ingredients
            );
            if (isDrink) {
                const addedMl = waterMlOverride ?? mealData.waterMl ?? Math.round(mealData.grams * mealData.count);
                await handleSetWater(waterMl + addedMl);
            }
            await refreshData();
            posthog.capture('meal_logged', {
                meal_type: mealType,
                food_id: effectiveItem.id,
                food_name: effectiveItem.name ?? null,
                is_branded: !!effectiveItem.brand,
                grams: mealData.grams,
                count: mealData.count,
                calories: mealData.calories,
                counted_as_drink: isDrink,
            });
            showToast(`Added to ${mealType}!`, format(new Date(), "HH:mm"), 'success');
            router.replace(sourceParam === "addMore" ? '/(tabs)' : '/(tabs)/quick-add');
        } catch (error) {
            showToast("Failed to add meal", undefined, 'error');
            console.error("[SearchItemContext] Error adding to meal:", error);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile?.id, item, mealData, mealType, isDrink, waterMl, handleSetWater, refreshData, showToast, router]);
    const handleUpdateMeal = useCallback(async () => {
        if (!mealLogIdParam || !item) return;
        setIsLoading(true);
        try {
            const factor = mealData.grams / 100;
            const count = mealData.count;
            await updateMeal(mealLogIdParam, {
                total_calories: Math.round((item.calories_per_100g || 0) * factor * count),
                total_carbs: Math.round((item.carbs_per_100g || 0) * factor * count),
                total_fat: Math.round((item.fat_per_100g || 0) * factor * count),
                total_protein: Math.round((item.protein_per_100g || 0) * factor * count),
            });
            showToast("Meal updated!", undefined, 'success');
            router.replace('/(tabs)');
        } catch (error) {
            showToast("Failed to update", undefined, 'error');
            console.error("[SearchItemContext] Error updating meal:", error);
        } finally {
            setIsLoading(false);
        }
    }, [mealLogIdParam, item, mealData, updateMeal, showToast, router]);
    const handleDeleteMeal = useCallback(async () => {
        if (!mealLogIdParam) return;
        setIsLoading(true);
        try {
            await deleteMeal(mealLogIdParam);
            await refreshData();
            showToast("Meal deleted!", undefined, 'success');
            router.replace('/(tabs)');
        } catch (error) {
            showToast("Failed to delete meal", undefined, 'error');
            console.error("[SearchItemContext] Error deleting meal:", error);
        } finally {
            setIsLoading(false);
        }
    }, [mealLogIdParam, deleteMeal, refreshData, showToast, router]);
    const value = useMemo(() => ({
        item,
        setItem,
        isFavorite,
        isFavoriteLoading,
        mealType,
        setMealType,
        mealData,
        setMealData,
        isLoading,
        isDropdownOpen,
        setIsDropdownOpen,
        isDrink,
        setIsDrink,
        handleToggleFavorite,
        handleAddToMeal,
        handleUpdateMeal,
        handleDeleteMeal,
        source: sourceParam,
        logDate: logDateParam || undefined,
    }), [item, isFavorite, isFavoriteLoading, mealType, mealData, isLoading, isDropdownOpen, isDrink, handleToggleFavorite, handleAddToMeal, handleUpdateMeal, handleDeleteMeal, sourceParam, logDateParam]);
    return (
        <SearchItemContext.Provider value={value}>
            {children}
        </SearchItemContext.Provider>
    );
};