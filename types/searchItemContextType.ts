import { FoodSearchResult } from "./foodSearchResult";

export type SearchItemContextType = {
    item: FoodSearchResult | null,
    setItem: React.Dispatch<React.SetStateAction<FoodSearchResult | null>>,
    isFavorite: boolean,
    isFavoriteLoading: boolean,
    mealType: string,
    setMealType: (type: string) => void,
    mealData: { grams: number; count: number; calories: number; waterMl: number },
    setMealData: React.Dispatch<React.SetStateAction<{ grams: number; count: number; calories: number; waterMl: number }>>,
    isLoading: boolean,
    isDropdownOpen: boolean,
    setIsDropdownOpen: (open: boolean) => void,
    isDrink: boolean,
    setIsDrink: (v: boolean) => void,
    handleToggleFavorite: () => Promise<void>,
    handleAddToMeal: (waterMlOverride?: number) => Promise<void>,
    handleUpdateMeal?: () => Promise<void>,
    handleDeleteMeal?: () => Promise<void>,
    source?: string,
    logDate?: string,
};