import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createClient,
  type SupabaseClient,
  type SupportedStorage,
} from "@supabase/supabase-js";
import { Platform } from "react-native";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// On web, use localStorage directly so AsyncStorage never touches `window` during SSR.
// The `typeof window` guard makes it safe for server-side rendering.
const webStorage: SupportedStorage = {
  getItem: (key) =>
    typeof window !== "undefined" ? window.localStorage.getItem(key) : null,
  setItem: (key, value) => {
    if (typeof window !== "undefined") window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== "undefined") window.localStorage.removeItem(key);
  },
};

const authStorage = Platform.OS === "web" ? webStorage : AsyncStorage;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        // On web we need this true so OAuth redirects are handled automatically.
        // On native we handle the callback manually via expo-web-browser.
        detectSessionInUrl: Platform.OS === "web",
      },
    })
  : null;
