// WebOnly: рендерит дочерний UI только в web-среде, где доступны browser-only API.
import type { CSSProperties, ReactNode } from 'react';
import { Platform } from 'react-native';

interface WebOnlyProps {
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function WebOnly({ children, style, className }: WebOnlyProps) {
  if (Platform.OS !== 'web') return null;

  return (
    <div style={style} className={className}>
      {children}
    </div>
  );
}
