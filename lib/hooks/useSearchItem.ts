import { useContext } from "react";
import { SearchItemContext } from "@/contexts/SearchItemContext";

export const useSearchItem = () => {
    const context = useContext(SearchItemContext);
    if (context === undefined) {
        throw new Error('useSearchItem must be used within a SearchItemProvider');
    }
    return context;
};