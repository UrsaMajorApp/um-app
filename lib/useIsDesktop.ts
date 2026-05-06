import { Platform, useWindowDimensions } from "react-native";
import { LAYOUT } from "$constants/theme";

export function isDesktopWidth(width: number) {
  return isWebMinWidth(width, LAYOUT.desktopBreakpoint);
}

export function isWebMinWidth(width: number, minWidth: number) {
  return Platform.OS === "web" && width >= minWidth;
}

export function getDashboardHorizontalPadding(
  isDesktop: boolean,
  mobilePadding = LAYOUT.dashboardHorizontalPaddingMobile,
) {
  return isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop : mobilePadding;
}

export function useIsDesktop() {
  const { width } = useWindowDimensions();
  return isDesktopWidth(width);
}
