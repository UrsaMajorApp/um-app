import { useRouter, useSegments, type Href } from 'expo-router';
import { DEFAULT_TABS, TABS_BY_ROLE, type Role } from '$constants/navigation/tabItems';

export function useTabNav(role: Role | string | null) {
  const router = useRouter();
  const segments = useSegments() as string[];
  const currentSegment = segments[segments.length - 1];
  const currentPath = segments.slice(1).join('/');
  const tabs = role ? TABS_BY_ROLE[role] || DEFAULT_TABS : DEFAULT_TABS;

  const go = (route: string) => {
    const href = `/(tabs)/${route}` as Href;
    if (route.includes('/')) {
      router.push(href);
    } else {
      router.replace(href);
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
