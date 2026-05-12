// Экран youth/games: загружает и показывает мини-игры в кабинете ребенка/подростка.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GAMES, getDailyChallenge } from '$constants/games';
import { COLORS, LAYOUT, SHADOWS } from '$constants/theme';
import { useYouthGameIq } from '$hooks/useYouthGameIq';
import { appHref } from '$lib/router';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { GameId } from '$types/games';

export default function GamesLobby() {
  const router = useRouter();
  const { totalIq, loading: iqLoading } = useYouthGameIq();
  const [dailyChallenge, setDailyChallenge] = useState(() => getDailyChallenge());
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);
  const lobbyContentWidth = isDesktop
    ? Math.min(width - LAYOUT.sideNavWidth - paddingX * 2, LAYOUT.dashboardMaxWidth)
    : width - paddingX * 2;
  const cardWidth = isDesktop
    ? Math.min(Math.max((lobbyContentWidth - 48) / 4, 220), 280)
    : (width - 64) / 2;

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleDailyRefresh = () => {
      const now = new Date();
      const nextLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const delay = Math.max(1000, nextLocalMidnight.getTime() - now.getTime() + 1000);

      timeoutId = setTimeout(() => {
        setDailyChallenge(getDailyChallenge());
        scheduleDailyRefresh();
      }, delay);
    };

    scheduleDailyRefresh();

    return () => clearTimeout(timeoutId);
  }, []);

  const openGame = (gameId: GameId) => {
    router.push(appHref(`/youth/games/${gameId}`));
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ backgroundColor: COLORS.primary, overflow: 'hidden' }}>
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
                paddingBottom: 32,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <View>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: 13,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  >
                    Игровой Центр
                  </Text>
                  <Text style={{ color: 'white', fontSize: 24, fontWeight: '900' }}>
                    Развивайся играя
                  </Text>
                </View>
                {!iqLoading && (
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ color: 'white', fontWeight: '900' }}>{totalIq} IQ</Text>
                  </View>
                )}
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 24,
          paddingBottom: 100,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isDesktop ? LAYOUT.dashboardMaxWidth : undefined,
          }}
        >
          {/* Daily Challenge Card */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={`Открыть челлендж дня: ${dailyChallenge.title}`}
            activeOpacity={0.88}
            onPress={() => openGame(dailyChallenge.gameId)}
            style={{ marginBottom: 32 }}
          >
            <LinearGradient
              colors={dailyChallenge.colors}
              style={{
                padding: isDesktop ? 28 : 24,
                borderRadius: isDesktop ? 24 : 32,
                ...SHADOWS.md,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 20,
                }}
              >
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      backgroundColor: dailyChallenge.accentColor,
                      alignSelf: 'flex-start',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: 'white',
                        fontSize: 10,
                        fontWeight: '900',
                      }}
                    >
                      ЧЕЛЛЕНДЖ ДНЯ
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: 'white',
                      fontSize: isDesktop ? 24 : 20,
                      fontWeight: '900',
                      marginBottom: 4,
                    }}
                  >
                    {dailyChallenge.title}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.58)', fontSize: 14 }}>
                    {dailyChallenge.prize}
                  </Text>
                </View>
                <View
                  style={{
                    width: 60,
                    height: 60,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather
                    name={dailyChallenge.icon}
                    size={32}
                    color={dailyChallenge.accentColor}
                  />
                </View>
              </View>
            </LinearGradient>
          </PressableScale>

          <Text
            style={{
              fontSize: 18,
              fontWeight: '900',
              color: COLORS.foreground,
              marginBottom: 20,
            }}
          >
            Тренажеры когнитивных навыков
          </Text>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: isDesktop ? 'flex-start' : 'space-between',
              gap: 16,
            }}
          >
            {GAMES.map((game) => (
              <PressableScale
                key={game.id}
                accessibilityRole="button"
                accessibilityLabel={`Открыть игру: ${game.title}`}
                onPress={() => !game.locked && openGame(game.id)}
                style={{
                  width: cardWidth,
                  minHeight: isDesktop ? 164 : undefined,
                  backgroundColor: 'white',
                  padding: 20,
                  borderRadius: isDesktop ? 24 : 32,
                  borderWidth: isDesktop ? 1 : 0,
                  borderColor: game.id === dailyChallenge.gameId ? game.color : COLORS.border,
                  ...SHADOWS.sm,
                  opacity: game.locked ? 0.7 : 1,
                }}
              >
                <View
                  style={{
                    width: 48,
                    height: 48,
                    backgroundColor: `${game.color}10`,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <Feather name={game.icon} size={24} color={game.color} />
                </View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '900',
                    color: COLORS.foreground,
                    marginBottom: 4,
                  }}
                >
                  {game.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    marginBottom: 12,
                  }}
                >
                  {game.desc}
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: '800',
                      color: game.color,
                    }}
                  >
                    {game.points}
                  </Text>
                  {game.locked && <Feather name="lock" size={12} color={COLORS.mutedForeground} />}
                </View>
              </PressableScale>
            ))}
          </View>

          {/* Leaderboard Preview */}
          <View
            style={{
              marginTop: 40,
              backgroundColor: 'white',
              padding: 24,
              borderRadius: isDesktop ? 24 : 32,
              borderWidth: isDesktop ? 1 : 0,
              borderColor: COLORS.border,
              ...SHADOWS.sm,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '900',
                  color: COLORS.foreground,
                }}
              >
                Зал славы
              </Text>
            </View>
            <Text style={{ color: COLORS.mutedForeground, fontWeight: '600' }}>
              Рейтинг появится после публикации результатов игроков.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
