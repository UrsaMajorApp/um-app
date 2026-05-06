import { Feather } from '@expo/vector-icons';
import { View } from 'react-native';
import type { FeatherIconName } from '$types/icons';

export function TabIcon({
  icon,
  color,
  focused,
}: {
  icon: FeatherIconName;
  color: string;
  focused: boolean;
}) {
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Feather name={icon} size={22} color={color} />
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -8,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: color,
          }}
        />
      )}
    </View>
  );
}
