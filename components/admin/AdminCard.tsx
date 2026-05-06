import type React from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';

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
