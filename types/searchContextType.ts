import { Food } from "./database/dbModels";

export type SearchContextType = {
    popularMeals: Food[],
    filter: 'My' | 'All',
    setFilter: (filter: 'My' | 'All') => void,
    isLoading: boolean,
    refreshPopularMeals: () => Promise<void>
};