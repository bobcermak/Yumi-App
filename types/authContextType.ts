import { Session } from "@supabase/supabase-js";

export type AuthContextType = {
    session: Session | null;
    isReady: boolean;
    hasOnboarded: boolean;
    setHasOnboarded: (value: boolean) => void;
};