import React from "react";
import {
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "$constants/theme";

export function PrimaryActionButton({
  children,
  disabled,
  style,
  ...props
}: TouchableOpacityProps & {
  children: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      disabled={disabled}
      {...props}
      style={[
        {
          height: 60,
          borderRadius: RADIUS.xl,
          alignItems: "center",
          justifyContent: "center",
          marginTop: SPACING.xxl,
          backgroundColor: disabled ? COLORS.border : COLORS.primary,
          ...SHADOWS.md,
        },
        style,
      ]}
    >
      <Text
        style={{
          color: "white",
          fontWeight: TYPOGRAPHY.weight.bold,
          fontSize: 16,
        }}
      >
        {children}
      </Text>
    </TouchableOpacity>
  );
}
