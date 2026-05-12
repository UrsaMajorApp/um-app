// styles types: описывает TypeScript-структуры данных для стилей.
import type { TextStyle, ViewStyle } from 'react-native';

export type WebViewStyle = Omit<ViewStyle, 'position'> & {
  backdropFilter?: string;
  cursor?: string;
  position?: ViewStyle['position'] | 'fixed';
};

export type WebTextStyle = TextStyle & {
  outlineWidth?: number;
};
