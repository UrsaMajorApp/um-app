import { Tabs, useRouter, useSegments } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { ActivityIndicator, View } from 'react-native';
import CustomTabBar from '$components/navigation/CustomTabBar';
import { SideNav } from '$components/navigation/SideNav';
import { TabIcon } from '$components/navigation/TabIcon';
import { COLORS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { canAccessRouteSegments } from '$lib/appNavigation';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function TabsLayout() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const role = useMemo(() => user?.role || 'parent', [user?.role]);
  const hideForMentor = role === 'mentor' || role === 'org';
  const isTabsRoute = segments[0] === '(tabs)';
  const shouldRedirect = Boolean(
    isTabsRoute && user && !canAccessRouteSegments(user.role, segments),
  );

  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/(tabs)/home');
    }
  }, [router, shouldRedirect]);

  if (isLoading || !user || shouldRedirect) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const screens = (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="home/index" options={{ href: '/home' }} />

      <Tabs.Screen
        name="analytics/index"
        options={{
          href: '/analytics',
        }}
      />

      <Tabs.Screen
        name="profile/index"
        options={{
          href: '/profile',
        }}
      />

      <Tabs.Screen
        name="chats/index"
        options={{
          title: 'Чаты',
          href: user?.role === 'child' ? null : '/chats',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              icon={focused ? 'message-square' : 'message-square'}
              color={color}
              focused={focused}
            />
          ),
        }}
      />

      {/* CATALOG — скрыт у ментора */}
      <Tabs.Screen
        name="catalog/index"
        options={{
          href: hideForMentor ? null : '/catalog',
        }}
      />

      {/* SHARED SCREENS */}
      <Tabs.Screen name="chats/[id]" options={{ href: null }} />

      {/* PARENT SCREENS */}
      <Tabs.Screen name="parent/children" options={{ href: null }} />
      <Tabs.Screen name="parent/calendar" options={{ href: null }} />
      <Tabs.Screen name="parent/clubs" options={{ href: null }} />
      <Tabs.Screen name="parent/reports" options={{ href: null }} />
      <Tabs.Screen name="parent/club/[id]" options={{ href: null }} />
      <Tabs.Screen name="parent/child/[id]" options={{ href: null }} />

      {/* YOUTH SCREENS */}
      <Tabs.Screen name="youth/games" options={{ href: null }} />
      <Tabs.Screen name="youth/games/[id]" options={{ href: null }} />
      <Tabs.Screen name="youth/goals" options={{ href: null }} />
      <Tabs.Screen name="youth/tasks" options={{ href: null }} />
      <Tabs.Screen name="youth/achievements" options={{ href: null }} />

      {/* MENTOR SCREENS */}
      <Tabs.Screen name="mentor/students" options={{ href: null }} />
      <Tabs.Screen name="mentor/wallet" options={{ href: null }} />
      <Tabs.Screen name="mentor/learning-path" options={{ href: null }} />
      <Tabs.Screen name="mentor/student/[id]" options={{ href: null }} />

      {/* ORGANIZATION SCREENS */}
      <Tabs.Screen name="organization/courses" options={{ href: null }} />
      <Tabs.Screen name="organization/students" options={{ href: null }} />
      <Tabs.Screen name="organization/applications" options={{ href: null }} />
      <Tabs.Screen name="organization/attendance" options={{ href: null }} />
      <Tabs.Screen name="organization/tasks" options={{ href: null }} />
      <Tabs.Screen name="organization/staff" options={{ href: null }} />
      <Tabs.Screen name="organization/groups" options={{ href: null }} />

      {/* TEACHER SCREENS */}
      <Tabs.Screen name="teacher/groups" options={{ href: null }} />
      <Tabs.Screen name="teacher/group/[id]/index" options={{ href: null }} />
      <Tabs.Screen name="teacher/group/[id]/journal" options={{ href: null }} />
      <Tabs.Screen name="teacher/student/[id]" options={{ href: null }} />

      {/* ADMIN SCREENS */}
      <Tabs.Screen name="admin/users" options={{ href: null }} />
      <Tabs.Screen name="admin/organizations" options={{ href: null }} />
      <Tabs.Screen name="admin/billing" options={{ href: null }} />
      <Tabs.Screen name="admin/support" options={{ href: null }} />
      <Tabs.Screen name="admin/settings" options={{ href: null }} />
    </Tabs>
  );

  return (
    <View style={{ flex: 1, flexDirection: isDesktop ? 'row' : 'column' }}>
      {isDesktop && <SideNav role={role} />}
      <View style={{ flex: 1 }}>{screens}</View>
      {!isDesktop && <CustomTabBar role={role} />}
    </View>
  );
}
