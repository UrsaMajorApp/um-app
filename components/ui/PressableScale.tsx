// PressableScale: добавляет press-анимацию масштаба к кнопкам и карточкам.
import type React from 'react';
import { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { PRESSABLE_SCALE_OUTER_PROPS } from '$constants/ui';
import type { PressableEvent } from '$types/ui';

interface PressableScaleProps extends Omit<PressableProps, 'style'> {
  children: React.ReactNode;
  /** Scale factor when pressed. Default 0.96 */
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}

// Props that must live on the outer Pressable to work correctly:
//   - position/inset: so the hit target is placed correctly in the parent
//   - flex participation: so this element grows/shrinks inside a parent flex row/column
//   - alignSelf: parent-directed cross-axis alignment
//   - margin: outer spacing that should not scale with the animation
// Everything else (width, height, padding, backgroundColor, flexDirection, etc.)
// goes on the inner Animated.View so visuals and children layout correctly.
function splitStyle(style: StyleProp<ViewStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(flat)) {
    (PRESSABLE_SCALE_OUTER_PROPS.has(key) ? outer : inner)[key] = val;
  }
  return { outer, inner };
}

/**
 * Drop-in replacement for TouchableOpacity that scales down on press and
 * springs back on release. Works on both native and web (mouse-up triggers
 * onPressOut correctly via Pressable).
 *
 * Style-splitting: position/zIndex/top/bottom/left/right go on the outer
 * Pressable so absolute-positioned buttons stay in place; all other styles
 * (flexDirection, padding, backgroundColor, etc.) go on the inner
 * Animated.View so children lay out correctly.
 */
export function PressableScale({
  children,
  scaleTo = 0.96,
  style,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const { outer, inner } = splitStyle(style);
  const useNativeDriver = Platform.OS !== 'web';

  const handlePressIn = (e: PressableEvent) => {
    Animated.spring(scale, {
      toValue: disabled ? 1 : scaleTo,
      useNativeDriver,
      speed: 60,
      bounciness: 0,
    }).start();
    onPressIn?.(e);
  };

  const handlePressOut = (e: PressableEvent) => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver,
      speed: 40,
      bounciness: 5,
    }).start();
    onPressOut?.(e);
  };

  return (
    <Pressable
      style={outer as ViewStyle}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      <Animated.View style={[inner as ViewStyle, { transform: [{ scale }] }]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
