import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LEVEL_LABELS } from "$constants/courseOptions";
import { COLORS, SHADOWS } from "$constants/theme";
import { courseGradient, usePublicCourseById } from "$hooks/usePublicData";
import { formatKZT } from "$lib/formatCurrency";
import { isWebMinWidth } from "$lib/useIsDesktop";

const { width } = Dimensions.get("window");
const IS_DESKTOP = isWebMinWidth(width, 900);

export default function CourseModal() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { course, loading } = usePublicCourseById(id);
  const [c1, c2] = courseGradient(0);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!course) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 32,
        }}
      >
        <Text style={{ color: COLORS.mutedForeground, fontSize: 16 }}>
          Курс не найден
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: COLORS.primary, fontWeight: "700" }}>
            ← Закрыть
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <LinearGradient colors={[c1, c2]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          padding: 24,
          paddingBottom: 80,
          alignItems: IS_DESKTOP ? "center" : "stretch",
        }}
      >
        <View style={{ width: IS_DESKTOP ? "50%" : "100%" }}>
          {/* Close */}
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 20 }}
          >
            <Text style={{ fontSize: 16, color: "white", fontWeight: "700" }}>
              ← закрыть
            </Text>
          </TouchableOpacity>

          {/* Card */}
          <View
            style={{
              backgroundColor: "white",
              borderRadius: 30,
              padding: 24,
              ...SHADOWS.lg,
            }}
          >
            {/* Icon + title */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 14,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: c1 + "15",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name={(course.icon as any) || "book-open"}
                  size={26}
                  color={c1}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 22, fontWeight: "900", color: "#111827" }}
                >
                  {course.title}
                </Text>
                {course.org_name ? (
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#9CA3AF",
                      fontWeight: "600",
                      marginTop: 2,
                    }}
                  >
                    {course.org_name}
                  </Text>
                ) : null}
              </View>
            </View>

            {/* Meta */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  backgroundColor: c1 + "15",
                  paddingHorizontal: 12,
                  paddingVertical: 5,
                  borderRadius: 10,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "800", color: c1 }}>
                  {(LEVEL_LABELS[course.level] ?? course.level).toUpperCase()}
                </Text>
              </View>
              {course.age_min || course.age_max ? (
                <View
                  style={{
                    backgroundColor: "#F3F4F6",
                    paddingHorizontal: 12,
                    paddingVertical: 5,
                    borderRadius: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: "#6B7280",
                    }}
                  >
                    {course.age_min ?? ""}–{course.age_max ?? ""} ЛЕТ
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Description */}
            {course.description ? (
              <Text
                style={{
                  fontSize: 15,
                  lineHeight: 22,
                  color: "#4B5563",
                  marginBottom: 20,
                }}
              >
                {course.description}
              </Text>
            ) : null}

            {/* Skills */}
            {course.skills.length > 0 && (
              <View style={{ marginBottom: 20 }}>
                <Text
                  style={{
                    fontWeight: "800",
                    color: "#111827",
                    marginBottom: 8,
                  }}
                >
                  Навыки
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}
                >
                  {course.skills.map((s) => (
                    <View
                      key={s}
                      style={{
                        backgroundColor: "#EDE9FE",
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#6C5CE7",
                        }}
                      >
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Price + CTA */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}
                >
                  Стоимость
                </Text>
                <Text
                  style={{ fontSize: 20, fontWeight: "900", color: "#111827" }}
                >
                  {formatKZT(course.price)}/мес
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  router.back();
                  router.push(`/parent/club/${course.id}` as any);
                }}
                style={{
                  backgroundColor: c1,
                  paddingVertical: 14,
                  paddingHorizontal: 24,
                  borderRadius: 18,
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "900", fontSize: 15 }}
                >
                  Записаться
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
