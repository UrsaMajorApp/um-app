import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import * as WebBrowser from "expo-web-browser";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Platform } from "react-native";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { getUseRealOtpSetting } from "./DevSettingsContext";

export type UserRole =
  | "parent"
  | "youth"
  | "child"
  | "young-adult"
  | "mentor"
  | "org"
  | "teacher"
  | "admin";

export interface AuthUser {
  id: string;
  phone: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  profileComplete: boolean;
  /** False for new OAuth users who haven't selected a role yet. */
  hasSelectedRole: boolean;
}

interface AuthActionResult {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  devOtpCode: string | null;
  sendOtp: (phone: string) => Promise<AuthActionResult>;
  sendRegistrationCode: (identifier: string) => Promise<AuthActionResult>;
  verifyOtpAndRegister: (
    phone: string,
    otp: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName?: string,
  ) => Promise<AuthActionResult>;
  registerWithIdentifier: (
    identifier: string,
    otp: string,
    password: string,
    role: UserRole,
    firstName: string,
    lastName?: string,
  ) => Promise<AuthActionResult>;
  loginWithPhone: (
    phone: string,
    password: string,
  ) => Promise<AuthActionResult>;
  loginWithIdentifier: (
    identifier: string,
    password: string,
  ) => Promise<AuthActionResult>;
  loginWithGoogle: () => Promise<AuthActionResult>;
  loginWithQR: (pin: string) => Promise<AuthActionResult>;
  requestPasswordReset: (email: string) => Promise<AuthActionResult>;
  updatePassword: (password: string) => Promise<AuthActionResult>;
  setUserRole: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  devLogin: (role: UserRole) => Promise<void>;
  devMode: boolean;
  setDevMode: (enabled: boolean) => Promise<void>;
  /** Call this after the role-specific create-profile screen succeeds.
   *  Persists the in-memory user to localStorage so they survive a refresh. */
  finalizeRegistration: () => Promise<void>;
}

// Fallback dev-switcher users are persisted locally only when Supabase is not
// configured or anonymous auth is unavailable.
const DEV_USER_KEY = "um_dev_user";
const DEV_MODE_KEY = "um_dev_mode";
const PROFILE_COMPLETE_PREFIX = "um_profile_complete:";

const DEV_OTP = process.env.EXPO_PUBLIC_DEV_OTP?.trim() || null;

// Stable, valid UUIDs for each dev role so FK constraints don't fail.
// Used by both devLogin() and the fake-OTP bypass in verifyOtpAndRegister().
const DEV_IDS: Record<UserRole, string> = {
  parent: "d0000000-0000-4000-a000-000000000001",
  youth: "d0000000-0000-4000-a000-000000000002",
  child: "d0000000-0000-4000-a000-000000000003",
  "young-adult": "d0000000-0000-4000-a000-000000000004",
  mentor: "d0000000-0000-4000-a000-000000000005",
  org: "d0000000-0000-4000-a000-000000000006",
  teacher: "d0000000-0000-4000-a000-000000000007",
  admin: "d0000000-0000-4000-a000-000000000008",
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Returns E.164 format: +7XXXXXXXXXX
function normalizePhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.startsWith("7")) return `+${digits}`;
  if (digits.startsWith("8")) return `+7${digits.slice(1)}`;
  return `+7${digits}`;
}

function isEmailIdentifier(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function getAuthRedirectPath(path: string): string {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    return `${window.location.origin}${path}`;
  }
  return `umapp://${path.replace(/^\//, "")}`;
}

function toAuthUser(input: {
  id: string;
  phone: string;
  email?: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  profileComplete?: boolean;
  hasSelectedRole?: boolean;
}): AuthUser {
  return {
    id: input.id,
    phone: input.phone,
    email: input.email?.trim() || "",
    role: input.role,
    firstName: input.firstName?.trim() || "Пользователь",
    lastName: input.lastName?.trim() || "",
    profileComplete: input.profileComplete ?? true,
    hasSelectedRole: input.hasSelectedRole ?? true,
  };
}

