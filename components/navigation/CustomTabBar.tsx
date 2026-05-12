// CustomTabBar: рисует нижнюю навигацию и фильтрует вкладки по роли пользователя.
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSegments } from 'expo-router';
import { MotiView } from 'moti';
import { Platform, Text, useWindowDimensions, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { useTabNav } from '$hooks/useTabNav';
import type { Role } from '$constants/navigation/tabItems';
import { COLORS, LAYOUT, SHADOWS } from '$constants/theme';
import { useIsDesktop } from '$lib/useIsDesktop';

interface CustomTabBarProps {
  role: Role | string | null;
}

export default function CustomTabBar({ role }: CustomTabBarProps) {
  const { tabs, go, isActive } = useTabNav(role);
  const { width } = useWindowDimensions();
  const segments = useSegments() as string[];

  const isDesktop = useIsDesktop();

  const isClubDetail =
    segments.includes('club') && segments.some((s) => s === '[id]' || s.startsWith('club-'));

  if (isClubDetail && !isDesktop) return null;

  const numTabs = tabs.length;
  const padding = 12;
  const safeAreaBottom = Platform.OS === 'ios' ? 24 : 12;

  const containerWidth = isDesktop ? Math.min(width, LAYOUT.dashboardMaxWidth) : width;
  const usableWidth = containerWidth - padding * 2;
  const tabWidth = usableWidth / numTabs;

  const activeIndex = tabs.findIndex((t) => isActive(t.route));

  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          ...SHADOWS.lg,
          width: containerWidth,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          backgroundColor: 'transparent',
        }}
      >
        <BlurView
          intensity={90}
          tint="light"
          style={{
            width: '100%',
            height: 76 + safeAreaBottom,
            flexDirection: 'row',
            alignItems: 'flex-start',
            paddingTop: 12,
            paddingHorizontal: padding,
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.8)',
            borderBottomWidth: 0,
            overflow: 'hidden',
            backgroundColor: 'rgba(0, 0, 0, 0.08)',
          }}
        >
          {activeIndex >= 0 && !isDesktop && (
            <MotiView
              animate={{
                translateX: activeIndex * tabWidth,
              }}
              transition={{
                type: 'spring',
                damping: 26,
                stiffness: 350,
                mass: 0.8,
              }}
              style={{
                position: 'absolute',
                left: padding,
                top: 12,
                height: 54,
                width: tabWidth,
                borderRadius: 27,
                overflow: 'hidden',
                boxShadow: '0px 4px 12px rgba(108, 92, 231, 0.4)',
              }}
            >
              <MotiView
                animate={{
                  translateX: -activeIndex * tabWidth - 20,
                }}
                transition={{
                  type: 'spring',
                  damping: 26,
                  stiffness: 350,
                  mass: 0.8,
                }}
                style={{
                  width: usableWidth + 40,
                  height: '120%',
                  top: '-10%',
                }}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED', '#C026D3']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1 }}
                />
              </MotiView>
            </MotiView>
          )}

          {tabs.map((item) => {
            const active = isActive(item.route);
            return (
              <PressableScale
                key={item.key}
                onPress={() => go(item.route)}
                style={{
                  width: isDesktop ? 'auto' : tabWidth,
                  flex: isDesktop ? 1 : undefined,
                  height: 54,
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1,
                }}
              >
                {item.icon({
                  color: active ? COLORS.white : COLORS.mutedForeground,
                  size: active ? 28 : 24,
                })}
                {isDesktop && (
                  <Text
                    style={{
                      fontSize: 10,
                      color: active ? COLORS.primary : COLORS.mutedForeground,
                      marginTop: 4,
                      fontWeight: active ? '600' : '400',
                    }}
                  >
                    {item.label}
                  </Text>
                )}
              </PressableScale>
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}
