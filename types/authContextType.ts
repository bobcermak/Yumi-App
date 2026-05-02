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
        username: string;
        photoUri: string | null;
        progressPhotos: string[];
        currentWeight: number;
        targetWeight: number;
        dailyCalories: number;
        activityLevel: number;
        weightUnit: "kg" | "lb";
        goalDate: string | null;
    }) => Promise<{ error: { message: string } | null }>;
    signIn: () => Promise<{ error: { message: string } | null }>;
    signInWithGoogle: () => Promise<{ error: { message: string } | null }>;
    signInWithApple: () => Promise<{ error: { message: string } | null }>;
    signOut: () => Promise<void>;
};