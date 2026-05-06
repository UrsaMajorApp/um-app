import type { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type FeatherIconName = keyof typeof Feather.glyphMap;
export type MaterialCommunityIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
