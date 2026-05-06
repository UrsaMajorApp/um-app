import type { ViewStyle } from 'react-native';

export type WebViewStyle = Omit<ViewStyle, 'position'> & {
  backdropFilter?: string;
  cursor?: string;
  position?: ViewStyle['position'] | 'fixed';
};
