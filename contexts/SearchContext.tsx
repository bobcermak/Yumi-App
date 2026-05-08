import { createContext, useState, useCallback, type FC, useMemo } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import type { SearchContextType } from "@/types/searchContextType";
import { getPopularFoods, getUserPopularFoods } from "@/lib/services/supabase/queries/foods";
import { useFetch } from "@/lib/hooks/useFetch";

export const SearchContext = createContext<SearchContextType | undefined>(undefined);

type SearchProviderProps = {
    children: React.ReactNode
}
const SearchProvider: FC<SearchProviderProps> = ({ children }) => {
    //Hooks
    const { userProfile } = useAuth();
    const [filter, setFilter] = useState<'My' | 'All'>('My');

    //Functions
    const fetchPopularMealsFn = useCallback(async () => {
        console.log(`[SearchContext] Fetching meals for filter: ${filter}...`);
        if (filter === 'All') {
            const data = await getPopularFoods(5);
            console.log(`[SearchContext] Global meals fetched:`, data?.length || 0);
            return data;
        } else {
            if (!userProfile?.id) {
                console.log(`[SearchContext] No userProfile.id found for 'My' filter`);
                return [];
            }
            const data = await getUserPopularFoods(userProfile.id, 5);
            console.log(`[SearchContext] User meals fetched:`, data?.length || 0);
            return data;
        }
    }, [filter, userProfile?.id]);
    const { data, loading: isLoading, refetch, error } = useFetch(fetchPopularMealsFn, true);
    const refreshPopularMeals = useCallback(async () => {
        await refetch();
    }, [refetch]);
    const popularMeals = useMemo(() => {
        const meals = data || [];
        if (meals.length > 0) {
            console.log(`[SearchContext] Popular meals updated:`, meals.map(m => m.name));
        }
        return meals;
    }, [data]);
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
                refreshPopularMeals 
            }}
        >
            {children}
        </SearchContext.Provider>
    );
};
export default SearchProvider;