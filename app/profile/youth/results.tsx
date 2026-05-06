import { useIsDesktop } from "../../../lib/useIsDesktop";
/**
 * results.tsx — Diagnostic results screen.
 *
 * Supports two report modes:
 *   • BASIC (or legacy): talent map bars + summary + constellation
 *   • PRO (6-8 "Explorers"): 4-block report — Skills, Intellect Type,
 *     Personality, Career Archetypes
 *
 * Backward-compatible with old Diagnostic objects (no tier/ageGroup).
 */
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { useParentData } from "../../../contexts/ParentDataContext";

function compactSummary(summary?: string) {
  const normalized = (summary || "").replace(/\s+/g, " ").trim();
  if (!normalized)
    return "Отличный результат и сильный потенциал для развития.";

  const firstSentence =
    normalized.match(/^[^.!?]+[.!?]/)?.[0]?.trim() || normalized;
  if (firstSentence.length <= 130) return firstSentence;

  const trimmed = firstSentence.slice(0, 127);
  return `${trimmed.slice(0, trimmed.lastIndexOf(" "))}.`;
}

export default function YouthResults() {
  const router = useRouter();
  const { childId } = useLocalSearchParams<{ childId?: string | string[] }>();
  const { finalizeRegistration } = useAuth();

  const handleGoHome = async () => {
    await finalizeRegistration();
    router.replace("/(tabs)/home");
  };
  const { childrenProfile, activeChildId } = useParentData();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const requestedChildId = Array.isArray(childId) ? childId[0] : childId;
  const child =
    childrenProfile.find((c) => c.id === requestedChildId) ||
    childrenProfile.find((c) => c.id === activeChildId) ||
    childrenProfile[0];
  const diagnostic = child?.talentProfile;
  const summary = compactSummary(diagnostic?.summary);

  if (!child || !diagnostic) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.primary,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Анализ почти завершен! Пожалуйста, подождите...
        </Text>
        <TouchableOpacity
          onPress={() => handleGoHome()}
          style={{
            marginTop: 20,
            backgroundColor: "white",
            padding: 15,
            borderRadius: 20,
          }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "bold" }}>
            Вернуться на главную
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isPro = diagnostic.tier === "pro";

  const colorPalette = [
    "#10B981",
    "#8B5CF6",
    "#3B82F6",
    "#F59E0B",
    "#EC4899",
    "#14B8A6",
    "#F43F5E",
  ];

  const sortedScores = Object.entries(diagnostic.scores || {})
    .filter(([, v]) => typeof v === "number" && v > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const chartScores = sortedScores.map(([key, value], idx) => {
    const labelMap: Record<string, string> = {
      logic: "Логика",
      creative: "Креатив",
      social: "Социум",
      physical: "Физика",
      linguistic: "Лингвистика",
      creativity: "Креативность",
      empathy: "Эмпатия",
      leadership: "Лидерство",
      communication: "Общение",
      adaptability: "Адаптивность",
      analytics: "Аналитика",
      teamwork: "Командная работа",
      Autonomy: "Независимость",
      Stability: "Стабильность",
      Mastery: "Мастерство",
      Management: "Менеджмент",
      Entrepreneurship: "Предпринимательство",
      Service: "Служение",
      Challenge: "Вызов",
      Lifestyle: "Стиль жизни",
      R: "Реалистичный",
      I: "Интеллектуальный",
      A: "Артистичный",
      S: "Социальный",
      E: "Предприимчивый",
      C: "Конвенциональный",
      tech: "Технологии",
      art: "Искусство",
      nature: "Природа",
      sport: "Спорт",
    };
    const label = labelMap[key] || key;
    // Normalize roughly (some test formats output points instead of percentages)
    // If maximum expected is around 40-50, we can multiply by 2, but for simplicity we just cap at 100 or use raw if > 100
    const normalizedValue = Math.min(100, Math.max(0, Math.round(value)));

    return {
      label,
      value: normalizedValue,
      color: colorPalette[idx % colorPalette.length],
    };
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Background Blobs */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
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
            top: "40%",
            left: -150,
            width: 350,
            height: 350,
            borderRadius: 175,
            backgroundColor: `${COLORS.secondary}05`,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: 150,
            backgroundColor: `${COLORS.accent}05`,
          }}
        />
      </View>

      <SafeAreaView edges={["top"]} style={{ zIndex: 20 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: horizontalPadding,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "900",
              color: COLORS.foreground,
              letterSpacing: -0.5,
            }}
          >
            {isPro ? "Полный отчёт" : "Твои результаты"}
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 8,
          paddingBottom: 120,
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? LAYOUT.profileFormMaxWidth : undefined,
          }}
        >
          {/* ── Header icon ── */}
          <MotiView
            from={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500 }}
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 30,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: `${COLORS.primary}15`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="zap" size={40} color={COLORS.primary} />
            </View>
          </MotiView>

          {/* ── 1. Constellation / Summary Card ── */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={s.card}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View style={s.iconBadge}>
                <Feather name="award" size={20} color={COLORS.primary} />
              </View>
              <Text style={s.constellationText}>
                {diagnostic.recommendedConstellation}
              </Text>
            </View>
            <Text style={s.summaryText}>{summary}</Text>
          </MotiView>

          {/* ── 2. Talent Map Bars ── */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500, delay: 200 }}
            style={s.card}
          >
            <Text style={s.cardTitle}>Карта талантов</Text>
            <View style={{ gap: 16 }}>
              {chartScores.map((score, idx) => (
                <View key={idx}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={s.barLabel}>{score.label}</Text>
                    <Text style={s.barValue}>{score.value}%</Text>
                  </View>
                  <View style={s.barTrack}>
                    <MotiView
                      from={{ width: "0%" }}
                      animate={{ width: `${score.value}%` }}
                      transition={{
                        duration: 1000,
                        delay: 500 + idx * 100,
                      }}
                      style={[s.barFill, { backgroundColor: score.color }]}
                    />
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* ── PRO-only blocks ── */}
          {isPro && (
            <>
              {/* 3. Top Strengths & Development Areas */}
              {(diagnostic.topStrengths || diagnostic.developmentAreas) && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 400, duration: 400 }}
                  style={s.card}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 16,
                    }}
                  >
                    <Feather name="target" size={18} color="#10B981" />
                    <Text style={s.cardTitle}>Ключевые навыки</Text>
                  </View>

                  {diagnostic.topStrengths &&
                    diagnostic.topStrengths.length > 0 && (
                      <View style={{ marginBottom: 16 }}>
                        <Text style={s.subLabel}>Сильные стороны:</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          {diagnostic.topStrengths.map((s2, i) => (
                            <View key={i} style={s.strengthChip}>
                              <Text style={s.strengthChipText}>✦ {s2}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}

                  {diagnostic.developmentAreas &&
                    diagnostic.developmentAreas.length > 0 && (
                      <View>
                        <Text style={s.subLabel}>Зоны роста:</Text>
                        <View
                          style={{
                            flexDirection: "row",
                            flexWrap: "wrap",
                            gap: 8,
                            marginTop: 8,
                          }}
                        >
                          {diagnostic.developmentAreas.map((d, i) => (
                            <View key={i} style={s.devAreaChip}>
                              <Text style={s.devAreaChipText}>↗ {d}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                </MotiView>
              )}

              {/* 4. Intellect Type */}
              {diagnostic.intellectType && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 500, duration: 400 }}
                  style={s.card}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Feather name="cpu" size={18} color="#3B82F6" />
                    <Text style={s.cardTitle}>Тип интеллекта</Text>
                  </View>
                  <Text style={s.intellectText}>
                    {diagnostic.intellectType}
                  </Text>
                </MotiView>
              )}

              {/* 5. Personality / Behavior Pattern */}
              {diagnostic.personalityBehavior && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 600, duration: 400 }}
                  style={[s.card, { backgroundColor: "#FEFCE8" }]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Feather name="activity" size={18} color="#D97706" />
                    <Text style={s.cardTitle}>Тип личности</Text>
                  </View>
                  <Text style={s.behaviorText}>
                    {diagnostic.personalityBehavior}
                  </Text>
                  <Text style={s.stealthNote}>
                    * Определено с помощью скрытой аналитики поведения
                  </Text>
                </MotiView>
              )}

              {/* 6. Career Archetypes */}
              {diagnostic.careerArchetypes &&
                diagnostic.careerArchetypes.length > 0 && (
                  <MotiView
                    from={{ opacity: 0, translateY: 20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ delay: 700, duration: 400 }}
                    style={s.card}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 16,
                      }}
                    >
                      <Feather name="compass" size={18} color="#8B5CF6" />
                      <Text style={s.cardTitle}>Ранняя профориентация</Text>
                    </View>
                    <View style={{ gap: 10 }}>
                      {diagnostic.careerArchetypes.map((career, i) => (
                        <View key={i} style={s.careerRow}>
                          <View style={s.careerDot} />
                          <Text style={s.careerText}>{career}</Text>
                        </View>
                      ))}
                    </View>
                  </MotiView>
                )}

              {/* 7. Parent Advice */}
              {diagnostic.parentAdvice && (
                <MotiView
                  from={{ opacity: 0, translateY: 20 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: 800, duration: 400 }}
                  style={[
                    s.card,
                    {
                      backgroundColor: `${COLORS.secondary}10`,
                      borderWidth: 1,
                      borderColor: `${COLORS.secondary}20`,
                    },
                  ]}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 12,
                    }}
                  >
                    <Feather name="heart" size={18} color={COLORS.secondary} />
                    <Text style={s.cardTitle}>Совет для родителей</Text>
                  </View>
                  <Text style={s.adviceText}>{diagnostic.parentAdvice}</Text>
                </MotiView>
              )}
            </>
          )}

          {/* ── PRO upsell (for BASIC users) ── */}
          {!isPro && (
            <View style={s.proCard}>
              <LinearGradient
                colors={[COLORS.primary, "transparent"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: 0.3,
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                <Feather name="zap" size={24} color="#A78BFA" />
                <Text
                  style={{
                    color: "white",
                    fontSize: 18,
                    fontWeight: "900",
                  }}
                >
                  PRO Аналитика
                </Text>
              </View>
              <Text
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: 14,
                  lineHeight: 20,
                  marginBottom: 20,
                }}
              >
                Подпишитесь на PRO, чтобы получить расширенный отчёт: тип
                интеллекта, профориентацию, анализ поведения и персональные
                рекомендации.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/parent/subscription" as any)}
                style={{
                  backgroundColor: "white",
                  paddingVertical: 14,
                  borderRadius: 16,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: COLORS.foreground,
                    fontWeight: "900",
                    fontSize: 15,
                  }}
                >
                  ОТКРЫТЬ ВСЕ ВОЗМОЖНОСТИ
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── Recommendation ── */}
          {!isPro && chartScores.length > 0 && (
            <View style={s.recommendationBox}>
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  color: COLORS.foreground,
                  fontWeight: "500",
                }}
              >
                На основе твоих ответов, твои самые сильные стороны — это{" "}
                {chartScores
                  .slice(0, 2)
                  .map((s) => s.label.toLowerCase())
                  .join(" и ")}
                . Продолжай развивать их!
              </Text>
            </View>
          )}

          {/* ── CTA ── */}
          <TouchableOpacity
            onPress={() => handleGoHome()}
            style={{ marginTop: 8 }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={{
                paddingVertical: 18,
                borderRadius: RADIUS.xl,
                alignItems: "center",
                justifyContent: "center",
                ...SHADOWS.md,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "800", color: "white" }}>
                На главную
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 32,
    padding: 24,
    marginBottom: 26,
    ...SHADOWS.md,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: COLORS.primary + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  constellationText: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.foreground,
    flex: 1,
  },
  summaryText: {
    fontSize: 15,
    color: COLORS.mutedForeground,
    lineHeight: 22,
    fontWeight: "500",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.foreground,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.mutedForeground,
  },
  barValue: {
    fontSize: 14,
    fontWeight: "900",
    color: COLORS.primary,
  },
  barTrack: {
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
  subLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.mutedForeground,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  strengthChip: {
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  strengthChipText: {
    color: "#059669",
    fontSize: 13,
    fontWeight: "700",
  },
  devAreaChip: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  devAreaChipText: {
    color: "#D97706",
    fontSize: 13,
    fontWeight: "700",
  },
  intellectText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.foreground,
    lineHeight: 24,
  },
  behaviorText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#92400E",
    lineHeight: 22,
    marginBottom: 8,
  },
  stealthNote: {
    fontSize: 11,
    fontWeight: "500",
    color: "#B45309",
    fontStyle: "italic",
  },
  careerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  careerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8B5CF6",
  },
  careerText: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.foreground,
  },
  adviceText: {
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.foreground,
    lineHeight: 22,
  },
  proCard: {
    backgroundColor: COLORS.foreground,
    borderRadius: 32,
    padding: 24,
    marginBottom: 30,
    overflow: "hidden",
  },
  recommendationBox: {
    backgroundColor: `${COLORS.secondary}10`,
    padding: 20,
    borderRadius: 20,
    marginBottom: 40,
    borderWidth: 1,
    borderColor: `${COLORS.secondary}20`,
  },
});
