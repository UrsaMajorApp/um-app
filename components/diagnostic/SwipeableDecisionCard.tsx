// SwipeableDecisionCard: добавляет жесты свайпа и анимацию принятия решения для диагностики.
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  DIAGNOSTIC_SWIPE_EXIT_DISTANCE,
  DIAGNOSTIC_SWIPE_THRESHOLD,
  DIAGNOSTIC_SWIPE_VELOCITY,
} from '$constants/diagnosticUi';
import type { SwipeRenderArgs } from '$types/diagnostic';

interface Props {
  cardKey: string;
  children: (args: SwipeRenderArgs) => React.ReactNode;
  dislikeLabel?: string;
  likeLabel?: string;
  onSwipe: (liked: boolean) => void;
}

export default function SwipeableDecisionCard({
  cardKey,
  children,
  dislikeLabel = 'NOPE',
  likeLabel = 'LIKE',
  onSwipe,
}: Props) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const hasSwiped = useSharedValue(false);
  const [isLeaving, setIsLeaving] = React.useState(false);

  React.useEffect(() => {
    void cardKey;
    translateX.value = 0;
    translateY.value = 0;
    hasSwiped.value = false;
    setIsLeaving(false);
  }, [cardKey, hasSwiped, translateX, translateY]);

  const swipe = React.useCallback(
    (liked: boolean) => {
      if (hasSwiped.value) return;

      hasSwiped.value = true;
      setIsLeaving(true);

      const direction = liked ? 1 : -1;
      translateX.value = withTiming(
        direction * DIAGNOSTIC_SWIPE_EXIT_DISTANCE,
        { duration: 240 },
        (finished) => {
          if (finished) {
            runOnJS(onSwipe)(liked);
          }
        },
      );
      translateY.value = withTiming(-28, { duration: 240 });
    },
    [hasSwiped, onSwipe, translateX, translateY],
  );

  const panGesture = React.useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onUpdate((event) => {
          if (hasSwiped.value) return;

          translateX.value = event.translationX;
          translateY.value = event.translationY;
        })
        .onEnd((event) => {
          if (hasSwiped.value) return;

          const shouldSwipe =
            Math.abs(event.translationX) > DIAGNOSTIC_SWIPE_THRESHOLD ||
            Math.abs(event.velocityX) > DIAGNOSTIC_SWIPE_VELOCITY;

          if (shouldSwipe) {
            const liked = event.translationX > 0 || event.velocityX > 0;
            const direction = liked ? 1 : -1;

            hasSwiped.value = true;
            runOnJS(setIsLeaving)(true);

            translateX.value = withTiming(
              direction * DIAGNOSTIC_SWIPE_EXIT_DISTANCE,
              { duration: 240 },
              (finished) => {
                if (finished) {
                  runOnJS(onSwipe)(liked);
                }
              },
            );
            translateY.value = withTiming(event.translationY, {
              duration: 240,
            });
          } else {
            translateX.value = withSpring(0, { damping: 16, stiffness: 180 });
            translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
          }
        }),
    [hasSwiped, onSwipe, translateX, translateY],
  );

  const cardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-220, 0, 220], [-10, 0, 10], Extrapolation.CLAMP);
    const scale = interpolate(
      Math.abs(translateX.value),
      [0, DIAGNOSTIC_SWIPE_THRESHOLD],
      [1, 0.97],
      Extrapolation.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotate}deg` },
        { scale },
      ],
    };
  });

  const likeBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [20, DIAGNOSTIC_SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotateZ: '-8deg' }],
  }));

  const dislikeBadgeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-DIAGNOSTIC_SWIPE_THRESHOLD, -20],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ rotateZ: '8deg' }],
  }));

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, cardStyle]}>
        <Animated.Text style={[styles.badge, styles.likeBadge, likeBadgeStyle]}>
          {likeLabel}
        </Animated.Text>
        <Animated.Text style={[styles.badge, styles.dislikeBadge, dislikeBadgeStyle]}>
          {dislikeLabel}
        </Animated.Text>
        <View pointerEvents={isLeaving ? 'none' : 'auto'} style={styles.content}>
          {children({ isLeaving, swipe })}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  content: {
    width: '100%',
  },
  badge: {
    position: 'absolute',
    top: 34,
    zIndex: 10,
    borderWidth: 4,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1,
    overflow: 'hidden',
  },
  likeBadge: {
    left: 26,
    borderColor: '#34C759',
    color: '#34C759',
  },
  dislikeBadge: {
    right: 26,
    borderColor: '#FF3B30',
    color: '#FF3B30',
  },
});
