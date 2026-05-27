import { createContext, useState, useCallback, type FC, useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { SearchContextType } from "@/types/searchContextType";
import type { Food } from "@/types/database/dbModels";
import { getPopularFoods, getUserPopularFoods } from "@/lib/services/supabase/queries/foods";
import { searchExternalFoods } from "@/lib/services/food-search/search";
import { useFoodSearch } from "@/lib/hooks/useFoodSearch";
import { posthog } from "@/lib/config/posthog";

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

type SearchProviderProps = {
    children: React.ReactNode
};
const SearchProvider: FC<SearchProviderProps> = ({ children }) => {
    //Contexts
    const { userProfile } = useAuth();
    const { query, setQuery, results: searchResults, isLoading: isSearching, source: searchSource, submitSearch, isPending: isSearchPending, category, setCategory, foodType, setFoodType } = useFoodSearch();
    //Hooks
    const [filter, setFilter] = useState<'My' | 'All'>('My');
    const [hasManuallyChangedFilter, setHasManuallyChangedFilter] = useState<boolean>(false);
    const [popularMealsData, setPopularMealsData] = useState<Food[] | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const fetchVersionRef = useRef<number>(0);

    //Functions
    const handleSetFilter = useCallback((newFilter: 'My' | 'All') => {
        setHasManuallyChangedFilter(true);
        setFilter(newFilter);
    }, []);
    const fetchMeals = useCallback(async () => {
        const version = ++fetchVersionRef.current;
        setIsLoading(true);
        setPopularMealsData(null);
        try {
            if (filter === 'All') {
                let foods = await getPopularFoods(20);
                if (foods.length === 0) {
                    await Promise.allSettled([
                        searchExternalFoods({ query: '', category: 'fruits', maxResults: 4 }),
                        searchExternalFoods({ query: '', category: 'vegetables', maxResults: 4 }),
                    ]);
                    foods = await getPopularFoods(20);
                }
                if (version === fetchVersionRef.current) setPopularMealsData(foods);
            } else {
                if (!userProfile?.id) {
                    if (version === fetchVersionRef.current) setPopularMealsData([]);
                    return;
                }
                const foods = await getUserPopularFoods(userProfile.id, 20);
                if (version === fetchVersionRef.current) setPopularMealsData(foods);
            }
        } catch (err) {
            console.error('[SearchContext] Error fetching meals:', err);
            if (version === fetchVersionRef.current) setPopularMealsData([]);
        } finally {
            if (version === fetchVersionRef.current) setIsLoading(false);
        }
    }, [filter, userProfile?.id]);
    useEffect(() => {
        fetchMeals();
    }, [fetchMeals]);
    const popularMeals = useMemo(() => {
        if (!popularMealsData) return [];
        const unique = new Map();
        popularMealsData.forEach(item => {
            const key = item.name.toLowerCase().trim();
            if (!unique.has(key)) unique.set(key, item);
        });
        return Array.from(unique.values()).slice(0, 5);
    }, [popularMealsData]);
    useEffect(() => {
        if (!isLoading && popularMealsData !== null && filter === 'My' && !hasManuallyChangedFilter && popularMeals.length === 0) {
            setFilter('All');
        }
    }, [isLoading, popularMealsData, filter, hasManuallyChangedFilter, popularMeals.length]);
    const handleSubmitSearch = useCallback(() => {
        if (query.trim().length > 0) {
            posthog.capture('food_searched', {
                query_length: query.trim().length,
                category,
                food_type: foodType,
            });
        }
        submitSearch();
    }, [query, category, foodType, submitSearch]);
    return (
        <SearchContext.Provider
            value={{
                popularMeals,
                filter,
                setFilter: handleSetFilter,
                isLoading,
                refreshPopularMeals: fetchMeals,
                query,
                setQuery,
                searchResults,
                isSearching,
                isSearchPending,
                searchSource,
                submitSearch: handleSubmitSearch,
                category,
                setCategory,
                foodType,
                setFoodType,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
export default SearchProvider;