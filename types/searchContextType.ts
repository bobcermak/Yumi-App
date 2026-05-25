import { Food } from "./database/dbModels";
import type { FoodSearchResult } from "./foodSearchResult";
import type { FoodCategory, FoodType } from "./searchFilters";

export type SearchContextType = {
    popularMeals: Food[];
    filter: 'My' | 'All';
    setFilter: (filter: 'My' | 'All') => void;
    isLoading: boolean;
    refreshPopularMeals: () => Promise<void>;
    query: string;
    setQuery: (text: string) => void;
    searchResults: FoodSearchResult[];
    isSearching: boolean;
    isSearchPending: boolean;
    searchSource: 'openfoodfacts' | 'usda' | null;
    submitSearch: () => void;
    category: FoodCategory;
    setCategory: (category: FoodCategory) => void;
    foodType: FoodType;
    setFoodType: (foodType: FoodType) => void;
};