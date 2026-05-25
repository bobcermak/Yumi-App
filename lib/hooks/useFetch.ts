import { useState, useEffect, useCallback, useRef } from "react";

export const useFetch = <T>(fetchFunction: (signal?: AbortSignal) => Promise<T>, autoFetch: boolean = false) => {
    //Hooks
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchData = useCallback(async () => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;
        setLoading(true);
        setError(null);
        try {
            const result = await fetchFunction(controller.signal);
            if (!controller.signal.aborted) {
                setData(result);
            }
            return result;
        }
        catch (err) {
            if (!controller.signal.aborted) {
                setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            }
            return null;
        }
        finally {
            if (!controller.signal.aborted) {
                setLoading(false);
            }
        }
    }, [fetchFunction]);
    const resetData = useCallback(() => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
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