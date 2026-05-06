import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_LABELS } from "$constants/courseOptions";
import { COLORS, SHADOWS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import { useParentData } from "$contexts/ParentDataContext";
import { courseGradient, usePublicCourseById } from "$hooks/usePublicData";
import { useParentCourseEnrollment } from "$hooks/useParentCourseEnrollment";
import { formatKZT } from "$lib/formatCurrency";
import { featherIconName } from "$lib/icons";
import { EnrollmentChoiceModal } from "$components/parent/club/EnrollmentChoiceModal";
import { FullCourseBookingModal } from "$components/parent/club/FullCourseBookingModal";

export default function ParentClubDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { childrenProfile, activeChildId } = useParentData();
  const activeChild =
    childrenProfile.find((c) => c.id === activeChildId) || childrenProfile[0];

  const { course, groups, reviews, trialSlots, loading } =
    usePublicCourseById(id);
  const gradient = courseGradient(0);
  const enrollment = useParentCourseEnrollment({
    course,
    groups,
    trialSlots,
    activeChild,
    user,
  });

  if (loading || enrollment.checkingEnrollment) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (!course) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Feather name="alert-circle" size={40} color="#D1D5DB" />
        <Text
          style={{
            marginTop: 16,
            fontSize: 16,
            color: "#9CA3AF",
            textAlign: "center",
          }}
        >
          Курс не найден
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            marginTop: 20,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: "#6C5CE7",
            borderRadius: 16,
          }}
        >
          <Text style={{ color: "white", fontWeight: "800" }}>Вернуться</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayLevel = LEVEL_LABELS[course.level] ?? course.level;

  return (
    <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 180 }}>
        {/* Hero gradient */}
        <View style={{ position: "relative" }}>
          <LinearGradient
            colors={gradient}
            style={{
              width: "100%",
              height: 280,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather
              name={featherIconName(course.icon, "book-open")}
              size={72}
              color="rgba(255,255,255,0.9)"
            />
            {course.org_name ? (
              <View
                style={{
                  position: "absolute",
                  bottom: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  paddingHorizontal: 14,
                  paddingVertical: 6,
                  borderRadius: 20,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Text
                  style={{ color: "white", fontWeight: "700", fontSize: 13 }}
                >
                  {course.org_name}
                </Text>
              </View>
            ) : null}
          </LinearGradient>

          <SafeAreaView
            style={{
              position: "absolute",
              top: Platform.OS === "ios" ? 0 : 10,
              left: 16,
            }}
          >
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "rgba(255,255,255,0.9)",
                alignItems: "center",
                justifyContent: "center",
                ...SHADOWS.sm,
              }}
            >
              <Feather name="arrow-left" size={22} color="#1F2937" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        <View
          style={{
            padding: 20,
            marginTop: -32,
            backgroundColor: "#F9FAFB",
            borderTopLeftRadius: 36,
            borderTopRightRadius: 36,
          }}
        >
          {/* Title */}
          <View style={{ marginBottom: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#6C5CE7",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {displayLevel}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#FEF3C7",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <Feather name="star" size={13} color="#F59E0B" />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#B45309",
                    marginLeft: 4,
                  }}
                >
                  Новое
                </Text>
              </View>
            </View>
            <Text style={{ fontSize: 26, fontWeight: "900", color: "#111827" }}>
              {course.title}
            </Text>
            {course.description ? (
              <Text
                style={{
                  fontSize: 15,
                  color: "#6B7280",
                  marginTop: 6,
                  lineHeight: 22,
                }}
              >
                {course.description}
              </Text>
            ) : null}
          </View>

          {/* Quick stats */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 24,
              backgroundColor: "white",
              borderRadius: 24,
              padding: 16,
              ...SHADOWS.sm,
            }}
          >
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#EDE9FE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Feather name="tag" size={18} color="#6C5CE7" />
              </View>
              <Text
                style={{ fontSize: 10, color: "#9CA3AF", fontWeight: "600" }}
              >
                Уровень
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "#111827",
                  marginTop: 2,
                  textAlign: "center",
                }}
              >
                {displayLevel}
              </Text>
            </View>
            {course.age_min || course.age_max ? (
              <View style={{ alignItems: "center", flex: 1 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#EDE9FE",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 6,
                  }}
                >
                  <Feather name="users" size={18} color="#6C5CE7" />
                </View>
                <Text
                  style={{ fontSize: 10, color: "#9CA3AF", fontWeight: "600" }}
                >
                  Возраст
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "800",
                    color: "#111827",
                    marginTop: 2,
                  }}
                >
                  {course.age_min ?? ""}–{course.age_max ?? ""} лет
                </Text>
              </View>
            ) : null}
            <View style={{ alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "#EDE9FE",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 6,
                }}
              >
                <Feather name="layers" size={18} color="#6C5CE7" />
              </View>
              <Text
                style={{ fontSize: 10, color: "#9CA3AF", fontWeight: "600" }}
              >
                Группы
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "800",
                  color: "#111827",
                  marginTop: 2,
                }}
              >
                {groups.length}
              </Text>
            </View>
          </View>

          {/* Skills */}
          {course.skills.length > 0 && (
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 17,
                  fontWeight: "900",
                  color: "#1F2937",
                  marginBottom: 12,
                }}
              >
                Развиваемые навыки
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {course.skills.map((skill) => (
                  <View
                    key={skill}
                    style={{
                      backgroundColor: "rgba(108,92,231,0.08)",
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "rgba(108,92,231,0.15)",
                    }}
                  >
                    <Text
                      style={{
                        color: "#6C5CE7",
                        fontWeight: "800",
                        fontSize: 12,
                      }}
                    >
                      {skill}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Reviews */}
          <View style={{ marginBottom: 24 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Text
                style={{ fontSize: 17, fontWeight: "900", color: "#1F2937" }}
              >
                Отзывы
              </Text>
            </View>
            {reviews.length === 0 && (
              <Text
                style={{
                  fontSize: 13,
                  color: "#9CA3AF",
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                }}
              >
                Отзывов пока нет.
              </Text>
            )}
            {reviews.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "white",
                  borderRadius: 20,
                  padding: 16,
                  marginBottom: 10,
                  ...SHADOWS.sm,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text style={{ fontWeight: "800", color: "#1F2937" }}>
                    {item.author_display_name || "Пользователь"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Feather
                        key={s}
                        name="star"
                        size={11}
                        color={s <= item.rating ? "#F59E0B" : "#E5E7EB"}
                      />
                    ))}
                  </View>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#6B7280", lineHeight: 20 }}
                >
                  {item.body}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "white",
          padding: 20,
          paddingBottom: Platform.OS === "ios" ? 36 : 20,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          ...SHADOWS.lg,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View>
          <Text style={{ fontSize: 11, color: "#9CA3AF", fontWeight: "600" }}>
            Стоимость
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#111827" }}>
            {formatKZT(course.price)}/мес
          </Text>
        </View>
        {enrollment.enrolled ? (
          <View
            style={{
              backgroundColor: "#22C55E",
              paddingHorizontal: 24,
              paddingVertical: 14,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Feather name="check-circle" size={18} color="white" />
            <Text style={{ color: "white", fontWeight: "900", fontSize: 15 }}>
              Вы записаны
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={enrollment.openEnrollmentChoice}
            style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 28,
              paddingVertical: 16,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 15 }}>
              Записаться
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <EnrollmentChoiceModal
        visible={enrollment.showEnrollmentChoice}
        course={course}
        activeChild={activeChild}
        trialSlots={trialSlots}
        enrollmentType={enrollment.enrollmentType}
        selectedTimeSlot={enrollment.selectedTimeSlot}
        applying={enrollment.applying}
        onClose={enrollment.closeEnrollmentChoice}
        onSelectTrial={enrollment.selectTrial}
        onSelectFullCourse={enrollment.selectFullCourse}
        onBackFromTrial={enrollment.backFromTrial}
        onSelectTimeSlot={enrollment.setSelectedTimeSlot}
        onConfirmTrial={enrollment.confirmTrialLesson}
      />

      <FullCourseBookingModal
        visible={enrollment.showBookingModal}
        activeChild={activeChild}
        groups={groups}
        selectedGroupId={enrollment.selectedGroupId}
        applying={enrollment.applying}
        onClose={enrollment.closeBookingModal}
        onSelectGroup={enrollment.setSelectedGroupId}
        onConfirm={enrollment.confirmBooking}
      />
    </View>
  );
}