function parseRole(value: string | null | undefined): UserRole {
  const allowed: UserRole[] = [
    "parent",
    "youth",
    "child",
    "young-adult",
    "mentor",
    "org",
    "teacher",
    "admin",
  ];
  if (value && allowed.includes(value as UserRole)) return value as UserRole;
  return "parent";
}

function isAnonymousSupabaseUser(sessionUser: SupabaseUser): boolean {
  return sessionUser.is_anonymous === true;
}

function buildDevPhoneFromId(id: string): string {
  const digits = id.replace(/\D/g, "").slice(-10).padStart(10, "0");
  return `+7${digits}`;
}

function buildDevUserFromId(id: string, role: UserRole): AuthUser {
  return toAuthUser({
    id,
    phone: buildDevPhoneFromId(id),
    email: `${role}@dev.local`,
    role,
    firstName: "Dev",
    lastName: role.charAt(0).toUpperCase() + role.slice(1),
  });
}

async function fetchRemoteProfile(userId: string) {
  if (!supabase || !isSupabaseConfigured) return null;
  const response = await supabase
    .from("um_user_profiles")
    .select("phone, role, first_name, last_name")
    .eq("id", userId)
    .maybeSingle();
  if (response.error) return null;
  return response.data;
}

function profileCompleteKey(userId: string) {
  return `${PROFILE_COMPLETE_PREFIX}${userId}`;
}

async function getLocalProfileComplete(userId: string) {
  return (await AsyncStorage.getItem(profileCompleteKey(userId))) === "true";
}

async function setLocalProfileComplete(userId: string, complete: boolean) {
  if (complete) {
    await AsyncStorage.setItem(profileCompleteKey(userId), "true");
    return;
  }
  await AsyncStorage.removeItem(profileCompleteKey(userId));
}

async function hasRemoteProfileSetup(userId: string, role: UserRole) {
  if (!supabase || !isSupabaseConfigured) return false;

  if (role === "mentor") {
    const { data, error } = await supabase
      .from("mentor_applications")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    return !error && !!data;
  }

  if (role === "org") {
    const { data, error } = await supabase
      .from("organizations")
      .select("id")
      .eq("owner_user_id", userId)
      .limit(1)
      .maybeSingle();
    return !error && !!data;
  }

  if (role === "parent") {
    const { data, error } = await supabase
      .from("parent_profiles")
      .select("id")
      .eq("user_id", userId)
      .limit(1)
      .maybeSingle();
    return !error && !!data;
  }

  // Youth setup currently finishes through local diagnostic/profile flows, not
  // a single durable Supabase row. Avoid locking existing users out.
  return true;
}

async function resolveProfileComplete(userId: string, role: UserRole) {
  if (await getLocalProfileComplete(userId)) return true;
  return hasRemoteProfileSetup(userId, role);
}

