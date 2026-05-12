// Router helpers: типизирует и упрощает переходы через Expo Router.
import type { AppHref } from '$types/router';

export function appHref(path: string): AppHref {
  return path as AppHref;
}
