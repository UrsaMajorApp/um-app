import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  COLORS,
  LAYOUT,
  SHADOWS
} from "$constants/theme";
import { useParentData } from "$contexts/ParentDataContext";
import { useIsDesktop } from "$lib/useIsDesktop";

export default function ParentResults() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const { childrenProfile, activeChildId } = useParentData();
  const child =
    childrenProfile.find((c) => c.id === activeChildId) || childrenProfile[0];
  const diagnostic = child?.talentProfile;

  // No results yet — guide parent to run the test
  if (!child || !diagnostic) {
    return (
      <LinearGradient
        colors={["#6C5CE7", "#EDE9FE"]}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 40,
        }}
      >
        <Feather name="clipboard" size={48} color="rgba(255,255,255,0.6)" />
        <Text
          style={{
            color: "white",
            fontSize: 22,
            fontWeight: "800",
            textAlign: "center",
            marginTop: 20,
            marginBottom: 12,
          }}
        >
          Результатов пока нет
        </Text>
        <Text
          style={{
            color: "rgba(255,255,255,0.7)",
            fontSize: 15,
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 32,
          }}
        >
          Пройдите тест, чтобы узнать таланты вашего ребёнка
        </Text>
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: "/profile/youth/testing",
              params: child?.id ? { childId: child.id } : undefined,
                    });
          }}
          style={{
            backgroundColor: "white",
            paddingVertical: 16,
            paddingHorizontal: 32,
            borderRadius: 24,
          }}
        >
          <Text
            style={{ color: COLORS.primary, fontWeight: "800", fontSize: 16 }}
          >
            Начать тестирование
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  const scores = [
    { label: "Логика", value: diagnostic.scores.logical, color: "#10B981" },
    { label: "Креатив", value: diagnostic.scores.creative, color: "#8B5CF6" },
    { label: "Социум", value: diagnostic.scores.social, color: "#3B82F6" },
    { label: "Физика", value: diagnostic.scores.physical, color: "#F59E0B" },
    {
      label: "Лингвист.",
      value: diagnostic.scores.linguistic,
      color: "#EC4899",
    },
  ];

  return (
    <LinearGradient colors={["#6C5CE7", "#EDE9FE"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: isDesktop ? 72 : 60,
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
          {/* Title */}
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{ marginBottom: 8 }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: "800",
                color: "white",
                textAlign: "center",
              }}
            >
              Результаты тестирования
            </Text>
          </MotiView>
          {child.name && (
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
                fontSize: 15,
                fontWeight: "600",
                marginBottom: 30,
              }}
            >
              {child.name}
            </Text>
          )}

          {/* Icon */}
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
                backgroundColor: "rgba(255,255,255,0.2)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="award" size={40} color="white" />
            </View>
          </MotiView>

          {/* Type card */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{
              backgroundColor: "white",
              borderRadius: 24,
              padding: 24,
              marginBottom: 26,
              ...SHADOWS.md,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 14,
                  backgroundColor: COLORS.primary + "20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Feather name="award" size={20} color={COLORS.primary} />
              </View>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "900",
                  color: COLORS.foreground,
                }}
              >
                {diagnostic.recommendedConstellation}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: COLORS.mutedForeground,
                lineHeight: 22,
                fontWeight: "500",
              }}
            >
              {diagnostic.summary}
            </Text>
          </MotiView>

          {/* Talent map */}
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500, delay: 200 }}
            style={{
              backgroundColor: "white",
              borderRadius: 32,
              padding: 24,
              marginBottom: 26,
              ...SHADOWS.sm,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                marginBottom: 20,
                color: COLORS.foreground,
              }}
            >
              Карта талантов
            </Text>
            <View style={{ gap: 16 }}>
              {scores.map((score, idx) => (
                <View key={idx}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "700",
                        color: COLORS.mutedForeground,
                      }}
                    >
                      {score.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "900",
                        color: COLORS.primary,
                      }}
                    >
                      {score.value}%
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <MotiView
                      from={{ width: 0 }}
                      animate={{ width: `${score.value}%` }}
                      transition={{ duration: 1000, delay: 500 + idx * 100 }}
                      style={{
                        height: "100%",
                        backgroundColor: score.color,
                        borderRadius: 4,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </MotiView>

          {/* Actions */}
          <TouchableOpacity
            onPress={() => {
              router.push({
                pathname: "/profile/youth/testing",
                params: { childId: child.id },
                    });
            }}
            style={{
              borderWidth: 2,
              borderColor: "white",
              paddingVertical: 16,
              borderRadius: 24,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 15,
                fontWeight: "700",
              }}
            >
              Пройти тест заново
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "white",
              paddingVertical: 16,
              borderRadius: 24,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                color: COLORS.primary,
                fontSize: 16,
                fontWeight: "800",
              }}
            >
              Назад
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
