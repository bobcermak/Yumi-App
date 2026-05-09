import { Food } from "./database/dbModels";
import type { FoodSearchResult } from "./foodSearchResult";

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
    searchSource: 'openfoodfacts' | 'usda' | null;
    submitSearch: () => void;
};