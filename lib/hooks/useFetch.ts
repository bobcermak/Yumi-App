import { useState, useEffect, useCallback, useRef } from "react";

export const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch: boolean = false) => {
    //Hooks
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const lastFetchId = useRef(0);

    const fetchData = useCallback(async () => {
        const currentFetchId = ++lastFetchId.current;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction();
            if (currentFetchId === lastFetchId.current) {
                setData(result);
            }
            return result;
        }
        catch (err) {
            if (currentFetchId === lastFetchId.current) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            }
            return null;
        }
        finally {
            if (currentFetchId === lastFetchId.current) {
                setLoading(false);
            }
        }
    }, [fetchFunction]);

    const resetData = useCallback(() => {
        lastFetchId.current++;
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    useEffect(() => {
        if (autoFetch) {
            fetchData();
        }
    }, [autoFetch, fetchData]);

    return { data, loading, error, refetch: fetchData, reset: resetData };
}