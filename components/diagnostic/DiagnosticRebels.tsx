/**
 * DiagnosticRebels.tsx
 * Main orchestrator for 12-14 Rebels diagnostic.
 */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useCallback, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import HackathonTask from '$components/diagnostic/rebels/HackathonTask';
import VibeSwipeCard from '$components/diagnostic/rebels/VibeSwipeCard';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useParentData } from '$contexts/ParentDataContext';
import { useDiagnosticEngine1214 } from '$hooks/useDiagnosticEngine1214';
import { useIsDesktop } from '$lib/useIsDesktop';

interface Props {
  childId?: string | null;
}

export default function DiagnosticRebels({ childId }: Props) {
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

  const engine = useDiagnosticEngine1214({
    childId: engineChildId,
    userId: user?.id || 'unknown',
    isPro,
    onComplete: async (diagnostic) => {
      if (targetChildId) await updateChildDiagnostic(targetChildId, diagnostic);
    },
  });

  useEffect(() => {
    if (engine.phase === 'done') {
      router.push({
        pathname: '/profile/youth/results',
        params: targetChildId ? { childId: targetChildId } : undefined,
      });
    }
  }, [engine.phase, router, targetChildId]);

  const handleSkip = useCallback(async () => {
    router.back();
  }, [router]);

  if (engine.isProcessing || engine.phase === 'processing') {
    return (
      <LinearGradient colors={['#0F0A2A', '#1A1040', '#2D1B69']} style={styles.fullScreen}>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" color="#A78BFA" />
          <Text style={styles.processingTitle}>Анализ данных...</Text>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (engine.phase === 'intro') {
    return (
      <LinearGradient colors={['#5B21B6', '#7C3AED', '#A78BFA']} style={styles.fullScreen}>
        <SafeAreaView style={styles.centered}>
          <Text style={{ fontSize: 80, marginBottom: 20 }}>🛹</Text>
          <Text style={styles.introTitle}>Привет!</Text>
          <Text style={styles.introSubtitle}>
            Узнай свои сильные стороны через{'\n'}быстрый Vibe Check 🔥
          </Text>
          <View style={{ width: '100%', paddingHorizontal: 32, marginTop: 40 }}>
            <TouchableOpacity onPress={engine.startBasic} style={styles.startBtn}>
              <Text style={styles.startBtnText}>Погнали</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} style={{ alignItems: 'center', marginTop: 20 }}>
              <Text style={styles.skipText}>Пропустить</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const isProPhase = engine.phase === 'pro';
  const progressPct = Math.round(engine.progress * 100);

  return (
    <View style={[styles.screen, isProPhase && styles.screenDark]}>
      <SafeAreaView edges={['top']} style={{ zIndex: 20 }}>
        <View style={[styles.header, { paddingHorizontal: hPad }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backBtn, isProPhase && styles.backBtnDark]}
          >
            <Feather name="arrow-left" size={20} color={isProPhase ? 'white' : COLORS.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isProPhase && { color: 'white' }]}>
            {isProPhase ? '💬 Hackathon Team' : '🔥 Vibe Check'}
          </Text>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={[styles.skipHeader, isProPhase && { color: 'rgba(255,255,255,0.5)' }]}>
              Скип
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

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

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: hPad,
          paddingTop: 16,
          paddingBottom: 80,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: isDesktop ? 560 : undefined }}>
          {engine.phase === 'basic' && engine.currentCard && (
            <VibeSwipeCard
              card={engine.currentCard}
              index={engine.currentIndex}
              total={engine.totalBasicCards}
              onSwipe={engine.handleVibeSwipe}
            />
          )}
          {engine.phase === 'pro' && engine.currentTask && (
            <HackathonTask
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
  headerTitle: { fontSize: 18, fontWeight: '900', color: COLORS.foreground },
  skipHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.mutedForeground,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.muted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressTrackDark: { backgroundColor: 'rgba(255,255,255,0.1)' },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  progressFillPro: { backgroundColor: '#A78BFA' },
  introTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
  },
  introSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  startBtn: {
    backgroundColor: 'white',
    paddingVertical: 20,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  startBtnText: { fontSize: 18, fontWeight: '900', color: '#7C3AED' },
  skipText: { color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: '600' },
  processingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 20,
  },
});
