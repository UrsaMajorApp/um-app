import type { PressableProps } from 'react-native';

export type PressableEvent = Parameters<NonNullable<PressableProps['onPressIn']>>[0];
