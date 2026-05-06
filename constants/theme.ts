/**
 * UM Design System (UMDS)
 * Единый источник истины для всех стилей приложения.
 * Ориентирован на премиальный, мягкий iOS-стиль без острых углов.
 */

export const COLORS = {
  // Brand
  primary: "#6C5CE7",
  secondary: "#AF52DE",
  accent: "#FF9F0A",
  
  // Base
  background: "#FDFDFF",
  surface: "#FFFFFF",
  card: "#FFFFFF", // Restored
  muted: "#F2F2F7",
  
  // Content
  foreground: "#1C1C1E",
  mutedForeground: "#8E8E93",
  tertiary: "#C7C7CC",
  
  // Semantic
  success: "#34C759",
  warning: "#FF9500",
  destructive: "#FF3B30",
  info: "#007AFF",
  
  // Special
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  border: "rgba(0,0,0,0.06)",
  overlay: "rgba(0,0,0,0.4)",
  
  // Gradient Swatches
  gradients: {
    primary: ["#5856D6", "#AF52DE"] as [string, string],
    success: ["#34C759", "#32D74B"] as [string, string],
    surface: ["#FFFFFF", "#F2F2F7"] as [string, string],
    header: ["#4F46E5", "#7C3AED", "#C026D3"] as [
      string,
      string,
      string,
    ], // Matches intro page gradient
  }
};

export const TYPOGRAPHY = {
  size: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },
  weight: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
  letterSpacing: {
    tight: -1,
    normal: 0,
    wide: 0.5,
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 18,
  lg: 24,
  xl: 32,
  xxl: 40,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.05)",
  },
  md: {
    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.08)",
  },
  lg: {
    boxShadow: "0px 12px 32px rgba(0, 0, 0, 0.12)",
  },
  strict: {
    boxShadow: "0px 0px 1px rgba(0,0,0,0.1), 0px 8px 20px rgba(0,0,0,0.06)",
  }
};

export const LAYOUT = {
  desktopBreakpoint: 1024,
  maxWidth: 1200,
  formMaxWidth: 520,
  
  // Paddings
  horizontalPaddingMobile: 24,
  horizontalPaddingDesktop: 48,
  
  // Auth specific
  authMaxWidth: 520,
  authHorizontalPaddingMobile: 24,
  authHorizontalPaddingDesktop: 32,
  
  // Profile specific
  profileFormMaxWidth: 960,
  profileHorizontalPaddingMobile: 24,
  profileHorizontalPaddingDesktop: 48,
  
  // Dashboard
  dashboardMaxWidth: 1280,
  dashboardHorizontalPaddingMobile: 24,
  dashboardHorizontalPaddingDesktop: 40,
  
  sideNavWidth: 260,
};
