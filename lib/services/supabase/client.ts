import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/database/supabase.types";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Check your .env.local file.");
} else {
  console.log("[Supabase] Client initialized with URL:", supabaseUrl);
}
const storageAdapter = {
  getItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return null;
      }
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return;
      }
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window === 'undefined') {
        return;
      }
    }
    return AsyncStorage.removeItem(key);
  },
};
const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storage: storageAdapter as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
export default supabase;