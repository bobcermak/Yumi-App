import { dateStringFromToday, daysFromCalories } from "@/lib/helpers/onBoardingHelpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { getActiveDates, getDailyLog, updateWaterIntake } from "@/lib/services/supabase/queries/dailyLogs";
import { deleteMealLog, getMealLogsForDay, updateMealLog } from "@/lib/services/supabase/queries/mealLogs";
import { incrementUserStreak } from "@/lib/services/supabase/queries/profiles";
import { updateCalorieLimitAndTargetDate } from "@/lib/services/supabase/queries/setupUserAccount";
import { MealLog, MealLogWithIngredients } from "@/types/database/dbModels";
import { IndexContextProps, OverviewData, ToastType } from "@/types/indexContextType";
import { addDays, endOfMonth, format, isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth, subDays } from "date-fns";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, useRef } from "react";

export const IndexContext = createContext<IndexContextProps | undefined>(undefined);

type IndexProviderProps = {
    children: React.ReactNode;
};
export const IndexProvider: FC<IndexProviderProps> = ({ children }) => {
    //Context
    const { userProfile, refreshProfile } = useAuth();
    const [activeDates, setActiveDates] = useState<string[]>([]);
    const defaultCalLimit = 2500;
    //Hooks
    const [toast, setToast] = useState<ToastType | null>(null);
    const [dashboardDate, setDashboardDate] = useState<Date>(startOfDay(new Date()));
    const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
    const [targetDate, setTargetDate] = useState<string | null | undefined>(userProfile?.target_date);
    const [refreshKey, setRefreshKey] = useState<number>(0);
    const [mealLogs, setMealLogs] = useState<MealLogWithIngredients[]>([]);
    const DEFAULT_WATER_GOAL_ML = 2000;
    const rawLimit = userProfile?.daily_water_limit;
    const waterGoalMl = rawLimit ? Math.round(rawLimit * 1000) : DEFAULT_WATER_GOAL_ML;
    const [waterMl, setWaterMl] = useState<number>(0);
    const overviewDataRef = useRef<OverviewData | null>(null);
    const dashboardDateRef = useRef<Date | null>(null);
    const [overviewData, setOverviewData] = useState<OverviewData>({
        date: new Date(),
        calories: { current: 0, max: defaultCalLimit },
        macros: {
            carbs: { current: 0, max: Math.round((defaultCalLimit * 0.5) / 4) },
            fats: { current: 0, max: Math.round((defaultCalLimit * 0.3) / 9) },
            protein: { current: 0, max: Math.round((defaultCalLimit * 0.2) / 4) },
        }
    });
    useEffect(() => {
        overviewDataRef.current = overviewData;
    }, [overviewData]);
    useEffect(() => {
        dashboardDateRef.current = dashboardDate;
    }, [dashboardDate]);
    //Functions
    const showToast = useCallback((message: string, dateStr?: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, dateStr, type });
        setTimeout(() => {
            setToast(null);
        }, 4000);
    }, []);
    const fetchDailyLog = useCallback(async (userId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const { data } = await getDailyLog(userId, dateStr);
        setOverviewData(prev => ({
            ...prev,
            date,
            calories: { ...prev.calories, current: data?.calories_current || 0 },
            macros: {
                carbs: { ...prev.macros.carbs, current: data?.carbs_current || 0 },
                fats: { ...prev.macros.fats, current: data?.fats_current || 0 },
                protein: { ...prev.macros.protein, current: data?.protein_current || 0 },
            }
        }));
        setWaterMl(data?.water_ml || 0);
        const logs = await getMealLogsForDay(userId, dateStr);
        setMealLogs(logs);
    }, []);
    const fetchMonthActiveDates = useCallback(async (userId: string, date: Date) => {
        const start = format(startOfMonth(subDays(startOfMonth(date), 1)), "yyyy-MM-dd");
        const end = format(endOfMonth(addDays(endOfMonth(date), 1)), "yyyy-MM-dd");
        const { data } = await getActiveDates(userId, start, end);
        if (data) {
            setActiveDates(data.map(d => d.date));
        }
    }, []);
    const handleUpdateCaloriesMax = useCallback(async (newMax: number) => {
        const clampedMax = Math.min(8000, Math.max(newMax, 600));
        if (overviewDataRef.current?.calories.max === clampedMax) return;
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
    }, [userProfile, refreshProfile, showToast]);
    useEffect(() => {
        if (userProfile?.id) {
            fetchDailyLog(userProfile.id, overviewData.date);
            fetchMonthActiveDates(userProfile.id, overviewData.date);
        }
    }, [userProfile?.id]);
    useEffect(() => {
        if (userProfile?.daily_calorie_limit) {
            const limit = userProfile.daily_calorie_limit;
            setOverviewData(prev => ({
                ...prev,
                calories: { ...prev.calories, max: limit },
                macros: {
                    carbs: { ...prev.macros.carbs, max: Math.round((limit * 0.5) / 4) },
                    fats: { ...prev.macros.fats, max: Math.round((limit * 0.3) / 9) },
                    protein: { ...prev.macros.protein, max: Math.round((limit * 0.2) / 4) },
                }
            }));
        }
        setTargetDate(userProfile?.target_date);
    }, [userProfile?.daily_calorie_limit, userProfile?.target_date]);
    const handleSetWater = useCallback(async (ml: number) => {
        if (!userProfile?.id) return;
        const clamped = Math.max(0, Math.min(waterGoalMl, ml));
        setWaterMl(clamped);
        const dateStr = format(dashboardDate, "yyyy-MM-dd");
        await updateWaterIntake(userProfile.id, dateStr, clamped);
    }, [userProfile?.id, dashboardDate]);
    const deleteMeal = useCallback(async (mealId: string) => {
        if (!userProfile?.id) return;
        try {
            await deleteMealLog(userProfile.id, mealId);
            showToast("Meal removed");
            const dateStr = format(dashboardDate, "yyyy-MM-dd");
            const logs = await getMealLogsForDay(userProfile.id, dateStr);
            setMealLogs(logs);
            const { data } = await getDailyLog(userProfile.id, dateStr);
            setOverviewData(prev => ({
                ...prev,
                calories: { ...prev.calories, current: data?.calories_current || 0 },
                macros: {
                    carbs: { ...prev.macros.carbs, current: data?.carbs_current || 0 },
                    fats: { ...prev.macros.fats, current: data?.fats_current || 0 },
                    protein: { ...prev.macros.protein, current: data?.protein_current || 0 },
                }
            }));
        } catch (error) {
            showToast("Failed to remove meal", undefined, "error");
        }
    }, [userProfile?.id, dashboardDate, showToast]);
    const updateMeal = useCallback(async (mealId: string, updates: Partial<MealLog>) => {
        if (!userProfile?.id) return;
        try {
            await updateMealLog(userProfile.id, mealId, updates);
            const dateStr = format(dashboardDate, "yyyy-MM-dd");
            const logs = await getMealLogsForDay(userProfile.id, dateStr);
            setMealLogs(logs);
            const { data } = await getDailyLog(userProfile.id, dateStr);
            setOverviewData(prev => ({
                ...prev,
                calories: { ...prev.calories, current: data?.calories_current || 0 },
                macros: {
                    carbs: { ...prev.macros.carbs, current: data?.carbs_current || 0 },
                    fats: { ...prev.macros.fats, current: data?.fats_current || 0 },
                    protein: { ...prev.macros.protein, current: data?.protein_current || 0 },
                }
            }));
        } catch (error) {
            showToast("Failed to update meal", undefined, "error");
        }
    }, [userProfile?.id, dashboardDate, showToast]);
    const setSelectedDate = useCallback(async (date: Date) => {
        if (isSameDay(date, overviewData.date)) return;
        const oldMonth = overviewData.date.getMonth();
        const oldYear = overviewData.date.getFullYear();
        setOverviewData(prev => ({ ...prev, date }));
        const dateDay = startOfDay(date);
        const todayDay = startOfDay(new Date());
        const startDayLimit = userProfile?.start_date ? startOfDay(new Date(userProfile.start_date)) : null;
        const isValid = !isAfter(dateDay, todayDay) && (!startDayLimit || !isBefore(dateDay, startDayLimit));
        if (isValid && userProfile?.id) {
            setIsDataLoading(true);
            const dateStr = format(dateDay, "yyyy-MM-dd");
            const { data } = await getDailyLog(userProfile.id, dateStr);
            const logs = await getMealLogsForDay(userProfile.id, dateStr);
            setMealLogs(logs);
            setDashboardDate(dateDay);
            setOverviewData(prev => ({
                ...prev,
                calories: { ...prev.calories, current: data?.calories_current || 0 },
                macros: {
                    carbs: { ...prev.macros.carbs, current: data?.carbs_current || 0 },
                    fats: { ...prev.macros.fats, current: data?.fats_current || 0 },
                    protein: { ...prev.macros.protein, current: data?.protein_current || 0 },
                }
            }));
            setWaterMl(data?.water_ml || 0);
            if (date.getMonth() !== oldMonth || date.getFullYear() !== oldYear) {
                await fetchMonthActiveDates(userProfile.id, dateDay);
            }
            setIsDataLoading(false);
        }
    }, [userProfile?.id, userProfile?.start_date, overviewData.date, fetchMonthActiveDates]);
    const goToPrevDay = useCallback(() => {
        setSelectedDate(subDays(overviewData.date, 1));
    }, [overviewData.date, setSelectedDate]);
    const goToNextDay = useCallback(() => {
        if (!isToday(overviewData.date)) {
            setSelectedDate(addDays(overviewData.date, 1));
        }
    }, [overviewData.date, setSelectedDate]);
    const goToToday = useCallback(() => {
        setSelectedDate(new Date());
    }, [setSelectedDate]);
    const refreshData = useCallback(async () => {
        if (userProfile?.id) {
            const today = new Date();
            const dateStr = format(today, "yyyy-MM-dd");
            const { data } = await getDailyLog(userProfile.id, dateStr);
            const logs = await getMealLogsForDay(userProfile.id, dateStr);
            setMealLogs(logs);
            await incrementUserStreak(userProfile.id);
            await refreshProfile();
            const limit = userProfile.daily_calorie_limit || defaultCalLimit;
            const currentOverview = overviewDataRef.current;
            const hasDateChanged = currentOverview ? !isSameDay(today, currentOverview.date) : true;
            const hasDataChanged = currentOverview ? (data?.calories_current || 0) !== currentOverview.calories.current : true;
            if (hasDateChanged || hasDataChanged) {
                setRefreshKey(prev => prev + 1);
                setOverviewData({
                    date: today,
                    calories: { current: data?.calories_current || 0, max: limit },
                    macros: {
                        carbs: { current: data?.carbs_current || 0, max: Math.round((limit * 0.5) / 4) },
                        fats: { current: data?.fats_current || 0, max: Math.round((limit * 0.3) / 9) },
                        protein: { current: data?.protein_current || 0, max: Math.round((limit * 0.2) / 4) },
                    }
                });
                setWaterMl(data?.water_ml || 0);
                setDashboardDate(startOfDay(today));
                await fetchMonthActiveDates(userProfile.id, today);
            }
            return hasDateChanged || hasDataChanged;
        }
        return false;
    }, [userProfile?.id, fetchMonthActiveDates, refreshProfile]);
    const contextValue = useMemo(() => ({
        toast,
        showToast,
        overviewData,
        dashboardDate,
        handleUpdateCaloriesMax,
        activeDates,
        targetDate,
        setSelectedDate,
        goToPrevDay,
        goToNextDay,
        goToToday,
        refreshData,
        refreshKey,
        isDataLoading,
        mealLogs,
        deleteMeal,
        updateMeal,
        waterMl,
        waterGoalMl,
        handleSetWater,
    }), [toast, showToast, overviewData, dashboardDate, handleUpdateCaloriesMax, activeDates, targetDate, setSelectedDate, goToPrevDay, goToNextDay, goToToday, refreshData, refreshKey, isDataLoading, mealLogs, deleteMeal, updateMeal, waterMl, waterGoalMl, handleSetWater]);
    return (
        <IndexContext.Provider value={contextValue}>
            {children}
        </IndexContext.Provider>
    );
};
export default IndexProvider;