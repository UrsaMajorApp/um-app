import React from "react";
import { View, type ViewStyle } from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "@/constants/theme";

export function FormCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={{
        ...SHADOWS.strict,
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.xxl,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
