import React from 'react';
import { AutonomousLogo } from '$components/home/parent/AutonomousLogo';

interface FloatingBrandingProps {
  count?: number;
  dark?: boolean;
  width: number;
  height: number;
}

export const FloatingBranding = React.memo(
  ({ count = 15, dark = false, width, height }: FloatingBrandingProps) => {
    const logoKeys = React.useMemo(
      () => Array.from({ length: count }, (_, index) => `floating-brand-${index}`),
      [count],
    );

    return (
      <>
        {logoKeys.map((key) => (
          <AutonomousLogo key={key} width={width} height={height} dark={dark} />
        ))}
      </>
    );
  },
);
