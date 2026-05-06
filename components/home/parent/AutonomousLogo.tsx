import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';

type AutonomousLogoProps = {
  width: number;
  height: number;
  dark?: boolean;
};

export const AutonomousLogo = React.memo(({ width, height, dark }: AutonomousLogoProps) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(() => ({
    top: Math.random() * (height || 800),
    left: Math.random() * (width || 400),
    size: 20 + Math.random() * 70,
    rotation: `${Math.floor(Math.random() * 80) - 40}deg`,
    duration: 2500 + Math.random() * 2000,
  }));

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const runCycle = () => {
      if (!isMounted) return;

      setVisible(true);

      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        setVisible(false);

        timeoutId = setTimeout(() => {
          if (!isMounted) return;

          setConfig({
            top: Math.random() * (height || 800),
            left: Math.random() * (width || 400),
            size: 20 + Math.random() * 70,
            rotation: `${Math.floor(Math.random() * 80) - 40}deg`,
            duration: 2500 + Math.random() * 2000,
          });

          timeoutId = setTimeout(runCycle, 1000);
        }, config.duration + 500);
      }, config.duration + 2000);
    };

    timeoutId = setTimeout(runCycle, Math.random() * 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [width, height]);

  return (
    <MotiView
      animate={{
        opacity: visible ? (dark ? 0.06 : 0.15) : 0,
        scale: visible ? 1.1 : 0.6,
        rotate: config.rotation,
      }}
      transition={{
        type: 'timing',
        duration: config.duration,
      }}
      style={{
        position: 'absolute',
        top: config.top,
        left: config.left,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Image
        source={require('../../../assets/logo/Frame 4.svg')}
        style={{
          width: config.size,
          height: config.size,
          tintColor: dark ? '#555555' : undefined,
        }}
        resizeMode="contain"
      />
    </MotiView>
  );
});
