// AuthMethodSwitcher: переключает форму входа между телефоном и email без дублирования разметки.
import { StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, RADIUS } from '$constants/theme';
import type { AuthMethod } from '$types/auth';

interface AuthMethodSwitcherProps {
  value: AuthMethod;
  onChange: (method: AuthMethod) => void;
}

export function AuthMethodSwitcher({ value, onChange }: AuthMethodSwitcherProps) {
  return (
    <View style={styles.switcher}>
      {(['phone', 'email'] as const).map((method) => {
        const active = method === value;
        return (
          <PressableScale
            key={method}
            onPress={() => onChange(method)}
            style={[styles.switcherItem, active && styles.switcherItemActive]}
            scaleTo={0.94}
          >
            <Text style={[styles.switcherText, active && styles.switcherTextActive]}>
              {method === 'phone' ? 'Телефон' : 'Email'}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.md,
    padding: 4,
    marginBottom: 20,
  },
  switcherItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md - 2,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  switcherItemActive: {
    backgroundColor: COLORS.card,
  },
  switcherText: {
    fontWeight: '600',
    fontSize: 13,
    color: COLORS.mutedForeground,
  },
  switcherTextActive: {
    color: COLORS.foreground,
  },
});
