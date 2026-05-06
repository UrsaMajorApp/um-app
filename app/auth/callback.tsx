/**
 * /auth/callback
 *
 * Landing page after Google (or any Supabase OAuth) redirect.
 *
 * Web flow:
 *  Supabase detects the session from the URL hash (detectSessionInUrl: true),
 *  emits SIGNED_IN, AuthContext hydrates the user, we route to home.
 *
 * Native (Android / iOS) flow:
 *  1. Chrome Custom Tab / SFSafariViewController opens the OAuth URL.
 *  2. Supabase redirects to umapp://auth/callback#access_token=...
 *  3. Android fires a deep-link intent → Expo Router opens this screen.
 *  4. maybeCompleteAuthSession() tells the lingering Custom Tab to close.
 *  5. We parse the tokens from the deep-link URL and set the Supabase session.
 *  6. onAuthStateChange in AuthContext hydrates the user.
 *  7. We route to home or complete-profile.
 */

import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

// ← This call is what closes the lingering Chrome Custom Tab on Android.
//   It must run at module level (before the component mounts) so it fires
//   as early as possible after the deep-link opens the screen.
WebBrowser.maybeCompleteAuthSession();

export default function AuthCallback() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const handled = useRef(false);
  const sessionReady = useRef(false);
  const [status, setStatus] = useState("Выполняется вход...");

  // ── Web only: bail out immediately if the URL contains an OAuth error ──
  // This happens when the user navigates back to the Google OAuth page after
  // a session was already consumed — Google rejects it and redirects back to
  // /auth/callback with error params instead of tokens.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const errorCode = params.get("error_code") ?? params.get("error");
    if (errorCode) {
      router.replace("/login" as any);
    }
  }, []);

  // ── Native only: parse tokens from the deep-link URL ──────────────────
  // On Android/iOS the OAuth tokens arrive as URL hash fragments on the
  // umapp://auth/callback URL that opened this screen.  Supabase's
  // detectSessionInUrl is disabled on native so we do it manually here.
  useEffect(() => {
    if (Platform.OS === "web") return;

    const parseAndSetSession = async (url: string) => {
      if (!supabase || !isSupabaseConfigured) return;
      if (!url) return;

      try {
        setStatus("Обработка входа...");

        const hashPart = url.split("#")[1] ?? "";
        const queryPart = url.split("?")[1]?.split("#")[0] ?? "";
        const hashParams = new URLSearchParams(hashPart);
        const queryParams = new URLSearchParams(queryPart);

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const code = queryParams.get("code");

        if (accessToken && refreshToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          sessionReady.current = true;
        } else if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          sessionReady.current = true;
        }
        // onAuthStateChange in AuthContext fires → user is set → routing effect runs
      } catch (e) {
        console.error("[AuthCallback] native session parse error:", e);
        router.replace("/login" as any);
      }
    };

    // Case 1: app was launched (cold start) via the deep link
    Linking.getInitialURL().then((url) => {
      if (url) parseAndSetSession(url);
    });

    // Case 2: app was already running in background and was brought to
    // foreground via the deep link (e.g. user opened browser manually)
    const sub = Linking.addEventListener("url", ({ url }) =>
      parseAndSetSession(url),
    );
    return () => sub.remove();
  }, []);

  // ── Route once we have a user (web or native) ─────────────────────────
  useEffect(() => {
    if (isLoading) return;
    if (handled.current) return;

    // On native, give the session-parse effect a moment to fire first
    if (Platform.OS !== "web" && !sessionReady.current && !user) return;

    handled.current = true;

    if (!user) {
      router.replace("/login" as any);
      return;
    }

    checkProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading]);

  const checkProfile = async () => {
    if (!supabase || !isSupabaseConfigured) {
      router.replace("/home" as any);
      return;
    }

    setStatus("Загрузка профиля...");

    const { data } = await supabase
      .from("um_user_profiles")
      .select("id, role")
      .eq("id", user!.id)
      .maybeSingle();

    if (data?.role) {
      router.replace("/home" as any);
    } else {
      router.replace("/auth/complete-profile" as any);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLORS.background,
      }}
    >
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text
        style={{
          marginTop: 16,
          color: COLORS.mutedForeground,
          fontSize: 15,
          fontWeight: "500",
        }}
      >
        {status}
      </Text>
    </View>
  );
}
