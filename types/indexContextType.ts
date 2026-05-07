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
    dateStr?: string 
};
export type IndexContextProps = {
    toast: ToastType | null;
    showToast: (message: string, dateStr?: string) => void;
    overviewData: OverviewData;
    dashboardDate: Date;
    handleUpdateCaloriesMax: (newMax: number) => Promise<void>;
    activeDates: string[];
    targetDate?: string | null;
    setSelectedDate: (date: Date) => void;
    goToPrevDay: () => void;
    goToNextDay: () => void;
    goToToday: () => void;
    refreshData: () => Promise<void>;
    isDataLoading: boolean;
};