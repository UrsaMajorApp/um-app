import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../constants/theme";
import { useStudentGoals } from "../../../hooks/useMentorData";
import { useIsDesktop } from "../../../lib/useIsDesktop";

export default function MentorAwards() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;
  const { goals, loading } = useStudentGoals();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: COLORS.primary }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: paddingX,
            paddingVertical: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.xl,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: "white",
            }}
          >
            Цели учеников
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 24,
          paddingBottom: 110,
        }}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.size.lg,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.foreground,
            marginBottom: 16,
          }}
        >
          Активные цели
        </Text>

        {loading && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        <View style={{ gap: 16 }}>
          {goals.map((goal) => (
            <View
              key={goal.id}
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.lg,
                padding: 20,
                borderWidth: 1,
                borderColor: COLORS.border,
                borderLeftWidth: 4,
                borderLeftColor: goal.color,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.md,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  color: COLORS.foreground,
                  marginBottom: 4,
                }}
              >
                {goal.title}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: COLORS.mutedForeground,
                  marginBottom: 12,
                }}
              >
                {goal.student_name} · Срок: {goal.deadline_text}
              </Text>

              {/* Progress bar */}
              <View
                style={{
                  height: 6,
                  backgroundColor: COLORS.muted,
                  borderRadius: RADIUS.full,
                  overflow: "hidden",
                }}
              >
                <View
                  style={{
                    height: "100%",
                    width: `${goal.progress}%`,
                    backgroundColor: goal.color,
                    borderRadius: RADIUS.full,
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 11,
                  color: COLORS.mutedForeground,
                  marginTop: 6,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                }}
              >
                {goal.progress}% выполнено
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
