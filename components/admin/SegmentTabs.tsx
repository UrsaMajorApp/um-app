// SegmentTabs: переключает под-разделы админки через компактные segmented tabs.
import { Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { useAdminLayout } from '$lib/adminUtils';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';

export function SegmentTabs<T extends string>({
  value,
  tabs,
  onChange,
}: {
  value: T;
  tabs: { key: T; label: string }[];
  onChange: (key: T) => void;
}) {
  const { paddingX } = useAdminLayout();
  return (
    <View
      style={{
        paddingHorizontal: paddingX,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.surface,
      }}
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm }}>
        {tabs.map((tab) => {
          const active = tab.key === value;
          return (
            <PressableScale
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                backgroundColor: active ? COLORS.primary : COLORS.muted,
                borderRadius: RADIUS.full,
              }}
            >
              <Text
                style={{
                  color: active ? COLORS.white : COLORS.foreground,
                  fontWeight: '700',
                  fontSize: TYPOGRAPHY.size.sm,
                }}
              >
                {tab.label}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
