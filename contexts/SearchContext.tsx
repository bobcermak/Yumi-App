import { createContext, useState, useCallback, type FC, useMemo, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { SearchContextType } from "@/types/searchContextType";
import { getPopularFoods, getUserPopularFoods } from "@/lib/services/supabase/queries/foods";
import { useFetch } from "@/lib/hooks/useFetch";
import { useFoodSearch } from "@/lib/hooks/useFoodSearch";

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

type SearchProviderProps = {
    children: React.ReactNode;
};
const SearchProvider: FC<SearchProviderProps> = ({ children }) => {
    //Contexts
    const { userProfile } = useAuth();
    const { query, setQuery, results: searchResults, isLoading: isSearching, source: searchSource, submitSearch, category, setCategory, foodType, setFoodType } = useFoodSearch();
    //Hooks
    const [filter, setFilter] = useState<'My' | 'All'>('My');
    const [hasManuallyChangedFilter, setHasManuallyChangedFilter] = useState<boolean>(false);

    //Functions
     const handleSetFilter = useCallback((newFilter: 'My' | 'All') => {
        setHasManuallyChangedFilter(true);
        setFilter(newFilter);
    }, []);
    const fetchPopularMealsFn = useCallback(async () => {
        if (filter === 'All') {
            return await getPopularFoods(20);
        }
        if (!userProfile?.id) return [];
        return await getUserPopularFoods(userProfile.id, 20);
    }, [filter, userProfile?.id]);
    const { data, loading: isLoading, refetch, error } = useFetch(fetchPopularMealsFn, true);
    const refreshPopularMeals = useCallback(async () => {
        await refetch();
    }, [refetch]);
    const popularMeals = useMemo(() => {
        if (!data) return [];
        const unique = new Map();
        data.forEach(item => {
            const key = item.name.toLowerCase().trim();
            if (!unique.has(key)) {
                unique.set(key, item);
            }
        });
        return Array.from(unique.values()).slice(0, 5);
    }, [data]);
    if (error) {
        console.error(`[SearchContext] Error fetching meals:`, error);
    }
    useEffect(() => {
        if (!isLoading && filter === 'My' && !hasManuallyChangedFilter && popularMeals.length === 0) {
            setFilter('All');
        }
    }, [isLoading, filter, hasManuallyChangedFilter, popularMeals.length]);
    return (
        <SearchContext.Provider
            value={{
                popularMeals,
                filter,
                setFilter: handleSetFilter,
                isLoading,
                refreshPopularMeals,
                query,
                setQuery,
                searchResults,
                isSearching,
                searchSource,
                submitSearch,
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