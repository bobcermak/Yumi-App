import { dateStringFromToday, daysFromCalories } from "@/lib/helpers/onBoardingHelpers";
import { useAuth } from "@/lib/hooks/useAuth";
import { getActiveDates, getDailyLog, updateWaterIntake } from "@/lib/services/supabase/queries/dailyLogs";
import { deleteMealLog, getMealLogsForDay, updateMealLog } from "@/lib/services/supabase/queries/mealLogs";
import { incrementUserStreak, recalculateUserRating } from "@/lib/services/supabase/queries/profiles";
import { updateCalorieLimitAndTargetDate } from "@/lib/services/supabase/queries/setupUserAccount";
import { MealLog, MealLogWithIngredients } from "@/types/database/dbModels";
import { IndexContextProps, OverviewData, ToastType } from "@/types/indexContextType";
import { addDays, endOfMonth, format, isAfter, isBefore, isSameDay, isToday, startOfDay, startOfMonth, subDays } from "date-fns";
import { createContext, useCallback, useEffect, useMemo, useState, type FC, useRef } from "react";
import { posthog } from "@/lib/config/posthog";

type DayCacheEntry = {
    calories_current: number;
    carbs_current: number;
    fats_current: number;
    protein_current: number;
    water_ml: number;
    mealLogs: MealLogWithIngredients[];
    fetchedAt: number;
};
const CACHE_TTL = 3 * 60 * 1000;

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
    const isDayChangingRef = useRef<boolean>(false);
    const dayCache = useRef<Map<string, DayCacheEntry>>(new Map());
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
    const saveToCache = useCallback((dateStr: string, data: Omit<DayCacheEntry, 'fetchedAt'>) => {
        if (dayCache.current.size >= 14) {
            const oldest = dayCache.current.keys().next().value;
            if (oldest) dayCache.current.delete(oldest);
        }
        dayCache.current.set(dateStr, { ...data, fetchedAt: Date.now() });
    }, []);
    const fetchDailyLog = useCallback(async (userId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const [{ data }, logs] = await Promise.all([
            getDailyLog(userId, dateStr),
            getMealLogsForDay(userId, dateStr),
        ]);
        const entry = {
            calories_current: data?.calories_current || 0,
            carbs_current: data?.carbs_current || 0,
            fats_current: data?.fats_current || 0,
            protein_current: data?.protein_current || 0,
            water_ml: data?.water_ml || 0,
            mealLogs: logs,
        };
        saveToCache(dateStr, entry);
        setOverviewData(prev => ({
            ...prev,
            date,
            calories: { ...prev.calories, current: entry.calories_current },
            macros: {
                carbs: { ...prev.macros.carbs, current: entry.carbs_current },
                fats: { ...prev.macros.fats, current: entry.fats_current },
                protein: { ...prev.macros.protein, current: entry.protein_current },
            }
        }));
        setWaterMl(entry.water_ml);
        setMealLogs(logs);
    }, [saveToCache]);
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
                posthog.capture('calorie_goal_updated', {
                    new_daily_calories: clampedMax,
                    has_new_target_date: !!newTargetDate,
                });
            }
        }
    }, [userProfile, refreshProfile, showToast]);
    useEffect(() => {
        if (userProfile?.id) {
            const today = overviewData.date;
            fetchDailyLog(userProfile.id, today).then(() => {
                prefetchDay(userProfile.id!, subDays(today, 1));
            });
            fetchMonthActiveDates(userProfile.id, today);
            recalculateUserRating(userProfile.id)
                .then(() => refreshProfile())
                .catch(e => console.warn("[IndexContext] Initial rating recalc failed:", e));
        }
    }, [userProfile?.id]); // eslint-disable-line react-hooks/exhaustive-deps
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
        const next = Math.max(0, Math.round(ml));
        setWaterMl(next);
        const dateStr = format(dashboardDate, "yyyy-MM-dd");
        await updateWaterIntake(userProfile.id, dateStr, next);
        posthog.capture('water_intake_updated', {
            amount_ml: next,
            goal_ml: waterGoalMl,
            goal_reached: next >= waterGoalMl,
        });
    }, [userProfile?.id, dashboardDate, waterGoalMl]);
    const deleteMeal = useCallback(async (mealId: string) => {
        if (!userProfile?.id) return;
        try {
            await deleteMealLog(userProfile.id, mealId);
            posthog.capture('meal_deleted', { meal_id: mealId });
            showToast("Meal removed");
            const dateStr = format(dashboardDate, "yyyy-MM-dd");
            dayCache.current.delete(dateStr);
            const [{ data }, logs] = await Promise.all([
                getDailyLog(userProfile.id, dateStr),
                getMealLogsForDay(userProfile.id, dateStr),
            ]);
            setMealLogs(logs);
            saveToCache(dateStr, {
                calories_current: data?.calories_current || 0,
                carbs_current: data?.carbs_current || 0,
                fats_current: data?.fats_current || 0,
                protein_current: data?.protein_current || 0,
                water_ml: data?.water_ml || 0,
                mealLogs: logs,
            });
            await Promise.all([incrementUserStreak(userProfile.id), recalculateUserRating(userProfile.id)]);
            await refreshProfile();
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
    }, [userProfile?.id, dashboardDate, showToast, saveToCache]);
    const updateMeal = useCallback(async (mealId: string, updates: Partial<MealLog>) => {
        if (!userProfile?.id) return;
        try {
            await updateMealLog(userProfile.id, mealId, updates);
            const dateStr = format(dashboardDate, "yyyy-MM-dd");
            dayCache.current.delete(dateStr);
            const [{ data }, logs] = await Promise.all([
                getDailyLog(userProfile.id, dateStr),
                getMealLogsForDay(userProfile.id, dateStr),
            ]);
            setMealLogs(logs);
            saveToCache(dateStr, {
                calories_current: data?.calories_current || 0,
                carbs_current: data?.carbs_current || 0,
                fats_current: data?.fats_current || 0,
                protein_current: data?.protein_current || 0,
                water_ml: data?.water_ml || 0,
                mealLogs: logs,
            });
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
    }, [userProfile?.id, dashboardDate, showToast, saveToCache]);
    const setSelectedDate = useCallback(async (date: Date) => {
        if (isSameDay(date, overviewData.date)) return;
        if (isDayChangingRef.current) return;
        isDayChangingRef.current = true;
        const dateDay = startOfDay(date);
        const todayDay = startOfDay(new Date());
        const startDayLimit = userProfile?.start_date ? startOfDay(new Date(userProfile.start_date)) : null;
        const isValid = !isAfter(dateDay, todayDay) && (!startDayLimit || !isBefore(dateDay, startDayLimit));
        if (!isValid || !userProfile?.id) { isDayChangingRef.current = false; return; }
        const dateStr = format(dateDay, "yyyy-MM-dd");
        const oldMonth = overviewData.date.getMonth();
        const oldYear = overviewData.date.getFullYear();
        const cached = dayCache.current.get(dateStr);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
            setDashboardDate(dateDay);
            setMealLogs(cached.mealLogs);
            setOverviewData(prev => ({
                ...prev,
                date: dateDay,
                calories: { ...prev.calories, current: cached.calories_current },
                macros: {
                    carbs: { ...prev.macros.carbs, current: cached.carbs_current },
                    fats: { ...prev.macros.fats, current: cached.fats_current },
                    protein: { ...prev.macros.protein, current: cached.protein_current },
                }
            }));
            setWaterMl(cached.water_ml);
            isDayChangingRef.current = false;
            if (date.getMonth() !== oldMonth || date.getFullYear() !== oldYear) {
                fetchMonthActiveDates(userProfile.id, dateDay);
            }
            return;
        }
        setIsDataLoading(true);
        setDashboardDate(dateDay);
        try {
            const [{ data }, logs] = await Promise.all([
                getDailyLog(userProfile.id, dateStr),
                getMealLogsForDay(userProfile.id, dateStr),
            ]);
            const entry = {
                calories_current: data?.calories_current || 0,
                carbs_current: data?.carbs_current || 0,
                fats_current: data?.fats_current || 0,
                protein_current: data?.protein_current || 0,
                water_ml: data?.water_ml || 0,
                mealLogs: logs,
            };
            saveToCache(dateStr, entry);
            setMealLogs(logs);
            setOverviewData(prev => ({
                ...prev,
                date: dateDay,
                calories: { ...prev.calories, current: entry.calories_current },
                macros: {
                    carbs: { ...prev.macros.carbs, current: entry.carbs_current },
                    fats: { ...prev.macros.fats, current: entry.fats_current },
                    protein: { ...prev.macros.protein, current: entry.protein_current },
                }
            }));
            setWaterMl(entry.water_ml);
            if (date.getMonth() !== oldMonth || date.getFullYear() !== oldYear) {
                await fetchMonthActiveDates(userProfile.id, dateDay);
            }
        } finally {
            setIsDataLoading(false);
            isDayChangingRef.current = false;
        }
    }, [userProfile?.id, userProfile?.start_date, overviewData.date, fetchMonthActiveDates, saveToCache]);
    const prefetchDay = useCallback(async (userId: string, date: Date) => {
        const dateStr = format(date, "yyyy-MM-dd");
        const cached = dayCache.current.get(dateStr);
        if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) return;
        const today = startOfDay(new Date());
        if (isAfter(startOfDay(date), today)) return;
        try {
            const [{ data }, logs] = await Promise.all([
                getDailyLog(userId, dateStr),
                getMealLogsForDay(userId, dateStr),
            ]);
            saveToCache(dateStr, {
                calories_current: data?.calories_current || 0,
                carbs_current: data?.carbs_current || 0,
                fats_current: data?.fats_current || 0,
                protein_current: data?.protein_current || 0,
                water_ml: data?.water_ml || 0,
                mealLogs: logs,
            });
        } catch { /* silent */ }
    }, [saveToCache]);
    const goToPrevDay = useCallback(() => {
        const prevDay = subDays(overviewData.date, 1);
        setSelectedDate(prevDay).then(() => {
            if (userProfile?.id) prefetchDay(userProfile.id, subDays(prevDay, 1));
        });
    }, [overviewData.date, setSelectedDate, prefetchDay, userProfile?.id]);
    const goToNextDay = useCallback(() => {
        if (!isToday(overviewData.date)) {
            const nextDay = addDays(overviewData.date, 1);
            setSelectedDate(nextDay).then(() => {
                if (userProfile?.id && !isToday(nextDay)) prefetchDay(userProfile.id, addDays(nextDay, 1));
            });
        }
    }, [overviewData.date, setSelectedDate, prefetchDay, userProfile?.id]);
    const goToToday = useCallback(() => {
        setSelectedDate(new Date());
    }, [setSelectedDate]);
    const refreshData = useCallback(async () => {
        if (userProfile?.id) {
            const today = startOfDay(new Date());
            const currentDash = dashboardDateRef.current ?? today;
            const isTodayView = isSameDay(currentDash, today);
            const dashStr = format(currentDash, "yyyy-MM-dd");
            dayCache.current.delete(dashStr);
            const [{ data: dashData }, dashLogs] = await Promise.all([
                getDailyLog(userProfile.id, dashStr),
                getMealLogsForDay(userProfile.id, dashStr),
            ]);
            setMealLogs(dashLogs);
            saveToCache(dashStr, {
                calories_current: dashData?.calories_current || 0,
                carbs_current: dashData?.carbs_current || 0,
                fats_current: dashData?.fats_current || 0,
                protein_current: dashData?.protein_current || 0,
                water_ml: dashData?.water_ml || 0,
                mealLogs: dashLogs,
            });
            await incrementUserStreak(userProfile.id);
            await recalculateUserRating(userProfile.id);
            await refreshProfile();
            const limit = userProfile.daily_calorie_limit || defaultCalLimit;
            setOverviewData(prev => ({
                ...prev,
                date: isTodayView ? today : currentDash,
                calories: { current: dashData?.calories_current || 0, max: limit },
                macros: {
                    carbs: { current: dashData?.carbs_current || 0, max: Math.round((limit * 0.5) / 4) },
                    fats: { current: dashData?.fats_current || 0, max: Math.round((limit * 0.3) / 9) },
                    protein: { current: dashData?.protein_current || 0, max: Math.round((limit * 0.2) / 4) },
                }
            }));
            setWaterMl(dashData?.water_ml || 0);
            await fetchMonthActiveDates(userProfile.id, today);
            return true;
        }
        return false;
    }, [userProfile?.id, fetchMonthActiveDates, refreshProfile, saveToCache]);
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
    }), [toast, showToast, overviewData, dashboardDate, handleUpdateCaloriesMax, activeDates, targetDate, setSelectedDate, goToPrevDay, goToNextDay, goToToday, refreshData, isDataLoading, mealLogs, deleteMeal, updateMeal, waterMl, waterGoalMl, handleSetWater]);
    return (
        <IndexContext.Provider value={contextValue}>
            {children}
        </IndexContext.Provider>
    );
};
export default IndexProvider;