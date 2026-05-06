import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";

export function AdminCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.surface,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: COLORS.border,
          ...SHADOWS.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
