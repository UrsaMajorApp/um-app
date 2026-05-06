import { Redirect, useLocalSearchParams } from "expo-router";
import { useAuth, type UserRole } from "../contexts/AuthContext";

const PROFILE_SETUP_ROUTES: Partial<Record<UserRole, string>> = {
  parent: "/profile/parent/create-profile",
  youth: "/profile/youth/create-profile",
  child: "/profile/youth/create-profile",
  "young-adult": "/profile/youth/create-profile",
  mentor: "/profile/mentor/create-profile",
  org: "/profile/organization/create-profile",
};

export default function Index() {
  const { user, isLoading } = useAuth();
  const params = useLocalSearchParams<{
    error?: string;
    error_code?: string;
  }>();

  if (isLoading) return null;

  // Supabase redirects OAuth errors to the project Site URL (our root).
  // Bounce to login so the user gets a clean slate instead of a broken screen.
  if (params.error || params.error_code) {
    return <Redirect href="/login" />;
  }

  if (user) {
    if (!user.profileComplete) {
      if (user.hasSelectedRole === false) {
        return <Redirect href="/auth/complete-profile" />;
      }
      return (
        <Redirect
          href={(PROFILE_SETUP_ROUTES[user.role] ?? "/(tabs)/home") as any}
        />
      );
    }
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/intro" />;
}
