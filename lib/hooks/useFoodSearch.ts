import { searchExternalFoods } from '@/lib/services/food-search/search';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFetch } from './useFetch';
import type { FoodCategory, FoodType } from '@/types/searchFilters';
import { globalSearchCache } from '@/lib/services/food-search/cache';

export const useFoodSearch = () => {
    //Constants
    const DEBOUNCE_MS = 300;
    const MIN_QUERY_LENGTH = 2;
    //Hooks
    const [query, setQuery] = useState<string>("");
    const [category, setCategory] = useState<FoodCategory>("all");
    const [foodType, setFoodType] = useState<FoodType>("all");
    //Refs
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const searchIdRef = useRef<number>(0); 
    const lastRequestSignature = useRef<string>("");
    
    //Functions
    const effectiveQuery = query.trim();
    const effectiveFoodType: FoodType = (() => {
        if (category === "fruits" || category === "vegetables") return "raw";
        return foodType;
    })();
    const searchTask = useCallback(async () => {
        if (effectiveQuery.length < MIN_QUERY_LENGTH && category === "all") {
            return { results: [], source: null };
        }
        const currentSearchId = ++searchIdRef.current;
        const cacheKey = `${effectiveQuery}-${category}-${effectiveFoodType}`;
        if (globalSearchCache.has(cacheKey)) {
            return globalSearchCache.get(cacheKey);
        }
        const results = await searchExternalFoods({
            query: effectiveQuery,
            category: category === "all" ? undefined : category,
            foodType: effectiveFoodType,
        });
        if (currentSearchId !== searchIdRef.current) {
            return new Promise<any>(() => {}); 
        }
        const finalData = {
            results,
            source: (results.length > 0
                ? (results[0].source === 'usda' ? 'usda' : 'openfoodfacts')
                : null) as 'usda' | 'openfoodfacts' | null,
        };
        globalSearchCache.set(cacheKey, finalData);
        return finalData;
    }, [effectiveQuery, category, effectiveFoodType]);
    const { data, loading: isLoading, refetch: performSearch, reset } = useFetch(searchTask, false);
    const results = data?.results || [];
    const source = data?.source || null;
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const currentTrimmed = query.trim();
        const currentSignature = `${currentTrimmed}-${category}-${foodType}`;
        if (category !== "all" && currentTrimmed.length === 0) {
            lastRequestSignature.current = currentSignature;
            performSearch(); 
            return;
        }
        if (!currentTrimmed) {
            lastRequestSignature.current = "";
            reset();
            return;
        }
        debounceRef.current = setTimeout(() => {
            if (lastRequestSignature.current === currentSignature) {
                return;
            }
            lastRequestSignature.current = currentSignature;
            performSearch();
        }, DEBOUNCE_MS);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query, category, foodType, performSearch, reset]);
    const submitSearch = useCallback(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        const currentSignature = `${query.trim()}-${category}-${foodType}`;
        if (lastRequestSignature.current !== currentSignature) {
            lastRequestSignature.current = currentSignature;
            performSearch();
        }
    }, [query, category, foodType, performSearch]);
    return {
        query, setQuery,
        results, isLoading, source,
        submitSearch,
        category, setCategory,
        foodType, setFoodType,
    };
};