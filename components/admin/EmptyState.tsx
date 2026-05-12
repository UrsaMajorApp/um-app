// EmptyState: показывает пустое состояние списка с иконкой, текстом и optional action.
import { Feather } from '@expo/vector-icons';
import type React from 'react';
import { Text, View } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';

export function EmptyState({
  icon = 'inbox',
  title,
  body,
}: {
  icon?: React.ComponentProps<typeof Feather>['name'];
  title: string;
  body?: string;
}) {
  return (
    <View
      style={{
        padding: SPACING.xl,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: RADIUS.lg,
          backgroundColor: COLORS.muted,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: SPACING.sm,
        }}
      >
        <Feather name={icon} size={22} color={COLORS.mutedForeground} />
      </View>
      <Text
        style={{
          color: COLORS.foreground,
          fontWeight: '900',
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            color: COLORS.mutedForeground,
            fontSize: TYPOGRAPHY.size.sm,
            marginTop: 4,
            textAlign: 'center',
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}
