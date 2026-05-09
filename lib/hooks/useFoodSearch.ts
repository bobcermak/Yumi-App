import { searchExternalFoods } from '@/lib/services/food-search/search';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from './useFetch';

export const useFoodSearch = () => {
    //Constants
    const DEBOUNCE_MS = 300;
    const MIN_QUERY_LENGTH = 2;
    //Hooks
    const [query, setQuery] = useState<string>("");
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    //Functions
    const searchTask = useCallback(async () => {
        const searchQuery = query.trim();
        if (searchQuery.length < MIN_QUERY_LENGTH) return { results: [], source: null };
        const results = await searchExternalFoods(searchQuery, 10);
        return { 
            results: results, 
            source: (results.length > 0 ? (results[0].source === 'usda' ? 'usda' : 'openfoodfacts') : null) as any 
        };
    }, [query]);
    const { data, loading: isLoading, refetch: performSearch, reset } = useFetch(searchTask, false);
    const results = data?.results || [];
    const source = data?.source || null;
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!query.trim()) {
            reset();
            return;
        }
        debounceRef.current = setTimeout(() => {
            performSearch();
        }, DEBOUNCE_MS);

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, performSearch, reset]);
    const submitSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        performSearch();
    }, [performSearch]);
    return { query, setQuery, results, isLoading, source, submitSearch };
};