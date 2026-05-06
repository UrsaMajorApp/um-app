import { SideNav } from "$components/navigation/SideNav";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import { useParentData } from "$contexts/ParentDataContext";
import { formatPhone } from "$lib/formatPhone";
import { useIsDesktop } from "$lib/useIsDesktop";

// Age options from 6 to 20
const AGE_OPTIONS = Array.from({ length: 15 }, (_, i) => i + 6);
const ROLE_COLOR = "#6C5CE7";

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={styles.fieldLabel}>
      {children} <Text style={styles.requiredMark}>*</Text>
    </Text>
  );
}

export default function CreateProfileChild() {
  const router = useRouter();
  const { addChild } = useParentData();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;
  const [formData, setFormData] = useState({
    firstName: "",
    age: 0,
    gender: "",
    phone: "",
    otherInterest: "",
    goals: "",
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const availableInterests = [
    "Рисование",
    "Музыка",
    "Математика",
    "Спорт",
    "Чтение",
    "Конструкторы",
    "Игры",
    "Языки",
  ];

  const phoneDigits = formData.phone.replace(/\D/g, "");
  const validation = {
    firstName: formData.firstName.trim().length > 0,
    phone: phoneDigits.length === 0 || phoneDigits.length === 11,
    age: formData.age >= 6 && formData.age <= 20,
    gender: formData.gender === "boy" || formData.gender === "girl",
    interests: interests.length > 0,
    goals: formData.goals.trim().length > 0,
  };
  const isFormValid = Object.values(validation).every(Boolean);

  const handleNext = async () => {
    setHasSubmitted(true);
    setSubmitError("");

    if (!isFormValid) {
      setSubmitError("Заполните обязательные поля");
      return;
    }

    setIsSubmitting(true);
    try {
      const ageNum = formData.age || 8;
      const childId = `child_${Date.now()}`;

      await addChild({
        id: childId,
        name: formData.firstName.trim(),
        age: ageNum,
        phone: formData.phone.trim() || undefined,
        interests: interests,
        ageCategory: ageNum < 12 ? "child" : "teen",
        parentId: "pending",
        goals: formData.goals.trim() || undefined,
      });

      router.push({
        pathname: "/profile/youth/testing",
        params: { childId },
      } as any);
    } catch (error) {
      console.error("Error adding child:", error);
      setSubmitError("Произошла ошибка при сохранении профиля");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addOtherInterest = () => {
    if (formData.otherInterest.trim() !== "") {
      setInterests([...interests, formData.otherInterest.trim()]);
      setFormData({ ...formData, otherInterest: "" });
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/register");
  };

  const pageContent = (
    <View style={styles.page}>
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <View style={styles.bgOrbTop} />
        <View style={styles.bgOrbBottom} />
      </View>
      <View style={{ backgroundColor: COLORS.primary, overflow: "hidden" }}>
        <LinearGradient
          colors={COLORS.gradients.header as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingTop: Platform.OS === "ios" ? 0 : 20 }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={[
                styles.gradientHeader,
                { paddingHorizontal: horizontalPadding },
              ]}
            >
              <TouchableOpacity
                onPress={handleBack}
                style={styles.headerBackButton}
              >
                <Feather name="arrow-left" size={20} color={COLORS.white} />
                <Text style={styles.headerBackText}>Назад</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Профиль ребенка</Text>
              <Text style={styles.headerSubtitle}>
                Данные для кружков, целей и диагностики
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 60,
          alignItems: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            width: "100%",
            maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
          }}
        >
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="user" size={20} color={ROLE_COLOR} />
              <Text style={styles.cardTitle}>Основная информация</Text>
            </View>

            <View style={styles.fieldStack}>
              <View style={styles.field}>
                <RequiredLabel>Имя</RequiredLabel>
                <TextInput
                  value={formData.firstName}
                  onChangeText={(text) =>
                    setFormData({ ...formData, firstName: text })
                  }
                  placeholder="Как зовут ребенка?"
                  placeholderTextColor={COLORS.mutedForeground}
                  style={[
                    styles.input,
                    hasSubmitted && !validation.firstName && styles.inputError,
                  ]}
                />
                {hasSubmitted && !validation.firstName && (
                  <Text style={styles.errorText}>Введите имя ребенка</Text>
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Телефон</Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: formatPhone(text) })
                  }
                  placeholder="+7 777 777 7777"
                  placeholderTextColor={COLORS.mutedForeground}
                  keyboardType="phone-pad"
                  style={[
                    styles.input,
                    hasSubmitted && !validation.phone && styles.inputError,
                  ]}
                />
                <Text style={styles.helpText}>
                  Необязательно. Если номера нет, ребенок сможет войти по
                  QR-коду.
                </Text>
                {hasSubmitted && !validation.phone && (
                  <Text style={styles.errorText}>
                    Введите полный номер из 11 цифр или оставьте поле пустым
                  </Text>
                )}
              </View>

              <View style={styles.field}>
                <RequiredLabel>Возраст</RequiredLabel>
                <TouchableOpacity
                  onPress={() => setShowAgePicker(true)}
                  style={[
                    styles.selectInput,
                    hasSubmitted && !validation.age && styles.inputError,
                  ]}
                >
                  <Text
                    style={[
                      styles.selectText,
                      !formData.age && styles.placeholderText,
                    ]}
                  >
                    {formData.age ? `${formData.age} лет` : "Выберите возраст"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color={COLORS.mutedForeground}
                  />
                </TouchableOpacity>
                {hasSubmitted && !validation.age && (
                  <Text style={styles.errorText}>Выберите возраст</Text>
                )}
              </View>

              <View style={styles.field}>
                <RequiredLabel>Пол</RequiredLabel>
                <View style={styles.segmented}>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, gender: "boy" })}
                    style={[
                      styles.segment,
                      formData.gender === "boy" && styles.segmentActive,
                      hasSubmitted && !validation.gender && styles.inputError,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        formData.gender === "boy" && styles.segmentTextActive,
                      ]}
                    >
                      Мальчик
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setFormData({ ...formData, gender: "girl" })}
                    style={[
                      styles.segment,
                      formData.gender === "girl" && styles.segmentActive,
                      hasSubmitted && !validation.gender && styles.inputError,
                    ]}
                  >
                    <Text
                      style={[
                        styles.segmentText,
                        formData.gender === "girl" && styles.segmentTextActive,
                      ]}
                    >
                      Девочка
                    </Text>
                  </TouchableOpacity>
                </View>
                {hasSubmitted && !validation.gender && (
                  <Text style={styles.errorText}>Выберите пол</Text>
                )}
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="heart" size={20} color={ROLE_COLOR} />
              <Text style={styles.cardTitle}>Интересы</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <Text style={styles.cardDescription}>
              Что нравится ребенку сейчас?
            </Text>
            <View style={styles.chipGrid}>
              {availableInterests.map((interest) => {
                const isSelected = interests.includes(interest);
                return (
                  <TouchableOpacity
                    key={interest}
                    onPress={() => toggleInterest(interest)}
                    style={[styles.chip, isSelected && styles.chipActive]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {interest}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {hasSubmitted && !validation.interests && (
              <Text style={styles.errorText}>
                Выберите хотя бы один интерес
              </Text>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
              Другой интерес
            </Text>
            <View style={styles.inlineInputRow}>
              <TextInput
                value={formData.otherInterest}
                onChangeText={(text) =>
                  setFormData({ ...formData, otherInterest: text })
                }
                placeholder="Введите интерес ребенка"
                placeholderTextColor={COLORS.mutedForeground}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                onPress={addOtherInterest}
                style={styles.addButton}
              >
                <Feather name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="target" size={20} color={ROLE_COLOR} />
              <Text style={styles.cardTitle}>Цель</Text>
              <Text style={styles.requiredMark}>*</Text>
            </View>
            <Text style={styles.cardDescription}>
              Чему ребенок хочет научиться?
            </Text>
            <TextInput
              value={formData.goals}
              onChangeText={(text) => setFormData({ ...formData, goals: text })}
              placeholder="Например: научиться программировать, стать лучше в математике..."
              placeholderTextColor={COLORS.mutedForeground}
              multiline
              numberOfLines={3}
              style={[
                styles.input,
                styles.textArea,
                hasSubmitted && !validation.goals && styles.inputError,
              ]}
            />
            {hasSubmitted && !validation.goals && (
              <Text style={styles.errorText}>Опишите цель ребенка</Text>
            )}
          </View>

          <View style={styles.footer}>
            {submitError ? (
              <Text style={styles.submitErrorText}>{submitError}</Text>
            ) : null}
            <TouchableOpacity
              onPress={handleNext}
              disabled={isSubmitting || !isFormValid}
              activeOpacity={0.8}
              style={[
                styles.submitButton,
                (isSubmitting || !isFormValid) && styles.submitButtonDisabled,
              ]}
            >
              <LinearGradient
                colors={
                  (isFormValid
                    ? COLORS.gradients.header
                    : [COLORS.muted, COLORS.muted]) as any
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                <Text
                  style={[
                    styles.submitText,
                    !isFormValid && styles.submitTextDisabled,
                  ]}
                >
                  {isSubmitting ? "Сохранение..." : "Добавить ребенка"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Age Picker Modal */}
        <Modal
          visible={showAgePicker}
          transparent
          animationType={isDesktop ? "fade" : "slide"}
        >
          <Pressable
            style={[
              styles.agePickerOverlay,
              isDesktop && styles.agePickerOverlayDesktop,
            ]}
            onPress={() => setShowAgePicker(false)}
          >
            <Pressable
              style={[styles.modalSheet, isDesktop && styles.modalSheetDesktop]}
              onPress={(e) => e.stopPropagation()}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: COLORS.foreground,
                  }}
                >
                  Выберите возраст
                </Text>
                <TouchableOpacity onPress={() => setShowAgePicker(false)}>
                  <Feather name="x" size={24} color="#9CA3AF" />
                </TouchableOpacity>
              </View>
              <ScrollView showsVerticalScrollIndicator={false}>
                {AGE_OPTIONS.map((age) => (
                  <TouchableOpacity
                    key={age}
                    onPress={() => {
                      setFormData({ ...formData, age });
                      setShowAgePicker(false);
                    }}
                    style={{
                      paddingVertical: 16,
                      paddingHorizontal: 16,
                      borderRadius: 12,
                      backgroundColor:
                        formData.age === age ? "#F3F0FF" : "transparent",
                      marginBottom: 4,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: formData.age === age ? "700" : "400",
                        color:
                          formData.age === age ? "#6C5CE7" : COLORS.foreground,
                      }}
                    >
                      {age} лет
                    </Text>
                    {formData.age === age && (
                      <Feather name="check" size={20} color="#6C5CE7" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );

  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: "row" }}>
        <SideNav role={(user?.role as any) || "parent"} />
        <View style={{ flex: 1 }}>{pageContent}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      {pageContent}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  bgOrbTop: {
    position: "absolute",
    top: -70,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: `${ROLE_COLOR}10`,
  },
  bgOrbBottom: {
    position: "absolute",
    bottom: "18%",
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: `${ROLE_COLOR}06`,
  },
  gradientHeader: {
    paddingTop: 12,
    paddingBottom: 32,
    width: "100%",
  },
  headerBackButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  headerBackText: {
    color: COLORS.white,
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 13,
    fontWeight: "500",
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.foreground,
    marginLeft: 10,
  },
  cardDescription: {
    color: COLORS.mutedForeground,
    fontSize: 13,
    marginBottom: 18,
  },
  fieldStack: {
    gap: 16,
  },
  field: {
    width: "100%",
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 8,
  },
  requiredMark: {
    color: COLORS.destructive,
    fontWeight: "900",
    marginLeft: 4,
  },
  errorText: {
    color: COLORS.destructive,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 6,
  },
  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#F9FAFB",
    color: COLORS.foreground,
    fontSize: 15,
  },
  inputError: {
    borderColor: COLORS.destructive,
    backgroundColor: "#FFF7F7",
  },
  helpText: {
    color: COLORS.mutedForeground,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
  selectInput: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    backgroundColor: "#F9FAFB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  selectText: {
    color: COLORS.foreground,
    fontSize: 15,
    fontWeight: "500",
  },
  placeholderText: {
    color: COLORS.mutedForeground,
    fontWeight: "400",
  },
  segmented: {
    flexDirection: "row",
    gap: 10,
  },
  segment: {
    flex: 1,
    minHeight: 48,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: {
    borderColor: ROLE_COLOR,
    backgroundColor: `${ROLE_COLOR}12`,
  },
  segmentText: {
    color: COLORS.mutedForeground,
    fontWeight: "700",
  },
  segmentTextActive: {
    color: ROLE_COLOR,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: {
    borderColor: ROLE_COLOR,
    backgroundColor: `${ROLE_COLOR}12`,
  },
  chipText: {
    color: COLORS.mutedForeground,
    fontWeight: "700",
    fontSize: 13,
  },
  chipTextActive: {
    color: ROLE_COLOR,
  },
  inlineInputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  addButton: {
    width: 50,
    height: 50,
    backgroundColor: ROLE_COLOR,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "50%",
  },
  modalSheetDesktop: {
    width: 360,
    maxHeight: 520,
    borderRadius: RADIUS.xl,
    ...SHADOWS.lg,
  },
  agePickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  agePickerOverlayDesktop: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  footer: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    ...SHADOWS.lg,
  },
  submitErrorText: {
    color: COLORS.destructive,
    fontSize: 13,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 10,
  },
  submitButton: {
    overflow: "hidden",
    borderRadius: RADIUS.lg,
  },
  submitButtonDisabled: {
    opacity: 1,
  },
  submitGradient: {
    minHeight: 54,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: {
    color: COLORS.white,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  submitTextDisabled: {
    color: COLORS.mutedForeground,
  },
});
