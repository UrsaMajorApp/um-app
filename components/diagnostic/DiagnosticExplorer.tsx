import { useIsDesktop } from "../../lib/useIsDesktop";
/**
 * DiagnosticExplorer.tsx
 *
 * Main screen for the 6–8 "Explorers" diagnostic module.
 * Phases: Intro → Basic (swipes) → Pro (quest, if PRO) → Processing → Done
 */
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useCallback, useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, SHADOWS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useParentData } from "../../contexts/ParentDataContext";
import { useDiagnosticEngine } from "../../hooks/useDiagnosticEngine";
import { useSpeech } from "../../hooks/useSpeech";
import BasicSwipeCard from "./BasicSwipeCard";
import ProQuestTask from "./ProQuestTask";

interface Props {
  childId?: string | null;
}

export default function DiagnosticExplorer({ childId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const {
    childrenProfile,
    activeChildId,
    updateChildDiagnostic,
    parentProfile,
  } = useParentData();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const isPro = parentProfile?.tariff === "pro";
  const { speak, stop: stopSpeech } = useSpeech();
  const targetChildId = childId || activeChildId;
  const engineChildId = targetChildId || user?.id || "unknown";

  const engine = useDiagnosticEngine({
    childId: engineChildId,
    userId: user?.id || "unknown",
    isPro,
    onComplete: async (diagnostic) => {
      if (targetChildId) {
        await updateChildDiagnostic(targetChildId, diagnostic);
      }
    },
  });

  // ── Auto-speak question when card/task changes ──────────────────────

  useEffect(() => {
    if (engine.phase === "basic" && engine.currentCard) {
      speak(engine.currentCard.audioQuestion);
    }
  }, [engine.phase, engine.currentCard?.id]);

  useEffect(() => {
    if (engine.phase === "pro" && engine.currentTask) {
      speak(engine.currentTask.audioQuestion);
      engine.markTaskEntry();
    }
  }, [engine.phase, engine.currentTask?.id]);

  // Navigate to results when done
  useEffect(() => {
    if (engine.phase === "done") {
      router.push({
        pathname: "/profile/youth/results",
        params: targetChildId ? { childId: targetChildId } : undefined,
      } as any);
    }
  }, [engine.phase, router, targetChildId]);

  // Cleanup speech on unmount
  useEffect(() => () => stopSpeech(), []);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleSkip = useCallback(async () => {
    stopSpeech();
    router.back();
  }, [stopSpeech, router]);

  const handleLike = useCallback(() => {
    stopSpeech();
    engine.handleSwipe(true);
  }, [engine.handleSwipe]);

  const handleDislike = useCallback(() => {
    stopSpeech();
    engine.handleSwipe(false);
  }, [engine.handleSwipe]);

  const handleProAnswer = useCallback(
    (optionId: number) => {
      stopSpeech();
      engine.handleProAnswer(optionId);
    },
    [engine.handleProAnswer],
  );

  // ── Render: Processing ───────────────────────────────────────────────

  if (engine.isProcessing || engine.phase === "processing") {
    return (
      <LinearGradient
        colors={["#1A1040", "#2D1B69", "#6C5CE7"]}
        style={styles.fullScreen}
      >
        <SafeAreaView style={styles.centered}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "timing", duration: 600, loop: true }}
          >
            <Text style={{ fontSize: 64 }}>🚀</Text>
          </MotiView>
          <ActivityIndicator
            size="large"
            color="white"
            style={{ marginTop: 24 }}
          />
          <Text style={styles.processingTitle}>ИИ анализирует ответы...</Text>
          <Text style={styles.processingSubtitle}>
            Создаём персональный профиль талантов
          </Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Render: Intro ────────────────────────────────────────────────────

  if (engine.phase === "intro") {
    return (
      <LinearGradient
        colors={["#6C5CE7", "#AF52DE", "#8B7FE8"]}
        style={styles.fullScreen}
      >
        <SafeAreaView style={styles.centered}>
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 600 }}
          >
            <Text style={{ fontSize: 100 }}>🤖</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
          >
            <Text style={styles.introTitle}>Привет, исследователь!</Text>
            <Text style={styles.introSubtitle}>
              Давай узнаем, какие у тебя{"\n"}суперспособности! 🌟
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 600, duration: 400 }}
            style={{ width: "100%", paddingHorizontal: 32, marginTop: 48 }}
          >
            <TouchableOpacity
              onPress={() => {
                speak("Давай узнаем, что тебе нравится!");
                engine.startBasic();
              }}
              activeOpacity={0.8}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Начать! 🎮</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSkip}
              style={{ alignItems: "center", marginTop: 20 }}
            >
              <Text style={styles.skipText}>Пропустить</Text>
            </TouchableOpacity>
          </MotiView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Render: Basic / Pro phases ──────────────────────────────────────

  const progressPercent = Math.round(engine.progress * 100);
  const isProPhase = engine.phase === "pro";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isProPhase ? "#0F0A2A" : COLORS.background,
      }}
    >
      {/* Background decorations */}
      {!isProPhase && (
        <View style={StyleSheet.absoluteFill}>
          <View
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              borderRadius: 200,
              backgroundColor: `${COLORS.primary}08`,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: -50,
              left: -80,
              width: 300,
              height: 300,
              borderRadius: 150,
              backgroundColor: `${COLORS.secondary}06`,
            }}
          />
        </View>
      )}

      {/* Header */}
      <SafeAreaView edges={["top"]} style={{ zIndex: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: horizontalPadding,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => {
                stopSpeech();
                router.back();
              }}
              style={[styles.backButton, isProPhase && styles.backButtonDark]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={isProPhase ? "white" : COLORS.foreground}
              />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, isProPhase && { color: "white" }]}
            >
              {isProPhase ? "Космический квест 🚀" : "Что тебе нравится?"}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSkip}>
            <Text
              style={[
                styles.skipTextHeader,
                isProPhase && { color: "rgba(255,255,255,0.6)" },
              ]}
            >
              Пропустить
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Progress bar */}
      <View
        style={[
          styles.progressContainer,
          { marginHorizontal: horizontalPadding },
          isProPhase && { backgroundColor: "rgba(255,255,255,0.1)" },
        ]}
      >
        <MotiView
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "timing", duration: 300 }}
          style={[
            styles.progressFill,
            isProPhase && { backgroundColor: "#A78BFA" },
          ]}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 20,
          paddingBottom: 60,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? 520 : undefined,
          }}
        >
          {engine.phase === "basic" && engine.currentCard && (
            <BasicSwipeCard
              card={engine.currentCard}
              index={engine.currentIndex}
              total={engine.totalBasicCards}
              onLike={handleLike}
              onDislike={handleDislike}
            />
          )}

          {engine.phase === "pro" && engine.currentTask && (
            <ProQuestTask
              task={engine.currentTask}
              index={engine.currentIndex}
              total={engine.totalProTasks}
              onAnswer={handleProAnswer}
            />
          )}
        </View>
      </ScrollView>

      {/* Replay audio FAB */}
      <TouchableOpacity
        onPress={() => {
          const text =
            engine.phase === "basic"
              ? engine.currentCard?.audioQuestion
              : engine.currentTask?.audioQuestion;
          if (text) speak(text);
        }}
        style={[styles.audioFab, isProPhase && styles.audioFabDark]}
        activeOpacity={0.7}
      >
        <Feather
          name="volume-2"
          size={22}
          color={isProPhase ? "white" : COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  introTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "white",
    textAlign: "center",
    marginTop: 24,
    letterSpacing: -0.5,
  },
  introSubtitle: {
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 10,
    fontWeight: "600",
    lineHeight: 26,
  },
  startButton: {
    backgroundColor: "white",
    paddingVertical: 22,
    borderRadius: 28,
    alignItems: "center",
    ...SHADOWS.lg,
  },
  startButtonText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#6C5CE7",
  },
  skipText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontWeight: "600",
  },
  skipTextHeader: {
    color: COLORS.mutedForeground,
    fontSize: 14,
    fontWeight: "600",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    ...SHADOWS.sm,
  },
  backButtonDark: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.foreground,
    letterSpacing: -0.5,
  },
  progressContainer: {
    height: 8,
    backgroundColor: COLORS.muted,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  processingTitle: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 28,
    textAlign: "center",
  },
  processingSubtitle: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  audioFab: {
    position: "absolute",
    bottom: 40,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
    zIndex: 100,
  },
  audioFabDark: {
    backgroundColor: "rgba(167,139,250,0.3)",
  },
});
