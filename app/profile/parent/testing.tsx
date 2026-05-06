import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LAYOUT } from '$constants/theme';
import { useOnboardingQuestions } from '$hooks/usePlatformData';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function ParentTesting() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const { questions, loading } = useOnboardingQuestions('parent');
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const current = questions[step];
  const progress = questions.length > 0 ? ((step + 1) / questions.length) * 100 : 0;

  const selectAnswer = (index: number) => {
    const updated = [...answers];
    updated[step] = index;
    setAnswers(updated);
  };

  const next = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/profile/parent/results');
    }
  };

  if (loading || !current) {
    return (
      <LinearGradient
        colors={['#6A63D8', '#C7C4F2']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <ActivityIndicator color="white" size="large" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#6A63D8', '#C7C4F2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isDesktop ? 72 : 60,
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
          {/* TITLE */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: 'white',
                marginBottom: 16,
              }}
            >
              Тестирование
            </Text>
          </MotiView>

          {/* PROGRESS */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
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
                backgroundColor: 'white',
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
                opacity: 0.6,
                marginBottom: 10,
              }}
            >
              Вопрос {step + 1} из {questions.length}
            </Text>

            <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 20 }}>
              {current.question_text}
            </Text>

            {current.answers.map((text, i) => {
              const active = answers[step] === i;
              return (
                <TouchableOpacity
                  key={text}
                  onPress={() => selectAnswer(i)}
                  style={{
                    backgroundColor: active ? '#6C5CE7' : '#EFEFFE',
                    borderRadius: 30,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    marginBottom: 14,
                  }}
                >
                  <Text
                    style={{
                      textAlign: 'center',
                      fontSize: 16,
                      color: active ? 'white' : '#000',
                      fontWeight: active ? '700' : '500',
                    }}
                  >
                    {text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </MotiView>

          {/* BUTTON */}
          <TouchableOpacity
            disabled={answers[step] === undefined}
            onPress={next}
            style={{
              backgroundColor: answers[step] === undefined ? '#999' : '#6C5CE7',
              paddingVertical: 16,
              borderRadius: 30,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              {step === questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
