// useTabNav: вычисляет видимые вкладки и активный пункт навигации по роли и маршруту.
import { type Href, useRouter, useSegments } from 'expo-router';
import { DEFAULT_TABS, type Role, TABS_BY_ROLE } from '$constants/navigation/tabItems';
import type { UserRole } from '$contexts/AuthContext';
import { canAccessRouteSegments } from '$lib/appNavigation';

export function useTabNav(role: Role | string | null) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const currentSegment = segments[segments.length - 1];
  const currentPath = segments.slice(1).join('/');
  const tabs = role ? TABS_BY_ROLE[role] || DEFAULT_TABS : DEFAULT_TABS;

  const go = (route: string) => {
    const href = `/(tabs)/${route}` as Href;
    const routeSegments = ['(tabs)', ...route.split('/')];
    const safeHref =
      role && canAccessRouteSegments(role as UserRole, routeSegments)
        ? href
        : ('/(tabs)/home' as Href);

    if (route.includes('/')) {
      router.push(safeHref);
    } else {
      router.replace(safeHref);
    }
  };

  const isActive = (route: string) => {
    if (route.includes('/')) {
      return currentPath.endsWith(route) || currentPath === route;
    }
    return currentSegment === route;
  };

  return { tabs, go, isActive };
}
