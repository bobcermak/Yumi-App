import { useAuth } from "@/lib/hooks/useAuth";
import { getUserCreatedFoods, getUserPopularFoods } from "@/lib/services/supabase/queries/foods";
import type { Food } from "@/types/database/dbModels";
import { useCallback, useEffect, useState } from "react";

export type MyMealItem = Food & { isCustom: boolean };

export const useMyMeals = () => {
    const { userProfile } = useAuth();
    const [items, setItems] = useState<MyMealItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetch = useCallback(async () => {
        if (!userProfile?.id) return;
        setIsLoading(true);
        try {
            const [created, favorites] = await Promise.all([
                getUserCreatedFoods(userProfile.id),
                getUserPopularFoods(userProfile.id),
            ]);
            const createdIds = new Set(created.map(f => f.id));
            const dedupedFavorites = favorites.filter(f => !createdIds.has(f.id));
            setItems([
                ...created.map(f => ({ ...f, isCustom: true })),
                ...dedupedFavorites.map(f => ({ ...f, isCustom: false })),
            ]);
        } catch (err) {
            console.error('[useMyMeals]', err);
        } finally {
            setIsLoading(false);
        }
    }, [userProfile?.id]);

    useEffect(() => { fetch(); }, [fetch]);

    return { items, isLoading, refresh: fetch };
};
