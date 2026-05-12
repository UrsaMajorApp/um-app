// DiagnosticCreators: собирает creator-диагностику с творческими заданиями и карточками.
/**
 * DiagnosticCreators.tsx
 *
 * Main screen for the 9–11 "Creators" diagnostic module.
 *
 * Phases:
 *   intro  → Intro screen (violet gradient)
 *   basic  → 12 WYR cards (light theme, timer)
 *   pro    → 30 RPG quest tasks (dark theme, messenger UI)
 *   processing → Loading spinner
 *   done   → navigates to /profile/youth/results
 */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import NovellaTask from '$components/diagnostic/creators/NovellaTask';
import WYRCard from '$components/diagnostic/creators/WYRCard';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { useDiagnosticEngine911 } from '$hooks/useDiagnosticEngine911';
import { useIsDesktop } from '$lib/useIsDesktop';

interface Props {
  childId?: string | null;
}

export default function DiagnosticCreators({ childId }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { activeChildId, updateChildDiagnostic, parentProfile } = useParentData();
  const isDesktop = useIsDesktop();
  const hPad = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const isPro = parentProfile?.tariff === 'pro';
  const targetChildId = childId || activeChildId;
  const engineChildId = targetChildId || user?.id || 'unknown';

  const engine = useDiagnosticEngine911({
    childId: engineChildId,
    userId: user?.id || 'unknown',
    isPro,
    onComplete: async (diagnostic) => {
      if (targetChildId) {
        await updateChildDiagnostic(targetChildId, diagnostic);
      }
    },
  });

  // Navigate when done
  useEffect(() => {
    if (engine.phase === 'done') {
      router.push({
        pathname: '/profile/youth/results',
        params: targetChildId ? { childId: targetChildId } : undefined,
      });
    }
  }, [engine.phase, router, targetChildId]);

  // ── Skip handler ─────────────────────────────────────────────────────────

  const handleSkip = useCallback(async () => {
    router.back();
  }, [router]);

  // ── Render: Processing ───────────────────────────────────────────────────

  if (engine.isProcessing || engine.phase === 'processing') {
    return (
      <LinearGradient colors={['#0F0A2A', '#1A1040', '#2D1B69']} style={styles.fullScreen}>
        <SafeAreaView style={styles.centered}>
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'timing', duration: 600, loop: true }}
          >
            <Text style={{ fontSize: 64 }}>🔬</Text>
          </MotiView>
          <ActivityIndicator size="large" color="#A78BFA" style={{ marginTop: 24 }} />
          <Text style={styles.processingTitle}>ИИ анализирует ответы...</Text>
          <Text style={styles.processingSubtitle}>Создаём персональный профиль{'\n'}«Творца»</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Render: Intro ────────────────────────────────────────────────────────

  if (engine.phase === 'intro') {
    return (
      <LinearGradient colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.fullScreen}>
        <SafeAreaView style={styles.centered}>
          <MotiView
            from={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 600 }}
          >
            <Text style={{ fontSize: 96 }}>🧠</Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 300, duration: 500 }}
          >
            <Text style={styles.introTitle}>Привет, Творец!</Text>
            <Text style={styles.introSubtitle}>
              Узнай свои суперспособности{'\n'}за несколько минут 🚀
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 700, duration: 400 }}
            style={{ width: '100%', paddingHorizontal: 32, marginTop: 48 }}
          >
            {/* Steps preview */}
            <View style={styles.stepsPreview}>
              <View style={styles.stepItem}>
                <Text style={styles.stepItemNum}>①</Text>
                <Text style={styles.stepItemText}>12 быстрых выборов</Text>
              </View>
              {isPro && (
                <View style={styles.stepItem}>
                  <Text style={styles.stepItemNum}>②</Text>
                  <Text style={styles.stepItemText}>Квест «Тайна Лаборатории»</Text>
                </View>
              )}
            </View>

            <PressableScale
              onPress={engine.startBasic}
              activeOpacity={0.8}
              style={styles.startButton}
            >
              <Text style={styles.startButtonText}>Начать! ⚡</Text>
            </PressableScale>

            <PressableScale onPress={handleSkip} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.skipText}>Пропустить</Text>
            </PressableScale>
          </MotiView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // ── Render: Basic / Pro ──────────────────────────────────────────────────

  const isProPhase = engine.phase === 'pro';
  const progressPct = Math.round(engine.progress * 100);

  return (
    <View style={[styles.screen, isProPhase && styles.screenDark]}>
      {/* Background decorations */}
      {!isProPhase && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.blob1} />
          <View style={styles.blob2} />
        </View>
      )}
      {isProPhase && (
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.blobDark1} />
          <View style={styles.blobDark2} />
        </View>
      )}

      {/* Header */}
      <SafeAreaView edges={['top']} style={{ zIndex: 20 }}>
        <View style={[styles.header, { paddingHorizontal: hPad }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PressableScale
              onPress={() => router.back()}
              style={[styles.backBtn, isProPhase && styles.backBtnDark]}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={isProPhase ? 'white' : COLORS.foreground}
              />
            </PressableScale>
            <Text style={[styles.headerTitle, isProPhase && { color: 'white' }]}>
              {isProPhase ? '🔬 Тайна Лаборатории 404' : '⚡ Что выберешь?'}
            </Text>
          </View>
          <PressableScale onPress={handleSkip}>
            <Text style={[styles.skipHeader, isProPhase && { color: 'rgba(255,255,255,0.5)' }]}>
              Пропустить
            </Text>
          </PressableScale>
        </View>
      </SafeAreaView>

      {/* Progress */}
      <View
        style={[
          styles.progressTrack,
          { marginHorizontal: hPad },
          isProPhase && styles.progressTrackDark,
        ]}
      >
        <MotiView
          animate={{ width: `${progressPct}%` }}
          transition={{ type: 'timing', duration: 300 }}
          style={[styles.progressFill, isProPhase && styles.progressFillPro]}
        />
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: hPad,
          paddingTop: 16,
          paddingBottom: 80,
          alignItems: 'center',
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: isDesktop ? 560 : undefined }}>
          {engine.phase === 'basic' && engine.currentCard && (
            <WYRCard
              card={engine.currentCard}
              index={engine.currentIndex}
              total={engine.totalBasicCards}
              onChoice={engine.handleWYRChoice}
            />
          )}

          {engine.phase === 'pro' && engine.currentTask && (
            <NovellaTask
              task={engine.currentTask}
              index={engine.currentIndex}
              total={engine.totalProTasks}
              onAnswer={engine.handleProAnswer}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenDark: { backgroundColor: '#0A0718' },

  // Background blobs
  blob1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: `${COLORS.primary}08`,
  },
  blob2: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: `${COLORS.secondary}06`,
  },
  blobDark1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
  blobDark2: {
    position: 'absolute',
    bottom: -40,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(167,139,250,0.07)',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    ...SHADOWS.sm,
  },
  backBtnDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.foreground,
    letterSpacing: -0.3,
  },
  skipHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mutedForeground,
  },

  // Progress bar
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.muted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressTrackDark: { backgroundColor: 'rgba(255,255,255,0.08)' },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressFillPro: { backgroundColor: '#A78BFA' },

  // Intro
  introTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginTop: 24,
    letterSpacing: -0.5,
  },
  introSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '600',
    lineHeight: 25,
  },
  stepsPreview: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.lg,
    padding: 16,
    gap: 10,
    marginBottom: 28,
  },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepItemNum: { fontSize: 20 },
  stepItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  startButton: {
    backgroundColor: 'white',
    paddingVertical: 22,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  startButtonText: { fontSize: 22, fontWeight: '900', color: '#7C3AED' },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: '600' },

  // Processing
  processingTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 28,
    textAlign: 'center',
  },
  processingSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
});
