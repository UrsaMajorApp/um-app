// ui types: описывает TypeScript-структуры данных для UI-компонентов.
import type { PressableProps } from 'react-native';

export type PressableEvent = Parameters<NonNullable<PressableProps['onPressIn']>>[0];
