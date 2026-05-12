// ScreenHeader: компактный заголовок раздела с subtitle и правой зоной действий.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS } from '$constants/theme';

interface ScreenHeaderProps {
  title: string;
  onBack?: () => void;
  horizontalPadding: number;
  maxWidth?: number;
  withSafeArea?: boolean;
  variant?: 'gradient' | 'surface';
  rightSlot?: React.ReactNode;
}

export default function ScreenHeader({
  title,
  onBack,
  horizontalPadding,
  maxWidth,
  withSafeArea = true,
  variant = 'gradient',
  rightSlot,
}: ScreenHeaderProps) {
  const isSurface = variant === 'surface';

  const content = (
    <View
      style={{
        width: '100%',
        maxWidth,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 52,
        paddingHorizontal: horizontalPadding,
        paddingTop: 6,
        paddingBottom: 6,
      }}
    >
      {onBack ? (
        <Pressable
          onPress={onBack}
          style={{
            width: 42,
            height: 42,
            borderRadius: isSurface ? 21 : 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isSurface ? COLORS.muted : 'rgba(255,255,255,0.16)',
            marginRight: 10,
          }}
        >
          <Feather
            name="arrow-left"
            size={isSurface ? 26 : 22}
            color={isSurface ? COLORS.foreground : 'white'}
          />
        </Pressable>
      ) : null}
      <Text
        style={{
          flex: 1,
          fontSize: 18,
          fontWeight: '800',
          color: isSurface ? COLORS.foreground : 'white',
        }}
      >
        {title}
      </Text>

      {rightSlot}
    </View>
  );

  if (isSurface) {
    const surfaceContent = withSafeArea ? (
      <SafeAreaView edges={['top']}>{content}</SafeAreaView>
    ) : (
      content
    );

    return (
      <View
        style={{
          backgroundColor: COLORS.card,
          borderBottomWidth: 1,
          borderBottomColor: COLORS.border,
        }}
      >
        {surfaceContent}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={COLORS.gradients.header}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        paddingBottom: 8,
        borderBottomLeftRadius: RADIUS.xl,
        borderBottomRightRadius: RADIUS.xl,
      }}
    >
      {withSafeArea ? <SafeAreaView edges={['top']}>{content}</SafeAreaView> : content}
    </LinearGradient>
  );
}
