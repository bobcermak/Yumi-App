import { MealLog, MealLogWithIngredients } from "./database/dbModels";

export type OverviewData = {
    date: Date;
    calories: { current: number; max: number };
    macros: {
        carbs: { current: number; max: number };
        fats: { current: number; max: number };
        protein: { current: number; max: number };
    };
};
export type ToastType = { 
    message: string; 
    dateStr?: string;
    type?: 'success' | 'error';
};
export type IndexContextProps = {
    toast: ToastType | null;
    showToast: (message: string, dateStr?: string, type?: 'success' | 'error') => void;
    overviewData: OverviewData;
    dashboardDate: Date;
    handleUpdateCaloriesMax: (newMax: number) => Promise<void>;
    activeDates: string[];
    targetDate?: string | null;
    setSelectedDate: (date: Date) => void;
    goToPrevDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    refreshData: () => Promise<boolean>;
    refreshKey: number;
    isDataLoading: boolean;
    mealLogs: MealLogWithIngredients[];
    deleteMeal: (mealId: string) => Promise<void>;
    updateMeal: (mealId: string, updates: Partial<MealLog>) => Promise<void>;
};