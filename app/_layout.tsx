import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, useColorScheme, View } from "react-native";
import { COLORS } from "../constants/theme";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { DevSettingsProvider } from "../contexts/DevSettingsContext";
import { ParentDataProvider } from "../contexts/ParentDataContext";
import "../global.css";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DevRoleSwitcher } from "../components/DevRoleSwitcher";
import type { AuthUser, UserRole } from "../contexts/AuthContext";
import { PROFILE_SETUP_ROUTES, YOUTH_ROLES } from "../constants/profileRoutes";

function getProfileSetupRoute(role: UserRole) {
  return PROFILE_SETUP_ROUTES[role] ?? "/(tabs)/home";
}

function isYouthRole(role: UserRole) {
  return YOUTH_ROLES.has(role);
}

function canUseYouthDiagnostic(role: UserRole) {
  return role === "parent" || isYouthRole(role);
}

function getRoleGuardRedirect(user: AuthUser, segments: string[]) {
  const root = segments[0];
  const section = segments[1];
  const screen = segments[2];
  const role = user.role;

  if (root === "(tabs)") {
    if (section === "admin" && role !== "admin") return "/(tabs)/home";
    if (section === "parent" && role !== "parent") return "/(tabs)/home";
    if (section === "youth" && !isYouthRole(role)) return "/(tabs)/home";
    if (section === "mentor" && role !== "mentor") return "/(tabs)/home";
    if (section === "organization" && role !== "org") return "/(tabs)/home";
    if (section === "teacher" && role !== "teacher") return "/(tabs)/home";
    if (section === "chats" && role === "child") return "/(tabs)/home";
    if (section === "catalog" && (role === "mentor" || role === "org"))
      return "/(tabs)/home";
    return null;
  }

  if (root === "profile") {
    if (section === "admin" && role !== "admin") return "/(tabs)/home";
    if (section === "parent" && role !== "parent") return "/(tabs)/home";
    if (section === "organization" && role !== "org") return "/(tabs)/home";
    if (section === "mentor" && role !== "mentor") return "/(tabs)/home";
    if (section === "teacher" && role !== "teacher") return "/(tabs)/home";
    if (section === "youth") {
      if (screen === "create-profile-child" && role !== "parent")
        return "/(tabs)/home";
      if (
        (screen === "create-profile" ||
          screen === "create-profile-young-adult") &&
        !isYouthRole(role)
      ) {
        return "/(tabs)/home";
      }
      if (!canUseYouthDiagnostic(role)) return "/(tabs)/home";
    }
    return null;
  }

  if (root === "parent" && role !== "parent") return "/(tabs)/home";
  if (root === "mentor" && role !== "mentor") return "/(tabs)/home";
  if (root === "organization" && role !== "org") return "/(tabs)/home";

  return null;
}

function getRouteRedirectPath({
  devMode,
  isLoading,
  segments,
  user,
}: {
  devMode: boolean;
  isLoading: boolean;
  segments: string[];
  user: AuthUser | null;
}) {
  if (isLoading) return null;

  const root = segments[0];
  const authScreen = segments[1] as string | undefined;
  const inAuthGroup = root === "(auth)";
  const inOAuthFlow = root === "auth";
  const isOAuthCallbackScreen =
    inOAuthFlow &&
    (authScreen === "callback" ||
      authScreen === "complete-profile" ||
      authScreen === "reset-password");

  if (!user && !inAuthGroup && !inOAuthFlow) {
    return "/intro";
  }

  if (user && !user.profileComplete && !devMode && !isOAuthCallbackScreen) {
    if (user.hasSelectedRole === false) {
      return "/auth/complete-profile";
    }

    const setupRoute = getProfileSetupRoute(user.role);
    const setupRouteParts = setupRoute.split("/").filter(Boolean);
    const onProfileSetupRoute = setupRouteParts.every(
      (part, index) => segments[index] === part,
    );

    if (!onProfileSetupRoute) {
      return setupRoute;
    }
  }

  if (user && inAuthGroup && authScreen === "intro") {
    return "/(tabs)/home";
  }

  if (
    user &&
    inAuthGroup &&
    authScreen !== "role" &&
    authScreen !== "register" &&
    !devMode
  ) {
    return "/(tabs)/home";
  }

  if (user && inOAuthFlow && !isOAuthCallbackScreen && !devMode) {
    return "/(tabs)/home";
  }

  if (user && root === "profile" && !segments[1]) {
    if (!user.profileComplete && !devMode) {
      if (user.hasSelectedRole === false) {
        return "/auth/complete-profile";
      }
      return getProfileSetupRoute(user.role);
    }

    return "/(tabs)/home";
  }

  if (user) {
    return getRoleGuardRedirect(user, segments);
  }

  return null;
}

function RootNavigator() {
  const colorScheme = useColorScheme();
  const { user, isLoading, devMode } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const redirectPath = getRouteRedirectPath({
    devMode,
    isLoading,
    segments,
    user,
  });

  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath as any);
    }
  }, [redirectPath, router]);

  if (isLoading || redirectPath) {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.background,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
        <DevRoleSwitcher />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        {/* AUTH + INTRO (показываются первыми) */}
        <Stack.Screen name="(auth)" />
        {/* OAuth callback flow — lives at /auth/callback and /auth/complete-profile */}
        <Stack.Screen name="auth" />

        {/* PROFILE CREATION (идут после выбора роли) */}
        <Stack.Screen name="profile" />

        {/* MAIN TABS (доступно только после входа) */}
        <Stack.Screen name="(tabs)" />

        {/* если вдруг понадобится модальное окно */}
        {/* <Stack.Screen name="modal" options={{presentation: "modal"}}/> */}

        {/* <Stack.Screen
                  name="modal/course"
                  options={{presentation: "modal"}}
              /> */}

        {/* TEST ROUTE */}
        <Stack.Screen
          name="parent/testing/index"
          options={{ presentation: "fullScreenModal" }}
        />
      </Stack>
      <DevRoleSwitcher />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ParentDataProvider>
          <DevSettingsProvider>
            <RootNavigator />
          </DevSettingsProvider>
        </ParentDataProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
