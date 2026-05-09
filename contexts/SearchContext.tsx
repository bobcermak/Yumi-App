import { createContext, useState, useCallback, type FC, useMemo } from "react";
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
    //Hooks
    const [filter, setFilter] = useState<'My' | 'All'>('My');
    const { query, setQuery, results: searchResults, isLoading: isSearching, source: searchSource, submitSearch } = useFoodSearch();
    
    //Functions
    const fetchPopularMealsFn = useCallback(async () => {
        if (filter === 'All') {
            return await getPopularFoods(5);
        }
        if (!userProfile?.id) return [];
        return await getUserPopularFoods(userProfile.id, 5);
    }, [filter, userProfile?.id]);
    const { data, loading: isLoading, refetch, error } = useFetch(fetchPopularMealsFn, true);
    const refreshPopularMeals = useCallback(async () => {
        await refetch();
    }, [refetch]);
    const popularMeals = useMemo(() => data || [], [data]);
    if (error) {
        console.error(`[SearchContext] Error fetching meals:`, error);
    }
    return (
        <SearchContext.Provider
            value={{
                popularMeals,
                filter,
                setFilter,
                isLoading,
                refreshPopularMeals,
                query,
                setQuery,
                searchResults,
                isSearching,
                searchSource,
                submitSearch,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
export default SearchProvider;