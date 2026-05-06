import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";
import Game2048 from "$components/games/Game2048";
import { getGameById } from "$components/games/gameCatalog";
import MemoryGame from "$components/games/MemoryGame";
import Minesweeper from "$components/games/Minesweeper";
import Sudoku from "$components/games/Sudoku";
import { COLORS, SHADOWS } from "$constants/theme";
import { useYouthGameIq } from "$hooks/useYouthGameIq";
import { useIsDesktop } from "$lib/useIsDesktop";

export default function YouthGamePage() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { recordGameResult } = useYouthGameIq();
  const [earnedPoints, setEarnedPoints] = useState<number | null>(null);

  const game = useMemo(() => getGameById(id), [id]);
  const isDesktop = useIsDesktop();
  const gameShellMaxWidth =
    game?.id === "minesweeper"
      ? 720
      : game?.id === "sudoku" || game?.id === "memory"
        ? 660
        : 620;

  const goBack = () => {
    router.replace("/youth/games" as any);
  };

  const handleFinishGame = async (gameScore: number) => {
    if (!game) return;

    setEarnedPoints(game.iqReward);
    await recordGameResult({
      gameId: game.id,
      iqPoints: game.iqReward,
      gameScore,
    });
  };

  const gameContent =
    game?.id === "memory" ? (
      <MemoryGame onFinish={handleFinishGame} />
    ) : game?.id === "2048" ? (
      <Game2048 onFinish={handleFinishGame} />
    ) : game?.id === "minesweeper" ? (
      <Minesweeper onFinish={handleFinishGame} />
    ) : game?.id === "sudoku" ? (
      <Sudoku onFinish={handleFinishGame} />
    ) : null;

  if (!game) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "900",
            color: COLORS.foreground,
            marginBottom: 8,
          }}
        >
          Игра не найдена
        </Text>
        <Text
          style={{
            color: COLORS.mutedForeground,
            fontWeight: "600",
            marginBottom: 20,
          }}
        >
          Вернись в игровой центр и выбери тренажер.
        </Text>
        <TouchableOpacity
          onPress={goBack}
          style={{
            backgroundColor: COLORS.primary,
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "white", fontWeight: "900" }}>К играм</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <GestureHandlerRootView
      style={{
        flex: 1,
        backgroundColor: isDesktop ? "#F8FAFC" : COLORS.background,
      }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={{
            alignItems: "center",
            paddingHorizontal: isDesktop ? 40 : 0,
            paddingTop: Platform.OS === "android" ? 20 : 0,
            paddingBottom: isDesktop ? 48 : 0,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: "100%", maxWidth: gameShellMaxWidth }}>
            <View
              style={{
                paddingHorizontal: isDesktop ? 0 : 24,
                paddingVertical: isDesktop ? 20 : 24,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Вернуться к играм"
                onPress={goBack}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: "white",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  ...SHADOWS.sm,
                }}
              >
                <Feather
                  name="chevron-left"
                  size={28}
                  color={COLORS.foreground}
                />
              </TouchableOpacity>
              <View style={{ alignItems: "center", flex: 1 }}>
                <Text
                  style={{
                    fontSize: 22,
                    fontWeight: "900",
                    color: COLORS.foreground,
                  }}
                >
                  {game.title}
                </Text>
                {earnedPoints !== null && (
                  <Text
                    style={{
                      color: COLORS.success,
                      fontSize: 12,
                      fontWeight: "900",
                      marginTop: 4,
                    }}
                  >
                    +{earnedPoints} IQ
                  </Text>
                )}
              </View>
              <View style={{ width: 44 }} />
            </View>
            <View
              style={{
                width: "100%",
                backgroundColor: isDesktop ? "white" : COLORS.background,
                borderRadius: isDesktop ? 28 : 0,
                borderWidth: isDesktop ? 1 : 0,
                borderColor: COLORS.border,
                ...SHADOWS.sm,
              }}
            >
              {gameContent}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
