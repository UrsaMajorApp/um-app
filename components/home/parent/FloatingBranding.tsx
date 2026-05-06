import React from 'react';
import { AutonomousLogo } from '$components/home/parent/AutonomousLogo';

type FloatingBrandingProps = {
  count?: number;
  dark?: boolean;
  width: number;
  height: number;
};

export const FloatingBranding = React.memo(
  ({ count = 15, dark = false, width, height }: FloatingBrandingProps) => {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <AutonomousLogo key={i} width={width} height={height} dark={dark} />
        ))}
      </>
    );
  },
);
