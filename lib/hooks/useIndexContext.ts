import { IndexContext } from "@/contexts/IndexContext";
import { useContext } from "react";

export const useIndexContext = () => {
    const context = useContext(IndexContext);
    if (!context) {
        throw new Error("useIndexContext must be used within an IndexProvider");
    }
    return context;
};