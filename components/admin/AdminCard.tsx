import React from "react";
import { View } from "react-native";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";

export function AdminCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View
      style={{
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
        ...style,
      }}
    >
      {children}
    </View>
  );
}
