import { FoodSearchResult } from "./foodSearchResult";

export type SearchItemContextType = {
    item: FoodSearchResult | null,
    setItem: React.Dispatch<React.SetStateAction<FoodSearchResult | null>>,
    isFavorite: boolean,
    isFavoriteLoading: boolean,
    mealType: string,
    setMealType: (type: string) => void,
    mealData: { grams: number; count: number; calories: number },
    setMealData: React.Dispatch<React.SetStateAction<{ grams: number; count: number; calories: number }>>,
    isLoading: boolean,
    isDropdownOpen: boolean,
    setIsDropdownOpen: (open: boolean) => void,
    handleToggleFavorite: () => Promise<void>,
    handleAddToMeal: () => Promise<void>
};