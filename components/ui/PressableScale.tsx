// PressableScale: добавляет press-анимацию масштаба к кнопкам и карточкам.
import type React from 'react';
import { useRef } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  type StyleProp,
  StyleSheet,
  type TouchableOpacityProps,
  View,
  type ViewStyle,
  type PressableProps,
  type PressableStateCallbackType,
} from 'react-native';
import type { PressableEvent } from '$types/ui';

type PressableScaleStyle =
  | StyleProp<ViewStyle>
  | ((state: PressableStateCallbackType) => StyleProp<ViewStyle>);

const WEB_PRESS_TRANSITION =
  Platform.OS === 'web'
    ? ({
        transitionProperty: 'transform',
        transitionDuration: '140ms',
        transitionTimingFunction: 'cubic-bezier(0.2, 0, 0, 1)',
        willChange: 'transform',
      } as unknown as ViewStyle)
    : null;

const OUTER_STYLE_PROPS = new Set([
  'position',
  'top',
  'bottom',
  'left',
  'right',
  'zIndex',
  'flex',
  'flexGrow',
  'flexShrink',
  'flexBasis',
  'alignSelf',
  'margin',
  'marginTop',
  'marginBottom',
  'marginLeft',
  'marginRight',
  'marginHorizontal',
  'marginVertical',
  'marginStart',
  'marginEnd',
]);

const OUTER_CLASS_PREFIXES = [
  'grow',
  'shrink',
  'basis-',
  'self-',
  'm-',
  'mx-',
  'my-',
  'mt-',
  'mr-',
  'mb-',
  'ml-',
  'ms-',
  'me-',
  '-m-',
  '-mx-',
  '-my-',
  '-mt-',
  '-mr-',
  '-mb-',
  '-ml-',
  '-ms-',
  '-me-',
  'absolute',
  'relative',
  'top-',
  'right-',
  'bottom-',
  'left-',
  'inset-',
  'z-',
];

interface PressableScaleProps extends Omit<PressableProps, 'style' | 'children'> {
  children?: React.ReactNode | ((state: PressableStateCallbackType) => React.ReactNode);
  /** Scale factor when pressed. Default 0.96 */
  scaleTo?: number;
  style?: PressableScaleStyle;
  className?: string;
  activeOpacity?: TouchableOpacityProps['activeOpacity'];
  pressDelayMs?: number;
}

function splitStyle(style: StyleProp<ViewStyle>) {
  const flat = StyleSheet.flatten(style) ?? {};
  const outer: Record<string, unknown> = {};
  const inner: Record<string, unknown> = {};

  for (const [key, val] of Object.entries(flat)) {
    (OUTER_STYLE_PROPS.has(key) ? outer : inner)[key] = val;
  }

  return { outer, inner };
}

function isOuterClassToken(token: string) {
  return (
    /^flex-(?:\d+|auto|initial|none)$/.test(token) ||
    OUTER_CLASS_PREFIXES.some((prefix) => token === prefix || token.startsWith(prefix))
  );
}

function splitClassName(className?: string) {
  if (!className) return { outerClassName: undefined, innerClassName: undefined };

  const outer: string[] = [];
  const inner: string[] = [];

  for (const token of className.split(/\s+/).filter(Boolean)) {
    (isOuterClassToken(token) ? outer : inner).push(token);
  }

  return {
    outerClassName: outer.length ? outer.join(' ') : undefined,
    innerClassName: inner.length ? inner.join(' ') : undefined,
  };
}

/**
 * Drop-in replacement for TouchableOpacity that scales down on press and
 * returns to its normal size on release.
 */
export function PressableScale({
  children,
  scaleTo = 0.96,
  style,
  className,
  disabled,
  onPress,
  onPressIn,
  onPressOut,
  activeOpacity: _activeOpacity,
  pressDelayMs = 0,
  ...props
}: PressableScaleProps) {
  const animatedScale = useRef(new Animated.Value(1)).current;
  const useNativeDriver = Platform.OS !== 'web';
  const pressTransform = { transform: [{ scale: disabled ? 1 : scaleTo }] };
  const isCallbackStyle = typeof style === 'function';
  const splitStaticStyle = isCallbackStyle ? null : splitStyle(style);
  const { outerClassName, innerClassName } = isCallbackStyle
    ? { outerClassName: className, innerClassName: undefined }
    : splitClassName(className);

  const handlePressIn = (e: PressableEvent) => {
    if (!isCallbackStyle) {
      Animated.spring(animatedScale, {
        toValue: disabled ? 1 : scaleTo,
        useNativeDriver,
        speed: 60,
        bounciness: 0,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: PressableEvent) => {
    if (!isCallbackStyle) {
      Animated.spring(animatedScale, {
        toValue: 1,
        useNativeDriver,
        speed: 40,
        bounciness: 5,
      }).start();
    }
    onPressOut?.(e);
  };

  const handlePress: PressableProps['onPress'] = (e) => {
    if (!onPress) return;
    if (pressDelayMs > 0) {
      setTimeout(() => onPress(e), pressDelayMs);
      return;
    }
    onPress(e);
  };

  return (
    <Pressable
      className={outerClassName}
      style={
        isCallbackStyle
          ? (state) => [style(state), WEB_PRESS_TRANSITION, state.pressed ? pressTransform : null]
          : (splitStaticStyle?.outer as ViewStyle)
      }
      disabled={disabled}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {isCallbackStyle ? (
        children
      ) : (
        <Animated.View style={[WEB_PRESS_TRANSITION, { transform: [{ scale: animatedScale }] }]}>
          <View className={innerClassName} style={splitStaticStyle?.inner as ViewStyle}>
            {typeof children === 'function'
              ? children({ pressed: false } as PressableStateCallbackType)
              : children}
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}
