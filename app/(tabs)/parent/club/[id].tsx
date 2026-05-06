import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LEVEL_LABELS } from "../../../../constants/courseOptions";
import { COLORS, SHADOWS } from "../../../../constants/theme";
import { useAuth } from "../../../../contexts/AuthContext";
import { useParentData } from "../../../../contexts/ParentDataContext";
import {
  applyToCourse,
  applyToTrialLesson,
  checkEnrollment,
  courseGradient,
  usePublicCourseById,
} from "../../../../hooks/usePublicData";

export default function ParentClubDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { childrenProfile, activeChildId } = useParentData();
  const activeChild =
    childrenProfile.find((c) => c.id === activeChildId) || childrenProfile[0];

  const { course, groups, reviews, trialSlots, loading } =
    usePublicCourseById(id);
  const [gradient] = useState<[string, string]>(courseGradient(0));

  const [enrolled, setEnrolled] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [showEnrollmentChoice, setShowEnrollmentChoice] = useState(false);
  const [enrollmentType, setEnrollmentType] = useState<"trial" | "full" | null>(
    null,
  );
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);

  // Check if already enrolled when course and child are loaded
  React.useEffect(() => {
    async function checkStatus() {
      if (!course || !activeChild) {
        setCheckingEnrollment(false);
        return;
      }
      const result = await checkEnrollment({
        childProfileId: activeChild.id,
        childName: activeChild.name,
        courseTitle: course.title,
        parentUserId: user?.id,
      });
      setEnrolled(result.enrolled);
      setCheckingEnrollment(false);
    }
    checkStatus();
  }, [course?.title, activeChild?.id, activeChild?.name, user?.id]);

  const handleConfirmBooking = async () => {
    if (!course || !activeChild) return;
    const selectedGroup = groups.find((group) => group.id === selectedGroupId);
    setApplying(true);
    const result = await applyToCourse({
      orgId: course.org_id,
      courseTitle: course.title,
      childProfileId: activeChild.id,
      childName: activeChild.name,
      childAge: activeChild.age ?? null,
      parentUserId: user?.id,
      parentName: user
        ? `${user.firstName} ${user.lastName}`.trim()
        : undefined,
      groupId: selectedGroup?.id ?? null,
      groupName: selectedGroup?.name ?? null,
      groupSchedule: selectedGroup?.schedule ?? null,
    });
    setApplying(false);
    if (result.error) {
      Alert.alert("Ошибка", result.error);
      return;
    }
    setEnrolled(true);
    setShowBookingModal(false);
  };

  if (loading || checkingEnrollment) {
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
              name={(course.icon as any) || "book-open"}
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
            {course.price.toLocaleString()} ₸/мес
          </Text>
        </View>
        {enrolled ? (
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
            onPress={() => setShowEnrollmentChoice(true)}
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

      {/* Enrollment choice modal - Trial vs Full course */}
      <Modal visible={showEnrollmentChoice} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 40,
              ...SHADOWS.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: COLORS.foreground,
                }}
              >
                Выберите тип записи
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowEnrollmentChoice(false);
                  setEnrollmentType(null);
                  setSelectedTimeSlot(null);
                }}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={22} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Selected child */}
            {activeChild && (
              <View
                style={{
                  backgroundColor: COLORS.primary + "10",
                  padding: 14,
                  borderRadius: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "900" }}
                  >
                    {activeChild.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: COLORS.mutedForeground,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Ребёнок
                  </Text>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "900",
                      color: COLORS.foreground,
                    }}
                  >
                    {activeChild.name}
                  </Text>
                </View>
              </View>
            )}

            {/* Enrollment type selection */}
            {!enrollmentType && (
              <View style={{ gap: 12 }}>
                {/* Trial lesson option */}
                <Pressable
                  onPress={() => setEnrollmentType("trial")}
                  style={{
                    padding: 20,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: "#10B981",
                    backgroundColor: "#ECFDF5",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#10B981",
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather name="play-circle" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "900",
                          color: "#065F46",
                        }}
                      >
                        Пробный урок
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#059669",
                          fontWeight: "600",
                        }}
                      >
                        Бесплатно
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={22} color="#10B981" />
                  </View>
                  <Text
                    style={{ fontSize: 13, color: "#047857", lineHeight: 18 }}
                  >
                    Посетите одно занятие бесплатно, чтобы познакомиться с
                    педагогом и программой
                  </Text>
                </Pressable>

                {/* Full course option */}
                <Pressable
                  onPress={() => {
                    setEnrollmentType("full");
                    setShowEnrollmentChoice(false);
                    setShowBookingModal(true);
                  }}
                  style={{
                    padding: 20,
                    borderRadius: 20,
                    borderWidth: 2,
                    borderColor: COLORS.primary,
                    backgroundColor: COLORS.primary + "08",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: COLORS.primary,
                        alignItems: "center",
                        justifyContent: "center",
                        marginRight: 12,
                      }}
                    >
                      <Feather name="calendar" size={20} color="white" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: "900",
                          color: "#4C1D95",
                        }}
                      >
                        Полный курс
                      </Text>
                      <Text
                        style={{
                          fontSize: 13,
                          color: COLORS.primary,
                          fontWeight: "600",
                        }}
                      >
                        {course.price.toLocaleString()} ₸/мес
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={22}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text
                    style={{ fontSize: 13, color: "#6B21A8", lineHeight: 18 }}
                  >
                    Запишитесь на полный курс занятий с регулярным расписанием
                  </Text>
                </Pressable>
              </View>
            )}

            {/* Trial time slot selection */}
            {enrollmentType === "trial" && (
              <View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => {
                      setEnrollmentType(null);
                      setSelectedTimeSlot(null);
                    }}
                    style={{ marginRight: 12 }}
                  >
                    <Feather
                      name="arrow-left"
                      size={20}
                      color={COLORS.mutedForeground}
                    />
                  </TouchableOpacity>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "800",
                      color: COLORS.foreground,
                    }}
                  >
                    Выберите время пробного урока
                  </Text>
                </View>

                <ScrollView
                  style={{ maxHeight: 240 }}
                  showsVerticalScrollIndicator={false}
                >
                  <View
                    style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}
                  >
                    {trialSlots.length === 0 && (
                      <Text
                        style={{
                          color: COLORS.mutedForeground,
                          paddingVertical: 16,
                        }}
                      >
                        Организация пока не добавила слоты для пробного урока.
                      </Text>
                    )}
                    {trialSlots.map((slot) => {
                      const slotKey = slot.id;
                      const isSelected = selectedTimeSlot === slotKey;
                      return (
                        <Pressable
                          key={slot.id}
                          onPress={() => setSelectedTimeSlot(slotKey)}
                          style={{
                            paddingHorizontal: 18,
                            paddingVertical: 14,
                            borderRadius: 16,
                            borderWidth: 2,
                            borderColor: isSelected ? "#10B981" : "#E5E7EB",
                            backgroundColor: isSelected ? "#ECFDF5" : "white",
                            minWidth: 90,
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "800",
                              color: isSelected ? "#065F46" : COLORS.foreground,
                            }}
                          >
                            {slot.day_label}
                          </Text>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "600",
                              color: isSelected
                                ? "#059669"
                                : COLORS.mutedForeground,
                              marginTop: 2,
                            }}
                          >
                            {slot.time_label}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>

                <TouchableOpacity
                  disabled={applying || !selectedTimeSlot}
                  onPress={async () => {
                    if (!course || !activeChild || !selectedTimeSlot) return;
                    setApplying(true);

                    // Parse selected slot
                    const selectedSlot = trialSlots.find(
                      (slot) => slot.id === selectedTimeSlot,
                    );
                    if (!selectedSlot) return;
                    const day = selectedSlot.day_label;
                    const time = selectedSlot.time_label;

                    const result = await applyToTrialLesson({
                      childId: activeChild.id,
                      childName: activeChild.name,
                      childAge: activeChild.age ?? null,
                      parentId: user?.id,
                      parentName: user
                        ? `${user.firstName} ${user.lastName}`.trim()
                        : undefined,
                      orgId: course.org_id,
                      courseId: course.id,
                      courseTitle: course.title,
                      requestedSlots: trialSlots.map((slot) => ({
                        day: slot.day_label,
                        time: slot.time_label,
                      })),
                      selectedSlot: { day, time },
                    });

                    setApplying(false);
                    if (result.error) {
                      Alert.alert("Ошибка", result.error);
                      return;
                    }
                    setEnrolled(true);
                    setShowEnrollmentChoice(false);
                    setEnrollmentType(null);
                    setSelectedTimeSlot(null);
                    Alert.alert(
                      "Успешно!",
                      `Пробный урок забронирован на ${day} в ${time}`,
                    );
                  }}
                  style={{
                    backgroundColor:
                      applying || !selectedTimeSlot ? "#E5E7EB" : "#10B981",
                    paddingVertical: 18,
                    borderRadius: 22,
                    alignItems: "center",
                    marginTop: 20,
                  }}
                >
                  <Text
                    style={{
                      color:
                        applying || !selectedTimeSlot ? "#9CA3AF" : "white",
                      fontSize: 16,
                      fontWeight: "900",
                    }}
                  >
                    {applying
                      ? "Бронирование..."
                      : "Забронировать пробный урок"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Booking modal for full course */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "white",
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              padding: 24,
              paddingBottom: 40,
              ...SHADOWS.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "900",
                  color: COLORS.foreground,
                }}
              >
                Запись на полный курс
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowBookingModal(false);
                  setEnrollmentType(null);
                }}
                style={{
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="x" size={22} color={COLORS.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Selected child */}
            {activeChild && (
              <View
                style={{
                  backgroundColor: COLORS.primary + "10",
                  padding: 14,
                  borderRadius: 18,
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: COLORS.primary,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{ color: "white", fontSize: 18, fontWeight: "900" }}
                  >
                    {activeChild.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: COLORS.mutedForeground,
                      fontWeight: "700",
                      textTransform: "uppercase",
                    }}
                  >
                    Ребёнок
                  </Text>
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "900",
                      color: COLORS.foreground,
                    }}
                  >
                    {activeChild.name}
                  </Text>
                </View>
              </View>
            )}

            <Text
              style={{
                fontSize: 15,
                fontWeight: "800",
                color: COLORS.foreground,
                marginBottom: 12,
              }}
            >
              {groups.length > 0 ? "Выберите группу" : "Расписание уточняется"}
            </Text>

            {groups.length > 0 ? (
              <ScrollView
                style={{ maxHeight: 220 }}
                showsVerticalScrollIndicator={false}
              >
                {groups.map((group) => (
                  <Pressable
                    key={group.id}
                    onPress={() => setSelectedGroupId(group.id)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 14,
                      borderRadius: 18,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor:
                        selectedGroupId === group.id
                          ? COLORS.primary
                          : "#F3F4F6",
                      backgroundColor:
                        selectedGroupId === group.id
                          ? COLORS.primary + "05"
                          : "white",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: COLORS.foreground,
                        }}
                      >
                        {group.name}
                      </Text>
                      {group.schedule ? (
                        <Text
                          style={{
                            fontSize: 12,
                            color: COLORS.mutedForeground,
                            marginTop: 3,
                          }}
                        >
                          {group.schedule}
                        </Text>
                      ) : null}
                      <Text
                        style={{
                          fontSize: 11,
                          color: COLORS.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        Мест:{" "}
                        {group.capacity - group.enrolled > 0
                          ? `${group.capacity - group.enrolled} свободно`
                          : "Группа полная"}
                      </Text>
                    </View>
                    <View
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 11,
                        borderWidth: 2,
                        borderColor:
                          selectedGroupId === group.id
                            ? COLORS.primary
                            : "#D1D5DB",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {selectedGroupId === group.id && (
                        <View
                          style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: COLORS.primary,
                          }}
                        />
                      )}
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <View
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 14,
                    textAlign: "center",
                  }}
                >
                  Организация скоро добавит группы с расписанием
                </Text>
              </View>
            )}

            <TouchableOpacity
              disabled={applying || (groups.length > 0 && !selectedGroupId)}
              onPress={handleConfirmBooking}
              style={{
                backgroundColor:
                  applying || (groups.length > 0 && !selectedGroupId)
                    ? "#E5E7EB"
                    : COLORS.primary,
                paddingVertical: 18,
                borderRadius: 22,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  color:
                    applying || (groups.length > 0 && !selectedGroupId)
                      ? "#9CA3AF"
                      : "white",
                  fontSize: 16,
                  fontWeight: "900",
                }}
              >
                {applying ? "Отправка..." : "Подтвердить заявку"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
