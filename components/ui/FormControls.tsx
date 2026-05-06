import React from "react";
import {
  Text,
  TextInput,
  type TextInputProps,
  TouchableOpacity,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
} from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING, TYPOGRAPHY } from "@/constants/theme";

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

export function LabeledTextInput({
  label,
  inputStyle,
  ...props
}: TextInputProps & {
  label: string;
  inputStyle?: TextInputProps["style"];
}) {
  return (
    <View>
      <Text
        style={{
          fontSize: 10,
          fontWeight: TYPOGRAPHY.weight.bold,
          color: COLORS.mutedForeground,
          textTransform: "uppercase",
          letterSpacing: 1,
          marginBottom: 8,
          marginLeft: 4,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor={COLORS.mutedForeground}
        {...props}
        style={[
          {
            height: 56,
            backgroundColor: COLORS.background,
            borderRadius: RADIUS.lg,
            paddingHorizontal: 16,
            fontSize: 16,
            fontWeight: TYPOGRAPHY.weight.medium,
            color: COLORS.foreground,
            borderWidth: 1,
            borderColor: COLORS.border,
          },
          inputStyle,
          props.style,
        ]}
      />
    </View>
  );
}

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
