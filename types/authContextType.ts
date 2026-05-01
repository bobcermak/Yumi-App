import { Session } from "@supabase/supabase-js";

export type AuthContextType = {
    session: Session | null;
    isReady: boolean;
    isLoading: boolean;
    hasOnboarded: boolean;
    email: string;
    setEmail: (value: string) => void;
    password: string;
    setPassword: (value: string) => void;
    setHasOnboarded: (value: boolean) => void;
    signUp: (onboardingData?: {
        fullName: string;
        nickname: string;
        photoUri: string | null;
        progressPhotos: string[];
        currentWeight: number;
        targetWeight: number;
        dailyCalories: number;
    }) => Promise<{ error: any }>;
    signIn: () => Promise<{ error: any }>;
    signOut: () => Promise<void>;
};