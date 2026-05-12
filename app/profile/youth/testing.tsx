// Экран профиля youth: запускает диагностический тест для роли ребенка/подростка.
/**
 * testing.tsx — Age-based router for diagnostic modules.
 *
 * Routes:
 *   6–8 years  → DiagnosticExplorer (new module)
 *   9–11 years → legacy CHILD_QUESTIONS
 *   12–17      → legacy YOUTH_QUESTIONS
 *
 * Falls back to devYouthAge only when no child profile is available.
 */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import DiagnosticArchitects from '$components/diagnostic/DiagnosticArchitects';
import DiagnosticCreators from '$components/diagnostic/DiagnosticCreators';
import DiagnosticExplorer from '$components/diagnostic/DiagnosticExplorer';
import DiagnosticRebels from '$components/diagnostic/DiagnosticRebels';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import type { AuthUser } from '$contexts/AuthContext';
import { useAuth } from '$contexts/AuthContext';
import { useDevSettings } from '$contexts/DevSettingsContext';
import { useParentData } from '$contexts/ParentDataContext';
import { type OnboardingQuestion, useOnboardingQuestions } from '$hooks/usePlatformData';
import { generateGeminiDiagnosticJson, isGeminiFallbackError } from '$lib/geminiDiagnostics';
import { useIsDesktop } from '$lib/useIsDesktop';
import type { Diagnostic, DiagnosticAiResponse } from '$types/diagnostic';
import type { AppRouter } from '$types/router';

/* ─────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────── */

