import { createContext, useState, useEffect, useMemo, type FC } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { format, subDays } from "date-fns";
import { daysFromCalories, dateStringFromToday } from "@/lib/helpers/onBoardingHelpers";
import { updateCalorieLimitAndTargetDate } from "@/lib/services/supabase/queries/setupUserAccount";
import { OverviewData, ToastType, IndexContextProps } from "@/types/indexContextType";

export const IndexContext = createContext<IndexContextProps | undefined>(undefined);

type IndexProviderProps = {
    children: React.ReactNode;
};
export const IndexProvider: FC<IndexProviderProps> = ({ children }) => {
    //Context
    const { userProfile, refreshProfile } = useAuth();
    const activeDates = useMemo(() => [
        format(subDays(new Date(), 1), "yyyy-MM-dd"),
        format(subDays(new Date(), 2), "yyyy-MM-dd"),
    ], []);
    const defaultCalLimit = 2500;
    //Hooks
    const [toast, setToast] = useState<ToastType | null>(null);
    const [targetDate, setTargetDate] = useState<string | null | undefined>(userProfile?.target_date);
    const [overviewData, setOverviewData] = useState<OverviewData>({
        date: new Date(),
        calories: { current: 0, max: defaultCalLimit },
        macros: {
            carbs: { current: 0, max: Math.round((defaultCalLimit * 0.5) / 4) },
            fats: { current: 0, max: Math.round((defaultCalLimit * 0.3) / 9) },
            protein: { current: 0, max: Math.round((defaultCalLimit * 0.2) / 4) },
        }
    });
    
    //Functions
    const showToast = (message: string, dateStr?: string) => {
        setToast({ message, dateStr });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    };
    const handleUpdateCaloriesMax = async (newMax: number) => {
        const clampedMax = Math.min(8000, Math.max(newMax, 600));
        setOverviewData(prev => ({
            ...prev,
            calories: { ...prev.calories, max: clampedMax },
            macros: {
                ...prev.macros,
                carbs: { ...prev.macros.carbs, max: Math.round((clampedMax * 0.5) / 4) },
                fats: { ...prev.macros.fats, max: Math.round((clampedMax * 0.3) / 9) },
                protein: { ...prev.macros.protein, max: Math.round((clampedMax * 0.2) / 4) },
            }
        }));        
        if (userProfile?.id) {
            let newTargetDate: string | undefined;
            if (userProfile.current_weight && userProfile.goal_weight) {
                const days = daysFromCalories(clampedMax, userProfile.current_weight, userProfile.goal_weight, "level_3");
                if (days !== null) {
                    newTargetDate = dateStringFromToday(days);
                    setTargetDate(newTargetDate);
                    showToast("Target shifted to:", format(new Date(newTargetDate), "dd MMM, yyyy"));
                } else {
                    showToast("Daily limit updated!");
                }
            } else {
                showToast("Daily limit updated!");
            }
            const { error } = await updateCalorieLimitAndTargetDate(userProfile.id, clampedMax, newTargetDate);
            if (error) {
                console.error("Failed to update daily_calorie_limit and target_date", error);
            } else {
                await refreshProfile();
            }
        }
    };
    useEffect(() => {
        if (userProfile?.daily_calorie_limit) {
            const limit = userProfile.daily_calorie_limit;
            setOverviewData(prev => ({
                ...prev,
                calories: { ...prev.calories, max: limit },
                macros: {
                    ...prev.macros,
                    carbs: { ...prev.macros.carbs, max: Math.round((limit * 0.5) / 4) },
                    fats: { ...prev.macros.fats, max: Math.round((limit * 0.3) / 9) },
                    protein: { ...prev.macros.protein, max: Math.round((limit * 0.2) / 4) },
                }
            }));
        }
        setTargetDate(userProfile?.target_date);
    }, [userProfile?.daily_calorie_limit, userProfile?.target_date]);
    return (
        <IndexContext.Provider value={{ 
            toast, 
            showToast, 
            overviewData, 
            handleUpdateCaloriesMax, 
            activeDates,
            targetDate 
        }}>
            {children}
        </IndexContext.Provider>
    );
};
export default IndexProvider;