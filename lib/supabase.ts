// Supabase client: создает общий клиент, настраивает хранение session и OAuth callback behavior.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Для web используем localStorage напрямую, а на телефоне оставляем AsyncStorage.
// Проверка `typeof window` нужна, чтобы код не падал при server-side rendering.
const webStorage: SupportedStorage = {
  getItem: (key) => (typeof window !== 'undefined' ? window.localStorage.getItem(key) : null),
  setItem: (key, value) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(key);
  },
};

const authStorage = Platform.OS === 'web' ? webStorage : AsyncStorage;

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: authStorage,
        autoRefreshToken: true,
        persistSession: true,
        // На web Supabase сам считывает OAuth callback из URL.
        // В native callback обрабатывается отдельно через expo-web-browser.
        detectSessionInUrl: Platform.OS === 'web',
      },
      // Node.js 20 doesn't have native WebSocket support.
      // This fix is required for server-side rendering (SSR) in Expo.
      ...(Platform.OS === 'web' && typeof window === 'undefined'
        ? {
            realtime: {
              transport: require('ws'),
            },
          }
        : {}),
    })
  : null;