async function upsertRemoteProfile(user: AuthUser) {
  if (!supabase || !isSupabaseConfigured) return;
  await supabase.from("um_user_profiles").upsert(
    {
      id: user.id,
      phone: user.phone,
      role: user.role,
      first_name: user.firstName,
      last_name: user.lastName || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );
}

async function hydrateFromSupabaseUser(
  sessionUser: SupabaseUser,
): Promise<AuthUser | null> {
  const metadata = sessionUser.user_metadata ?? {};
  const remoteProfile = await fetchRemoteProfile(sessionUser.id);

  const phone =
    (remoteProfile?.phone as string | null) ||
    sessionUser.phone ||
    (metadata.phone as string | undefined) ||
    "";

  const email =
    sessionUser.email || (metadata.email as string | undefined) || "";

  const rawMetaRole = metadata.role as string | undefined;
  const rawRemoteRole = remoteProfile?.role as string | null;
  // Only treat the role as "selected" when it came from real stored data, not
  // from the default fallback inside parseRole.
  const hasSelectedRole = !!(rawRemoteRole || rawMetaRole);
  const metadataRole = parseRole(rawMetaRole);
  const isDevAnonymous =
    isAnonymousSupabaseUser(sessionUser) && metadata.dev_role_switcher === true;

  // Accept users who have either phone OR email. Dev anonymous users are also
  // valid because they intentionally have no PII attached to the auth identity.
  if (!phone && !email && !isDevAnonymous) return null;

  // Google/OAuth users have `full_name` or `name` in metadata
  const fullName = (
    (metadata.full_name || metadata.name || "") as string
  ).trim();
  const nameParts = fullName.split(" ").filter(Boolean);
  const oauthFirstName = nameParts[0] ?? "";
  const oauthLastName = nameParts.slice(1).join(" ");
  const role = parseRole(rawRemoteRole || rawMetaRole);

  return toAuthUser({
    id: sessionUser.id,
    phone,
    email,
    role,
    firstName:
      (remoteProfile?.first_name as string | null) ||
      (metadata.first_name as string | undefined) ||
      oauthFirstName ||
      (isDevAnonymous ? "Dev" : ""),
    lastName:
      (remoteProfile?.last_name as string | null) ||
      (metadata.last_name as string | undefined) ||
      oauthLastName ||
      (isDevAnonymous
        ? metadataRole.charAt(0).toUpperCase() + metadataRole.slice(1)
        : ""),
    profileComplete:
      isDevAnonymous || (await resolveProfileComplete(sessionUser.id, role)),
    hasSelectedRole: isDevAnonymous || hasSelectedRole,
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [devMode, setDevModeState] = useState(false);
  // Track whether the initial bootstrap has finished so the onAuthStateChange
  // listener doesn't clobber a dev-switcher user that was just restored.
  const bootstrapDone = useRef(false);
  const authEventSeq = useRef(0);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const bootstrap = async () => {
      try {
        const rawDevMode = await AsyncStorage.getItem(DEV_MODE_KEY);
        if (rawDevMode !== null) setDevModeState(rawDevMode === "true");

        // 1. Real users: restore from Supabase session (no localStorage needed)
        if (supabase && isSupabaseConfigured) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            const hydrated = await hydrateFromSupabaseUser(data.session.user);
            if (hydrated) {
              setUser(hydrated);
              await AsyncStorage.removeItem(DEV_USER_KEY);
              bootstrapDone.current = true;
              return;
            }
          }
        }

        // 2. Dev-switcher users only: restore from local key
        const rawDevUser = await AsyncStorage.getItem(DEV_USER_KEY);
        if (rawDevUser) {
          try {
            setUser(JSON.parse(rawDevUser) as AuthUser);
          } catch {
            await AsyncStorage.removeItem(DEV_USER_KEY);
          }
        }
      } finally {
        bootstrapDone.current = true;
        setIsLoading(false);
      }
    };

    bootstrap();

    // Subscribe to auth state changes — critical for OAuth redirects.
    // When the Google OAuth callback fires, Supabase sets the session and
    // emits SIGNED_IN here so we hydrate the user without a page reload.
    if (supabase && isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((event, session) => {
        // Ignore events that fire before bootstrap finishes to avoid a race
        // where INITIAL_SESSION clobbers a just-restored dev user.
        if (!bootstrapDone.current) return;

        if (
          (event === "SIGNED_IN" || event === "PASSWORD_RECOVERY") &&
          session?.user
        ) {
          const eventSeq = ++authEventSeq.current;
          // Supabase auth callbacks run synchronously; defer Supabase queries
          // from hydration so setSession/exchangeCodeForSession can complete.
          setTimeout(async () => {
            const hydrated = await hydrateFromSupabaseUser(session.user);
            if (eventSeq === authEventSeq.current && hydrated)
              setUser(hydrated);
          }, 0);
        } else if (event === "SIGNED_OUT") {
          authEventSeq.current += 1;
          setUser(null);
          setTimeout(() => {
            AsyncStorage.removeItem(DEV_USER_KEY);
          }, 0);
        } else if (event === "USER_UPDATED" && session?.user) {
          const eventSeq = ++authEventSeq.current;
          setTimeout(async () => {
            const hydrated = await hydrateFromSupabaseUser(session.user);
            if (eventSeq === authEventSeq.current && hydrated)
              setUser(hydrated);
          }, 0);
        }
      });
      unsubscribe = data.subscription.unsubscribe;
    }

    return () => {
      unsubscribe?.();
    };
  }, []);

  const sendOtp = useCallback(
    async (phone: string): Promise<AuthActionResult> => {
      const normalized = normalizePhone(phone);

      if (normalized.replace(/\D/g, "").length < 11) {
        return { success: false, error: "Введите корректный номер телефона" };
      }

      // Dev bypass: skip real SMS only while Dev Mode is explicitly enabled.
      const useRealOtp = await getUseRealOtpSetting();
      if (DEV_OTP && devMode && !useRealOtp) return { success: true };

      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: normalized,
        });
        if (error) return { success: false, error: error.message };
      }

      return { success: true };
    },
    [devMode],
  );

  const sendRegistrationCode = useCallback(
    async (identifier: string): Promise<AuthActionResult> => {
      if (isEmailIdentifier(identifier)) return { success: true };
      return sendOtp(identifier);
    },
    [sendOtp],
  );

  const loginWithPhone = useCallback(
    async (phone: string, password: string): Promise<AuthActionResult> => {
      const normalized = normalizePhone(phone);

      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          phone: normalized,
          password,
        });

        if (error || !data.user) {
          return {
            success: false,
            error: "Неверный номер телефона или пароль",
          };
        }

        const nextUser =
          (await hydrateFromSupabaseUser(data.user)) ??
          toAuthUser({
            id: data.user.id,
            phone: normalized,
            role: parseRole(
              data.user.user_metadata?.role as string | undefined,
            ),
            firstName: data.user.user_metadata?.first_name as
              | string
              | undefined,
            lastName: data.user.user_metadata?.last_name as string | undefined,
          });

        setUser(nextUser);
        return { success: true };
      }

      return { success: false, error: "Неверный номер телефона или пароль" };
    },
    [],
  );

  const loginWithIdentifier = useCallback(
    async (identifier: string, password: string): Promise<AuthActionResult> => {
      const trimmed = identifier.trim();
      const isEmail = isEmailIdentifier(trimmed);

      if (!isEmail && normalizePhone(trimmed).replace(/\D/g, "").length < 11) {
        return {
          success: false,
          error: "Введите корректный телефон или email",
        };
      }

      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.signInWithPassword({
          ...(isEmail
            ? { email: trimmed.toLowerCase() }
            : { phone: normalizePhone(trimmed) }),
          password,
        });

        if (error || !data.user) {
          return { success: false, error: "Неверный телефон/email или пароль" };
        }

        const nextUser =
          (await hydrateFromSupabaseUser(data.user)) ??
          toAuthUser({
            id: data.user.id,
            phone: data.user.phone || (isEmail ? "" : normalizePhone(trimmed)),
            email: data.user.email || (isEmail ? trimmed.toLowerCase() : ""),
            role: parseRole(
              data.user.user_metadata?.role as string | undefined,
            ),
            firstName: data.user.user_metadata?.first_name as
              | string
              | undefined,
            lastName: data.user.user_metadata?.last_name as string | undefined,
          });

        setUser(nextUser);
        return { success: true };
      }

      return { success: false, error: "Неверный телефон/email или пароль" };
    },
    [],
  );

  const verifyOtpAndRegister = useCallback(
    async (
      phone: string,
      otp: string,
      password: string,
      role: UserRole,
      firstName: string,
      lastName?: string,
    ): Promise<AuthActionResult> => {
      const normalized = normalizePhone(phone);

      // Dev bypass: accept the dev code only while Dev Mode is explicitly enabled.
      const useRealOtp = await getUseRealOtpSetting();
      const isDevBypass = DEV_OTP && devMode && !useRealOtp && otp === DEV_OTP;

      if (!isDevBypass && supabase && isSupabaseConfigured) {
        const { data, error } = await supabase.auth.verifyOtp({
          phone: normalized,
          token: otp,
          type: "sms",
        });

        if (error || !data.user) {
          return { success: false, error: "Неверный код подтверждения" };
        }

        // Set password so the user can log in with phone + password later
        const { error: pwError } = await supabase.auth.updateUser({ password });
        if (pwError) {
          return { success: false, error: pwError.message };
        }

        const nextUser = toAuthUser({
          id: data.user.id,
          phone: normalized,
          role,
          firstName,
          lastName,
          profileComplete: false,
        });

        await upsertRemoteProfile(nextUser);
        setUser(nextUser);
        return { success: true };
      }

      // Dev bypass: synthetic in-memory user, no Supabase session.
      // Reuse the stable dev UUID for this role so any incidental Supabase
      // calls at least pass UUID format validation (they'll be silently ignored
      // by ParentDataContext which skips writes when there's no real session).
      const nextUser = toAuthUser({
        id: DEV_IDS[role] ?? "d0000000-0000-4000-a000-000000000009",
        phone: normalized,
        role,
        firstName: firstName.trim(),
        lastName: lastName?.trim() || "",
        profileComplete: false,
      });
      setUser(nextUser);
      return { success: true };
    },
    [devMode],
  );

  const registerWithIdentifier = useCallback(
    async (
      identifier: string,
      otp: string,
      password: string,
      role: UserRole,
      firstName: string,
      lastName?: string,
    ): Promise<AuthActionResult> => {
      const trimmed = identifier.trim();

      if (!isEmailIdentifier(trimmed)) {
        return verifyOtpAndRegister(
          trimmed,
          otp,
          password,
          role,
          firstName,
          lastName,
        );
      }

      if (!supabase || !isSupabaseConfigured) {
        return { success: false, error: "Supabase не настроен" };
      }

      const email = trimmed.toLowerCase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getAuthRedirectPath("/auth/callback"),
          data: {
            role,
            first_name: firstName.trim(),
            last_name: lastName?.trim() || "",
          },
        },
      });

      if (error || !data.user) {
        return {
          success: false,
          error: error?.message ?? "Не удалось создать аккаунт",
        };
      }

      if (!data.session) {
        return { success: true, requiresEmailConfirmation: true };
      }

      const nextUser = toAuthUser({
        id: data.user.id,
        phone: "",
        email,
        role,
        firstName,
        lastName,
        profileComplete: false,
      });

      await upsertRemoteProfile(nextUser);
      setUser(nextUser);
      return { success: true };
    },
    [verifyOtpAndRegister],
  );

  const requestPasswordReset = useCallback(
    async (email: string): Promise<AuthActionResult> => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!isEmailIdentifier(normalizedEmail)) {
        return { success: false, error: "Введите корректный email" };
      }

      if (!supabase || !isSupabaseConfigured) {
        return { success: false, error: "Supabase не настроен" };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: getAuthRedirectPath("/auth/reset-password"),
        },
      );

      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    [],
  );

  const updatePassword = useCallback(
    async (password: string): Promise<AuthActionResult> => {
      if (password.length < 6) {
        return {
          success: false,
          error: "Пароль должен содержать минимум 6 символов",
        };
      }

      if (!supabase || !isSupabaseConfigured) {
        return { success: false, error: "Supabase не настроен" };
      }

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return { success: false, error: error.message };
      return { success: true };
    },
    [],
  );

  const finalizeRegistration = useCallback(async () => {
    if (!user) return;
    await setLocalProfileComplete(user.id, true);
    setUser({ ...user, profileComplete: true });
  }, [user]);

  const loginWithQR = useCallback(
    async (pin: string): Promise<AuthActionResult> => {
      if (supabase && isSupabaseConfigured) {
        const { data, error } = await supabase
          .from("child_profiles")
          .select(
            "id, name, age_category, parent_user_id, qr_pin, qr_pin_expires_at, qr_pin_one_time_use",
          )
          .eq("qr_pin", pin)
          .maybeSingle();

        if (error || !data) {
          return { success: false, error: "Неверный код" };
        }

        // Check if PIN is expired
        if (data.qr_pin_expires_at) {
          const expiresAt = new Date(data.qr_pin_expires_at);
          if (expiresAt < new Date()) {
            return {
              success: false,
              error: "Код истёк. Попросите родителя создать новый",
            };
          }
        }

        // If one-time use, invalidate the PIN immediately
        if (data.qr_pin_one_time_use) {
          await supabase
            .from("child_profiles")
            .update({
              qr_pin: null,
              qr_pin_expires_at: null,
            })
            .eq("id", data.id);
        }

        const nextUser = toAuthUser({
          id: data.id,
          phone: "",
          role: "child",
          firstName: data.name,
        });
        setUser(nextUser);
        return { success: true };
      }

      return { success: false, error: "Неверный код" };
    },
    [],
  );

  const loginWithGoogle = useCallback(async (): Promise<AuthActionResult> => {
    if (!supabase || !isSupabaseConfigured) {
      return { success: false, error: "Supabase не настроен" };
    }
    const authClient = supabase;

    // Build the redirect URL based on platform
    const redirectTo =
      Platform.OS === "web" && typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "umapp://auth/callback";

    if (Platform.OS === "web") {
      // Web: Supabase opens Google OAuth in the same tab and redirects back.
      // detectSessionInUrl:true handles the token from the URL automatically.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) return { success: false, error: error.message };
      // Browser is now navigating to Google — this function won't return
      // before the page unloads, so the return value is effectively unused.
      return { success: true };
    }

    // Native (iOS / Android):
    //
    // Strategy: open the OAuth URL in an in-app browser. On iOS,
    // ASWebAuthenticationSession intercepts the umapp:// redirect and returns
    // the URL directly via openAuthSessionAsync. On Android, Chrome Custom Tabs
    // fire a deep-link intent instead — the app opens at /auth/callback, which
    // calls WebBrowser.maybeCompleteAuthSession() to close the lingering tab,
    // and then parses the tokens from the Linking URL directly.
    //
    // Either way the session ends up set and onAuthStateChange notifies us.
    try {
      const hydrateCurrentSession =
        async (): Promise<AuthActionResult | null> => {
          const { data } = await authClient.auth.getSession();
          if (!data.session?.user) return null;

          const hydrated = await hydrateFromSupabaseUser(data.session.user);
          if (hydrated) setUser(hydrated);
          return { success: true };
        };

      await WebBrowser.warmUpAsync();

      const { data: urlData, error: urlError } =
        await authClient.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo, skipBrowserRedirect: true },
        });

      if (urlError || !urlData.url) {
        await WebBrowser.coolDownAsync();
        return {
          success: false,
          error: urlError?.message ?? "Не удалось получить URL авторизации",
        };
      }

      // Open the OAuth flow. The result is "success" only when we receive the
      // redirect URL; cancel/dismiss means the user closed the auth sheet/tab.
      const result = await WebBrowser.openAuthSessionAsync(
        urlData.url,
        redirectTo,
      );
      await WebBrowser.coolDownAsync();

      if (result.type === "success") {
        // iOS (and some Android) path: tokens are in the returned URL.
        const raw = result.url;
        const hashPart = raw.split("#")[1] ?? "";
        const queryPart = raw.split("?")[1]?.split("#")[0] ?? "";
        const hashParams = new URLSearchParams(hashPart);
        const queryParams = new URLSearchParams(queryPart);

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = queryParams.get("code");

        if (accessToken && refreshToken) {
          const { data: sessionData, error: sessionError } =
            await authClient.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
          if (sessionError || !sessionData.user) {
            return {
              success: false,
              error: sessionError?.message ?? "Ошибка сессии",
            };
          }
          const hydrated = await hydrateFromSupabaseUser(sessionData.user);
          if (hydrated) setUser(hydrated);
          return { success: true };
        }

        if (code) {
          const { data: exchangeData, error: exchangeError } =
            await authClient.auth.exchangeCodeForSession(code);
          if (exchangeError || !exchangeData.user) {
            return {
              success: false,
              error: exchangeError?.message ?? "Ошибка обмена кода",
            };
          }
          const hydrated = await hydrateFromSupabaseUser(exchangeData.user);
          if (hydrated) setUser(hydrated);
          return { success: true };
        }
      }

      // Some native browser sessions close with cancel/dismiss even after the
      // redirect wrote the Supabase session. Trust storage before showing error.
      const restoredSession = await hydrateCurrentSession();
      if (restoredSession) return restoredSession;

      if (result.type === "cancel" || result.type === "dismiss") {
        return { success: false, error: "Вход через Google отменён" };
      }

      return {
        success: false,
        error: "Не удалось завершить вход через Google",
      };
    } catch (e: any) {
      return { success: false, error: e?.message ?? "Неизвестная ошибка" };
    }
  }, []);

  const setUserRole = useCallback(
    async (role: UserRole) => {
      if (!user) return;
      const nextUser = {
        ...user,
        role,
        profileComplete: false,
        hasSelectedRole: true,
      };
      await setLocalProfileComplete(user.id, false);
      setUser(nextUser);
      // Persist for dev-switcher users; real users rely on Supabase session.
      if (devMode) {
        await AsyncStorage.setItem(DEV_USER_KEY, JSON.stringify(nextUser));
      }
      if (supabase && isSupabaseConfigured) {
        // Only touch the remote profile when Supabase has an active session.
        // Dev tools prefer anonymous sessions, so auth.uid() still maps to a
        // real user; local fallback users simply skip this path.
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          await supabase.auth.updateUser({ data: { role } });
          await upsertRemoteProfile(nextUser);
        }
      }
    },
    [user, devMode],
  );

  const devLogin = useCallback(async (role: UserRole) => {
    if (supabase && isSupabaseConfigured) {
      const { data: currentSession } = await supabase.auth.getSession();
      const currentUser = currentSession.session?.user ?? null;
      const shouldReuseAnonymousDevUser =
        currentUser &&
        isAnonymousSupabaseUser(currentUser) &&
        currentUser.user_metadata?.dev_role_switcher === true;

      if (currentUser && !shouldReuseAnonymousDevUser) {
        await supabase.auth.signOut();
      }

      const sessionUser = shouldReuseAnonymousDevUser
        ? currentUser
        : (
            await supabase.auth.signInAnonymously({
              options: {
                data: {
                  dev_role_switcher: true,
                  role,
                  first_name: "Dev",
                  last_name: role.charAt(0).toUpperCase() + role.slice(1),
                },
              },
            })
          ).data.user;

      if (sessionUser) {
        const nextUser = buildDevUserFromId(sessionUser.id, role);
        setUser(nextUser);
        await upsertRemoteProfile(nextUser);
        await AsyncStorage.removeItem(DEV_USER_KEY);
        return;
      }
    }

    const nextUser = toAuthUser({
      id: DEV_IDS[role] ?? "d0000000-0000-4000-a000-000000000009",
      phone: "79991234567",
      email: `${role}@example.com`,
      role: role,
      firstName: "Dev",
      lastName: "User",
    });

    setUser(nextUser);
    await AsyncStorage.setItem(DEV_USER_KEY, JSON.stringify(nextUser));
  }, []);

  const setDevMode = useCallback(async (enabled: boolean) => {
    setDevModeState(enabled);
    await AsyncStorage.setItem(DEV_MODE_KEY, enabled ? "true" : "false");
  }, []);

  const logout = useCallback(async () => {
    if (supabase && isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
    await AsyncStorage.removeItem(DEV_USER_KEY);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      devOtpCode: DEV_OTP,
      sendOtp,
      sendRegistrationCode,
      verifyOtpAndRegister,
      registerWithIdentifier,
      loginWithPhone,
      loginWithIdentifier,
      loginWithGoogle,
      loginWithQR,
      requestPasswordReset,
      updatePassword,
      setUserRole,
      logout,
      devLogin,
      devMode,
      setDevMode,
      finalizeRegistration,
    }),
    [
      user,
      isLoading,
      // devOtpCode is a constant, no need to list as dependency
      sendOtp,
      sendRegistrationCode,
      verifyOtpAndRegister,
      registerWithIdentifier,
      loginWithPhone,
      loginWithIdentifier,
      loginWithGoogle,
      loginWithQR,
      requestPasswordReset,
      updatePassword,
      setUserRole,
      logout,
      devLogin,
      devMode,
      setDevMode,
      finalizeRegistration,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
