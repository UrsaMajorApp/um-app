import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useParentData } from "$contexts/ParentDataContext";
import { useOnboardingQuestions } from "$hooks/usePlatformData";
import {
  generateGeminiDiagnosticJson,
  isGeminiFallbackError,
} from "$lib/geminiDiagnostics";
import type { DiagnosticAiResponse } from "$types/diagnostic";

// Answer order matches the DB seed: creative, physical, logical, social, linguistic
const ANSWER_VALUES = [
  "creative",
  "physical",
  "logical",
  "social",
  "linguistic",
] as const;

export default function DiagnosticTest() {
  const router = useRouter();
  const { childId } = useLocalSearchParams();
  const { childrenProfile, updateChildDiagnostic, activeChildId } =
    useParentData();
  const { questions: QUESTIONS, loading: questionsLoading } =
    useOnboardingQuestions("parent_diagnostic");

  const targetId = childId || activeChildId;
  const child =
    childrenProfile.find((c) => c.id === targetId) || childrenProfile[0];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  if (!child) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#6C5CE7",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 18 }}>Ребенок не найден.</Text>
      </View>
    );
  }

  const handleSelectOption = (answerIndex: number) => {
    const value = ANSWER_VALUES[answerIndex] ?? ANSWER_VALUES[0];
    const newAnswers = [...answers, value];

    if (currentQ < QUESTIONS.length - 1) {
      setAnswers(newAnswers);
      setCurrentQ((prev) => prev + 1);
    } else {
      processWithAI(newAnswers);
    }
  };

  const processWithAI = async (finalAnswers: string[]) => {
    setIsAnalyzing(true);
    try {
      // Prepare data summary
      const answersSummary = finalAnswers.join(", ");
      const prompt = `Analyze this child based on Howard Gardner's theory of multiple intelligences.
      Child Name: ${child.name}, Age: ${child.age}, Interests: ${child.interests.join(", ")}.
      Quiz trait tendencies selected by parent: ${answersSummary}.
      
      Respond STRICTLY in the following JSON format (no markdown, no quotes around JSON):
      {
        "scores": {
          "creative": number 0-100,
          "logical": number 0-100,
          "social": number 0-100,
          "physical": number 0-100,
          "linguistic": number 0-100
        },
        "summary": "One short, plain Russian sentence, max 110 characters",
        "recommendedConstellation": "A short 1-3 word title in Russian (e.g. 'Юный Исследователь', 'Инженер')"
      }`;

      let parsed: DiagnosticAiResponse;
      try {
        parsed =
          await generateGeminiDiagnosticJson<DiagnosticAiResponse>(prompt);
      } catch (error) {
        if (!isGeminiFallbackError(error)) {
          throw error;
        }

        parsed = {
          scores: {
            creative: 78,
            logical: 72,
            social: 70,
            physical: 62,
            linguistic: 68,
          },
          summary:
            "Сильная сторона ребёнка — творческий и познавательный интерес.",
          recommendedConstellation: "Юный исследователь",
        };
      }

      updateChildDiagnostic(child.id, {
        childId: child.id,
        scores: parsed.scores ?? {
          creative: 78,
          logical: 72,
          social: 70,
          physical: 62,
          linguistic: 68,
        },
        summary:
          parsed.summary ??
          "Сильная сторона ребёнка — творческий и познавательный интерес.",
        recommendedConstellation:
          parsed.recommendedConstellation ?? "Юный исследователь",
      });

      router.back();
    } catch (error: unknown) {
      console.error("AI Diagnostic Error:", error);
      const message =
        error instanceof Error ? error.message : "Неизвестная ошибка";
      if (Platform.OS === "web") {
        window.alert("Ошибка тестирования ИИ: " + message);
      } else {
        Alert.alert("Ошибка тестирования ИИ", message);
      }
      setIsAnalyzing(false);
    }
  };

  if (questionsLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#6C5CE7" }}>
        <LinearGradient
          colors={["#6C5CE7", "#8B7FE8"]}
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator size="large" color="#FFFFFF" />
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#6C5CE7" }}>
      <LinearGradient
        colors={["#6C5CE7", "#8B7FE8"]}
        style={{ flex: 1, padding: 20 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <Pressable onPress={() => router.back()} disabled={isAnalyzing}>
            <Text style={{ color: "rgba(255,255,255,0.7)", fontWeight: "600" }}>
              Отмена
            </Text>
          </Pressable>
          <Text style={{ color: "white", fontWeight: "800" }}>
            Анализ: {child.name}
          </Text>
          <View style={{ width: 50 }} />
        </View>

        {isAnalyzing ? (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text
              style={{
                color: "white",
                fontSize: 18,
                fontWeight: "700",
                marginTop: 24,
                textAlign: "center",
              }}
            >
              ИИ Gemini составляет карту талантов...
            </Text>
            <Text
              style={{
                color: "rgba(255,255,255,0.8)",
                fontSize: 14,
                fontWeight: "500",
                marginTop: 12,
                textAlign: "center",
              }}
            >
              Это может занять пару секунд.
            </Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: "rgba(255, 255, 255, 0.7)",
                fontWeight: "800",
                marginBottom: 12,
              }}
            >
              ВОПРОС {currentQ + 1} ИЗ {QUESTIONS.length}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: 24,
                fontWeight: "900",
                marginBottom: 32,
              }}
            >
              {QUESTIONS[currentQ].question_text}
            </Text>

            {QUESTIONS[currentQ].answers.map((optText, idx) => (
              <Pressable
                key={idx}
                onPress={() => handleSelectOption(idx)}
                style={({ pressed }) => ({
                  backgroundColor: "rgba(255, 255, 255, 0.15)",
                  padding: 20,
                  borderRadius: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.1)",
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <Text
                  style={{ color: "white", fontSize: 16, fontWeight: "600" }}
                >
                  {optText}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </LinearGradient>
    </SafeAreaView>
  );
}
