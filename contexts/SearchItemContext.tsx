import { createContext, useState, useMemo, useEffect, useCallback } from "react";
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

export const SearchItemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    //Contexts
    const { showToast, refreshData, waterMl, handleSetWater } = useIndexContext();
    const { userProfile } = useAuth();
    //Router
    const router = useRouter();
    //Params
    const { item: itemStr, isFavorite: isFavoriteParam } = useGlobalSearchParams<{ id: string, item: string, isFavorite?: string }>();

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
    const [mealType, setMealType] = useState<string>(getMealTypeByTime());
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
            const { mealLog, ingredients } = prepareMealLogData(effectiveItem, mealData, mealType);
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
            router.dismissAll();
            router.replace('/(tabs)/search');
        } catch (error) {
            showToast("Failed to add meal", undefined, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [userProfile?.id, item, mealData, mealType, isDrink, waterMl, handleSetWater, refreshData, showToast, router]);
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
    }), [item, isFavorite, isFavoriteLoading, mealType, mealData, isLoading, isDropdownOpen, isDrink, handleToggleFavorite, handleAddToMeal]);
    return (
        <SearchItemContext.Provider value={value}>
            {children}
        </SearchItemContext.Provider>
    );
};