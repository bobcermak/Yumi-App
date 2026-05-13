import { DailyLog } from "@/types/database/dbModels";
import { PostgrestError } from "@supabase/supabase-js";
import supabase from "../client";

//GET
export const getDailyLog = async (userId: string, dateStr: string): Promise<{ data: DailyLog | null, error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("date", dateStr)
        .maybeSingle();
    return { data, error };
};
export const getActiveDates = async (userId: string, startDate: string, endDate: string): Promise<{ data: { date: string }[] | null, error: PostgrestError | null }> => {
    const { data, error } = await supabase
        .from("daily_logs")
        .select("date")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .gt("calories_current", 0);
    return { data, error };
};
//UPSERT
export const upsertDailyLog = async (userId: string, dateStr: string, logData: Partial<DailyLog>): Promise<{ data: DailyLog | null, error: PostgrestError | null }> => {
    const { id, user_id, date, updated_at, ...cleanData } = logData;
    const { data, error } = await supabase
        .from("daily_logs")
        .upsert({
            user_id: userId,
            date: dateStr,
            ...cleanData,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "user_id,date"
        })
        .select()
        .maybeSingle();
    return { data, error };
};