export default function YouthTesting() {
  const router = useRouter();
  const { childId, age } = useLocalSearchParams<{
    childId?: string | string[];
    age?: string | string[];
  }>();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const { user, devMode } = useAuth();
  const { childrenProfile, activeChildId, setActiveChildId, updateChildDiagnostic } =
    useParentData();
  const { devYouthAge } = useDevSettings();
  const { questions: fallbackQuestions, loading: fallbackLoading } =
    useOnboardingQuestions('youth');

  const requestedChildId = Array.isArray(childId) ? childId[0] : childId;
  const requestedAge = Number.parseInt(Array.isArray(age) ? (age[0] ?? '') : (age ?? ''), 10);
  const targetChild =
    childrenProfile.find((c) => c.id === requestedChildId) ||
    childrenProfile.find((c) => c.id === activeChildId) ||
    childrenProfile[0];
  const targetChildId = targetChild?.id || activeChildId;
  const fallbackAge = Number.isFinite(requestedAge) ? requestedAge : devMode ? devYouthAge : 10;
  const childAge = targetChild?.age ?? fallbackAge;

  useEffect(() => {
    if (targetChild?.id && targetChild.id !== activeChildId) {
      setActiveChildId(targetChild.id);
    }
  }, [activeChildId, setActiveChildId, targetChild?.id]);

  if (childAge >= 6 && childAge <= 8) return <DiagnosticExplorer childId={targetChildId} />;
  if (childAge >= 9 && childAge <= 11) return <DiagnosticCreators childId={targetChildId} />;
  if (childAge >= 12 && childAge <= 14) return <DiagnosticRebels childId={targetChildId} />;
  if (childAge >= 15 && childAge <= 17) return <DiagnosticArchitects childId={targetChildId} />;

  // Fallback for missing or out-of-range age.
  if (fallbackLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <LegacyQuestionTest
      questions={fallbackQuestions}
      user={user}
      activeChildId={targetChildId}
      updateChildDiagnostic={updateChildDiagnostic}
      router={router}
      isDesktop={isDesktop}
      horizontalPadding={horizontalPadding}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
   Legacy Test Component (9-17, unchanged logic)
   ───────────────────────────────────────────────────────────── */

function LegacyQuestionTest({
  questions: QUESTIONS,
  user,
  activeChildId,
  updateChildDiagnostic,
  router,
  isDesktop,
  horizontalPadding,
}: {
  questions: OnboardingQuestion[];
  user: AuthUser | null;
  activeChildId: string | null;
  updateChildDiagnostic: (id: string, d: Diagnostic) => Promise<void>;
  router: AppRouter;
  isDesktop: boolean;
  horizontalPadding: number;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const current = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;

  const selectAnswer = (index: number) => {
    const updated = [...answers];
    updated[step] = index;
    setAnswers(updated);
  };

  const processWithAI = async (selectedAnswers: number[], isSkip: boolean = false) => {
    setIsProcessing(true);
    try {
      let prompt = `You are an expert child psychologist and talent scout. Analyze this profile.\n`;

      if (!isSkip) {
        prompt += `The user answered the following questions:\n`;
        selectedAnswers.forEach((ansIndex, i) => {
          if (ansIndex !== undefined) {
            prompt += `Q: ${QUESTIONS[i].question_text}\nA: ${QUESTIONS[i].answers[ansIndex]}\n`;
          }
        });
      } else {
        prompt += `The user skipped the test. Assign generic but encouraging balanced scores and summary.\n`;
      }

      prompt += `
Based on these answers, generate a JSON object matching this Diagnostic interface exactly. DO NOT include markdown blocks like \`\`\`json, just return raw JSON:
{
  "scores": {
    "logical": number (0-100),
    "creative": number (0-100),
    "social": number (0-100),
    "physical": number (0-100),
    "linguistic": number (0-100)
  },
  "summary": "string (One short, plain Russian sentence, max 110 characters)",
  "recommendedConstellation": "string (A creative 1-2 word title for their talent type in Russian, e.g. 'Техно-энтузиаст' or 'Творческий лидер')"
}`;

      const diagnosticData = await generateGeminiDiagnosticJson<DiagnosticAiResponse>(prompt);

      const targetDiagnostic: Diagnostic = {
        childId: activeChildId || user?.id || 'unknown',
        scores: diagnosticData.scores || {
          logical: 50,
          creative: 50,
          social: 50,
          physical: 50,
          linguistic: 50,
        },
        summary: diagnosticData.summary || 'Очень способный ученик!',
        recommendedConstellation: diagnosticData.recommendedConstellation || 'Универсал',
        timestamp: new Date().toISOString(),
      };

      if (activeChildId) {
        await updateChildDiagnostic(activeChildId, targetDiagnostic);
      }
      router.push({
        pathname: '/profile/youth/results',
        params: activeChildId ? { childId: activeChildId } : undefined,
      });
    } catch (e) {
      if (!isGeminiFallbackError(e)) {
        console.error('AI processing error:', e);
        alert('Произошла ошибка при анализе. Мы используем запасные результаты.');
      }
      if (activeChildId) {
        await updateChildDiagnostic(activeChildId, {
          childId: activeChildId,
          scores: {
            logical: 70,
            creative: 80,
            social: 60,
            physical: 50,
            linguistic: 65,
          },
          summary: 'Сильная сторона — творческий подход и любопытство.',
          recommendedConstellation: 'Творческий новатор',
          timestamp: new Date().toISOString(),
        });
      }
      router.push({
        pathname: '/profile/youth/results',
        params: activeChildId ? { childId: activeChildId } : undefined,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const next = () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      processWithAI(answers);
    }
  };

  const handleSkip = () => {
    processWithAI([], true);
  };

  if (isProcessing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text
          style={{
            color: COLORS.foreground,
            marginTop: 20,
            fontSize: 18,
            fontWeight: '600',
          }}
        >
          ИИ анализирует ответы...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Background Blobs */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: 'hidden' }}>
        <View
          style={{
            position: 'absolute',
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
            position: 'absolute',
            top: '40%',
            left: -150,
            width: 350,
            height: 350,
            borderRadius: 175,
            backgroundColor: `${COLORS.secondary}05`,
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: `${COLORS.accent}05`,
          }}
        />
      </View>

      <SafeAreaView edges={['top']} style={{ zIndex: 20 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: horizontalPadding,
            paddingVertical: 12,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <PressableScale
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 16,
                ...SHADOWS.sm,
              }}
            >
              <Feather name="arrow-left" size={20} color={COLORS.foreground} />
            </PressableScale>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '900',
                color: COLORS.foreground,
                letterSpacing: -0.5,
              }}
            >
              Тестирование
            </Text>
          </View>
          <PressableScale onPress={handleSkip}>
            <Text
              style={{
                color: COLORS.mutedForeground,
                fontSize: 15,
                fontWeight: '600',
              }}
            >
              Пропустить
            </Text>
          </PressableScale>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 8,
          paddingBottom: 120,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
          }}
        >
          {/* PROGRESS */}
          <View
            style={{
              backgroundColor: 'rgba(0,0,0,0.05)',
              height: 10,
              borderRadius: 10,
              overflow: 'hidden',
              marginBottom: 30,
            }}
          >
            <View
              style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: COLORS.primary,
              }}
            />
          </View>

          {/* QUESTION CARD */}
          <MotiView
            key={current.id}
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 400 }}
            style={{
              backgroundColor: 'white',
              borderRadius: 24,
              padding: 22,
              marginBottom: 40,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 10,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: COLORS.mutedForeground,
                marginBottom: 10,
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Вопрос {step + 1} из {QUESTIONS.length}
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: COLORS.foreground,
                marginBottom: 24,
              }}
            >
              {current.question_text}
            </Text>
            {current.answers.map((text, i) => {
              const active = answers[step] === i;
              return (
                <PressableScale
                  key={text}
                  onPress={() => selectAnswer(i)}
                  style={{
                    backgroundColor: active ? `${COLORS.primary}15` : COLORS.muted,
                    borderRadius: RADIUS.lg,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: active ? COLORS.primary : 'transparent',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: active ? COLORS.primary : COLORS.foreground,
                      fontWeight: active ? '800' : '500',
                    }}
                  >
                    {text}
                  </Text>
                </PressableScale>
              );
            })}
          </MotiView>

          <PressableScale
            disabled={answers[step] === undefined}
            onPress={next}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={
                answers[step] === undefined
                  ? [COLORS.muted, COLORS.muted]
                  : [COLORS.primary, COLORS.secondary]
              }
              style={{
                paddingVertical: 18,
                borderRadius: RADIUS.xl,
                alignItems: 'center',
                justifyContent: 'center',
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: '800',
                  color: answers[step] === undefined ? COLORS.mutedForeground : 'white',
                }}
              >
                {step === QUESTIONS.length - 1 ? 'Завершить' : 'Следующий вопрос'}
              </Text>
            </LinearGradient>
          </PressableScale>
        </View>
      </ScrollView>
    </View>
  );
}
