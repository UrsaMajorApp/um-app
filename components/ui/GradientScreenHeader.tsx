// GradientScreenHeader: декоративный заголовок экрана с градиентом и крупным title.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { Platform, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '$constants/theme';

export function GradientScreenHeader({
  title,
  subtitle,
  paddingX,
  onBack,
  rightAccessory,
  children,
  variant = 'detail',
}: {
  title: string;
  subtitle?: string | null;
  paddingX: number;
  onBack?: () => void;
  rightAccessory?: ReactNode;
  children?: ReactNode;
  variant?: 'detail' | 'dashboard';
}) {
  const isDashboard = variant === 'dashboard';

  if (isDashboard) {
    return (
      <View
        style={{
          backgroundColor: COLORS.primary,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === 'ios' ? 0 : 20 }}
        >
          <SafeAreaView edges={['top']}>
            <View
              style={{
                paddingHorizontal: paddingX,
                paddingTop: 12,
                paddingBottom: children ? 24 : 32,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xxxl,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.white,
                      letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                    }}
                  >
                    {title}
                  </Text>
                  {subtitle ? (
                    <Text
                      style={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: 13,
                        fontWeight: '500',
                        marginTop: 4,
                      }}
                    >
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
                {rightAccessory}
              </View>
              {children ? <View style={{ marginTop: 18 }}>{children}</View> : null}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View
      style={{
        backgroundColor: COLORS.primary,
        borderBottomLeftRadius: RADIUS.xxl,
        borderBottomRightRadius: RADIUS.xxl,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={COLORS.gradients.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingBottom: SPACING.xl }}
      >
        <SafeAreaView edges={['top']}>
          <View style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {onBack ? (
                <PressableScale
                  onPress={onBack}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: SPACING.md,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </PressableScale>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: 'white',
                  }}
                >
                  {title}
                </Text>
                {subtitle ? (
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 13,
                      fontWeight: '500',
                      marginTop: 4,
                    }}
                  >
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              {rightAccessory}
            </View>
            {children ? <View style={{ marginTop: SPACING.md }}>{children}</View> : null}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
