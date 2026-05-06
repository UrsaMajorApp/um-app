import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AnimatePresence, MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

const ROLE_COLOR = "#EF4444";
const ROLE_GRADIENT: [string, string] = ["#EF4444", "#F87171"];

const STEPS = [
  {
    id: 1,
    title: "Личная визитка",
    sub: "Это то, что родитель увидит в первую очередь",
  },
  {
    id: 2,
    title: "Профессиональный фильтр",
    sub: "Данные для системы и администратора",
  },
  {
    id: 3,
    title: "Маркетинг и продажи",
    sub: "Дополнительная информация для профиля",
  },
];

const CITIES = [
  "Астана",
  "Алматы",
  "Шымкент",
  "Караганда",
  "Актобе",
  "Тараз",
  "Павлодар",
  "Усть-Каменогорск",
  "Семей",
  "Атырау",
  "Костанай",
  "Кызылорда",
  "Уральск",
  "Петропавловск",
  "Актау",
];

const SPECIALIZATIONS = [
  "Психолог",
  "Профориентолог",
  "Тьютор по Hard Skills",
  "Тренер по Soft Skills",
  "Другая специализация",
];

const PREDEFINED_SKILLS = [
  "#Лидерство",
  "#ЭмоциональныйИнтеллект",
  "#IT",
  "#КритическоеМышление",
  "#Креативность",
  "#Коммуникация",
  "#Тайм-менеджмент",
  "#Командная работа",
  "#Программирование",
  "#Дизайн",
  "#Публичные выступления",
];

export default function MentorCreateProfile() {
  const router = useRouter();
  const { user, finalizeRegistration } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const [currentStep, setCurrentStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    city: "",
    languages: [] as string[],
    specialization: "",
    customSpecialization: "",
    experienceYears: "",
    education: "",
    skills: [] as string[],
    customSkill: "",
    pitch: "",
    bio: "",
    sessionPrice: "",
  });

  const toggleLanguage = (lang: string) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const addCustomSkill = () => {
    if (
      formData.customSkill.trim() &&
      !formData.skills.includes(formData.customSkill.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.customSkill.trim()],
        customSkill: "",
      }));
    }
  };

  const canProceedStep1 =
    formData.fullName.trim() && formData.city && formData.languages.length > 0;
  const canProceedStep2 =
    formData.specialization &&
    (formData.specialization !== "Другая специализация" ||
      formData.customSpecialization.trim()) &&
    formData.experienceYears &&
    formData.education.trim();
  const canSubmit =
    formData.pitch.trim() && formData.bio.trim() && formData.sessionPrice;

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    try {
      if (supabase && isSupabaseConfigured) {
        const finalSpec =
          formData.specialization === "Другая специализация"
            ? formData.customSpecialization
            : formData.specialization;

        const { error: insertErr } = await supabase
          .from("mentor_applications")
          .insert({
            user_id: user?.id ?? null,
            name: formData.fullName,
            specialization: finalSpec,
            city: formData.city,
            languages: JSON.stringify(formData.languages),
            experience: formData.experienceYears,
            education: formData.education,
            skills: JSON.stringify(formData.skills),
            pitch: formData.pitch,
            bio: formData.bio,
            price: parseInt(formData.sessionPrice) || 0,
            status: "pending",
          });

        if (insertErr) {
          setError(insertErr.message);
          return;
        }
      }
      await finalizeRegistration();
      setIsSuccess(true);
    } catch (e: any) {
      setError(e.message || "Ошибка при отправке");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/register");
  };

  if (isSuccess) {
    return <SuccessView onHome={() => router.replace("/(tabs)/home")} />;
  }

  const isCurrentStepValid =
    (currentStep === 1 && canProceedStep1) ||
    (currentStep === 2 && canProceedStep2) ||
    (currentStep === 3 && canSubmit);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Background blobs */}
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: `${ROLE_COLOR}10`,
            }}
          />
          <View
            style={{
              position: "absolute",
              bottom: "20%",
              left: -80,
              width: 250,
              height: 250,
              borderRadius: 125,
              backgroundColor: `${ROLE_COLOR}05`,
            }}
          />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              paddingVertical: isDesktop ? 24 : 12,
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={{
                flex: 1,
                width: "100%",
                maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
                paddingHorizontal: horizontalPadding,
                paddingTop: 8,
              }}
            >
              {/* Header Nav */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ flexDirection: "row", alignItems: "center" }}
                >
                  <Feather
                    name="arrow-left"
                    size={20}
                    color={COLORS.mutedForeground}
                  />
                  <Text
                    style={{
                      color: COLORS.mutedForeground,
                      marginLeft: 8,
                      fontSize: 15,
                      fontWeight: "500",
                    }}
                  >
                    Назад
                  </Text>
                </TouchableOpacity>

                {/* Step dots: 3 steps shown as dots 1–3, last dot active for current step */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: currentStep === i ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          currentStep === i
                            ? ROLE_COLOR
                            : i < currentStep
                              ? ROLE_COLOR
                              : COLORS.border,
                        opacity: i < currentStep ? 0.5 : 1,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Title Section */}
              <MotiView
                key={currentStep}
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 400 }}
                style={{ marginBottom: 32 }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "900",
                    color: COLORS.foreground,
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }}
                >
                  {STEPS[currentStep - 1].title}
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  {STEPS[currentStep - 1].sub}
                </Text>
              </MotiView>

              {/* Form Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                }}
              >
                <AnimatePresence exitBeforeEnter>
                  {currentStep === 1 && (
                    <MotiView
                      key="step1"
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      exit={{ opacity: 0, translateX: -20 }}
                      transition={{ type: "timing", duration: 400 }}
                    >
                      {/* Photo upload */}
                      <View style={{ alignItems: "center", marginBottom: 28 }}>
                        <View
                          style={{
                            width: 100,
                            height: 100,
                            borderRadius: 50,
                            backgroundColor: COLORS.muted,
                            borderWidth: 3,
                            borderColor: ROLE_COLOR,
                            justifyContent: "center",
                            alignItems: "center",
                            ...SHADOWS.sm,
                          }}
                        >
                          <Feather
                            name="camera"
                            size={28}
                            color={COLORS.mutedForeground}
                          />
                          <TouchableOpacity
                            style={{
                              position: "absolute",
                              bottom: 0,
                              right: 0,
                              width: 30,
                              height: 30,
                              borderRadius: 15,
                              backgroundColor: ROLE_COLOR,
                              alignItems: "center",
                              justifyContent: "center",
                              borderWidth: 2,
                              borderColor: "white",
                            }}
                          >
                            <Feather name="plus" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                        <Text
                          style={{
                            color: COLORS.mutedForeground,
                            marginTop: 10,
                            fontSize: 13,
                          }}
                        >
                          Загрузите профессиональное фото
                        </Text>
                      </View>

                      <InputField
                        label="ФИО *"
                        value={formData.fullName}
                        onChange={(t: string) =>
                          setFormData({ ...formData, fullName: t })
                        }
                        placeholder="Иванов Иван Иванович"
                        roleColor={ROLE_COLOR}
                      />

                      <Text style={styles.fieldLabel}>ГОРОД *</Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
                      >
                        {CITIES.map((c) => {
                          const active = formData.city === c;
                          return (
                            <TouchableOpacity
                              key={c}
                              onPress={() =>
                                setFormData({ ...formData, city: c })
                              }
                              style={{
                                paddingHorizontal: 18,
                                paddingVertical: 10,
                                borderRadius: RADIUS.xl,
                                backgroundColor: active
                                  ? ROLE_COLOR
                                  : COLORS.muted,
                                borderWidth: 1,
                                borderColor: active
                                  ? ROLE_COLOR
                                  : COLORS.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: active ? "white" : COLORS.foreground,
                                }}
                              >
                                {c}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>

                      <Text style={styles.fieldLabel}>ЯЗЫКИ ОБЩЕНИЯ *</Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 8,
                        }}
                      >
                        {["Казахский", "Русский", "Английский"].map((l) => {
                          const active = formData.languages.includes(l);
                          return (
                            <TouchableOpacity
                              key={l}
                              onPress={() => toggleLanguage(l)}
                              style={{
                                paddingHorizontal: 18,
                                paddingVertical: 10,
                                borderRadius: RADIUS.xl,
                                backgroundColor: active
                                  ? ROLE_COLOR
                                  : COLORS.muted,
                                borderWidth: 1,
                                borderColor: active
                                  ? ROLE_COLOR
                                  : COLORS.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 14,
                                  fontWeight: "600",
                                  color: active ? "white" : COLORS.foreground,
                                }}
                              >
                                {l}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </MotiView>
                  )}

                  {currentStep === 2 && (
                    <MotiView
                      key="step2"
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      exit={{ opacity: 0, translateX: -20 }}
                    >
                      <Text style={styles.fieldLabel}>СПЕЦИАЛИЗАЦИЯ *</Text>
                      <View style={{ gap: 8, marginBottom: 20 }}>
                        {SPECIALIZATIONS.map((s) => {
                          const active = formData.specialization === s;
                          return (
                            <TouchableOpacity
                              key={s}
                              onPress={() =>
                                setFormData({ ...formData, specialization: s })
                              }
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 16,
                                borderRadius: RADIUS.md,
                                borderWidth: 2,
                                borderColor: active
                                  ? ROLE_COLOR
                                  : COLORS.border,
                                backgroundColor: active
                                  ? ROLE_COLOR
                                  : COLORS.muted,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 15,
                                  fontWeight: "600",
                                  color: active ? "white" : COLORS.foreground,
                                }}
                              >
                                {s}
                              </Text>
                              {active && (
                                <Feather name="check" size={18} color="white" />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {formData.specialization === "Другая специализация" && (
                        <InputField
                          label="ВАША СПЕЦИАЛИЗАЦИЯ *"
                          value={formData.customSpecialization}
                          onChange={(t: string) =>
                            setFormData({
                              ...formData,
                              customSpecialization: t,
                            })
                          }
                          placeholder="Введите вашу специализацию"
                          roleColor={ROLE_COLOR}
                        />
                      )}

                      <InputField
                        label="ОПЫТ РАБОТЫ (ЛЕТ) *"
                        value={formData.experienceYears}
                        onChange={(t: string) =>
                          setFormData({
                            ...formData,
                            experienceYears: t.replace(/\D/g, ""),
                          })
                        }
                        placeholder="5"
                        keyboardType="numeric"
                        roleColor={ROLE_COLOR}
                      />
                      <InputField
                        label="УЧЕБНОЕ ЗАВЕДЕНИЕ *"
                        value={formData.education}
                        onChange={(t: string) =>
                          setFormData({ ...formData, education: t })
                        }
                        placeholder="КазНУ им. аль-Фараби"
                        roleColor={ROLE_COLOR}
                      />

                      <Text style={styles.fieldLabel}>
                        КЛЮЧЕВЫЕ НАВЫКИ (ТЕГИ)
                      </Text>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        {PREDEFINED_SKILLS.map((s) => {
                          const active = formData.skills.includes(s);
                          return (
                            <TouchableOpacity
                              key={s}
                              onPress={() => toggleSkill(s)}
                              style={{
                                paddingHorizontal: 14,
                                paddingVertical: 8,
                                borderRadius: RADIUS.xl,
                                backgroundColor: active
                                  ? `${ROLE_COLOR}15`
                                  : COLORS.muted,
                                borderWidth: 1,
                                borderColor: active
                                  ? ROLE_COLOR
                                  : COLORS.border,
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: active ? "700" : "500",
                                  color: active
                                    ? ROLE_COLOR
                                    : COLORS.foreground,
                                }}
                              >
                                {s}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginBottom: 20,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            position: "relative",
                            justifyContent: "center",
                          }}
                        >
                          <TextInput
                            style={styles.input}
                            placeholder=""
                            value={formData.customSkill}
                            onChangeText={(t) =>
                              setFormData({ ...formData, customSkill: t })
                            }
                          />
                          {!formData.customSkill && (
                            <Text
                              numberOfLines={1}
                              style={{
                                position: "absolute",
                                left: 22,
                                right: 16,
                                pointerEvents: "none",
                                color: COLORS.mutedForeground,
                                fontSize: 15,
                                fontWeight: "500",
                              }}
                            >
                              Добавить свой навык
                            </Text>
                          )}
                        </View>
                        <TouchableOpacity
                          onPress={addCustomSkill}
                          style={{
                            width: 50,
                            height: 50,
                            backgroundColor: ROLE_COLOR,
                            borderRadius: RADIUS.md,
                            alignItems: "center",
                            justifyContent: "center",
                            ...SHADOWS.sm,
                          }}
                        >
                          <Feather name="plus" size={20} color="white" />
                        </TouchableOpacity>
                      </View>

                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 18,
                          borderStyle: "dashed",
                          borderWidth: 2,
                          borderColor: ROLE_COLOR,
                          borderRadius: RADIUS.md,
                          backgroundColor: `${ROLE_COLOR}05`,
                        }}
                      >
                        <Feather name="upload" size={20} color={ROLE_COLOR} />
                        <Text
                          style={{
                            color: ROLE_COLOR,
                            fontWeight: "700",
                            marginLeft: 10,
                          }}
                        >
                          Диплом/сертификат (PDF, JPG)
                        </Text>
                      </TouchableOpacity>
                    </MotiView>
                  )}

                  {currentStep === 3 && (
                    <MotiView
                      key="step3"
                      from={{ opacity: 0, translateX: 20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      exit={{ opacity: 0, translateX: -20 }}
                    >
                      <InputField
                        label="ЧЕМУ ОБУЧИТЕ? *"
                        value={formData.pitch}
                        onChange={(t: string) =>
                          setFormData({ ...formData, pitch: t })
                        }
                        placeholder="Научу вашего ребенка не бояться публичных выступлений"
                        maxLength={60}
                        roleColor={ROLE_COLOR}
                      />
                      <InputField
                        label="О СЕБЕ И МЕТОДЕ *"
                        value={formData.bio}
                        onChange={(t: string) =>
                          setFormData({ ...formData, bio: t })
                        }
                        placeholder="Расскажите про свои методики и результаты учеников..."
                        multiline
                        height={150}
                        roleColor={ROLE_COLOR}
                      />
                      <InputField
                        label="СТОИМОСТЬ СЕССИИ (60 МИН) *"
                        value={formData.sessionPrice}
                        onChange={(t: string) =>
                          setFormData({
                            ...formData,
                            sessionPrice: t.replace(/\D/g, ""),
                          })
                        }
                        placeholder="10 000"
                        keyboardType="numeric"
                        suffix="₸"
                        roleColor={ROLE_COLOR}
                      />
                    </MotiView>
                  )}
                </AnimatePresence>

                {error && (
                  <View
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: RADIUS.md,
                      backgroundColor: "#FEE2E2",
                      borderWidth: 1,
                      borderColor: "#FCA5A5",
                    }}
                  >
                    <Text
                      style={{
                        color: "#B91C1C",
                        textAlign: "center",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Button */}
              <TouchableOpacity
                onPress={
                  currentStep < 3
                    ? () => setCurrentStep((s) => s + 1)
                    : handleSubmit
                }
                disabled={!isCurrentStepValid || submitting}
                style={{ marginTop: 24, marginBottom: 40 }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    isCurrentStepValid
                      ? ROLE_GRADIENT
                      : [COLORS.muted, COLORS.muted]
                  }
                  style={{
                    paddingVertical: 18,
                    borderRadius: RADIUS.xl,
                    alignItems: "center",
                    justifyContent: "center",
                    ...SHADOWS.md,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: isCurrentStepValid
                          ? "white"
                          : COLORS.mutedForeground,
                      }}
                    >
                      {currentStep === 3 ? "Отправить на модерацию" : "Далее"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  multiline = false,
  height,
  suffix,
  maxLength,
  roleColor,
}: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder=""
          keyboardType={keyboardType as any}
          multiline={multiline}
          maxLength={maxLength}
          style={[
            styles.input,
            multiline && {
              height: height || 100,
              textAlignVertical: "top",
              paddingTop: 16,
            },
            suffix && { paddingRight: 44 },
          ]}
        />
        {!value && !!placeholder && (
          <Text
            numberOfLines={multiline ? undefined : 1}
            style={{
              position: "absolute",
              left: 22,
              right: suffix ? 44 : 16,
              top: multiline ? 16 : undefined,
              pointerEvents: "none",
              color: COLORS.mutedForeground,
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            {placeholder}
          </Text>
        )}
        {suffix && (
          <Text
            style={{
              position: "absolute",
              right: 16,
              fontSize: 17,
              fontWeight: "700",
              color: COLORS.mutedForeground,
            }}
          >
            {suffix}
          </Text>
        )}
        {maxLength && (
          <Text
            style={{
              position: "absolute",
              right: 10,
              bottom: -18,
              fontSize: 10,
              color: COLORS.mutedForeground,
            }}
          >
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </View>
  );
}

function SuccessView({ onHome }: { onHome: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Background blobs */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: `${ROLE_COLOR}10`,
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: "20%",
            left: -80,
            width: 250,
            height: 250,
            borderRadius: 125,
            backgroundColor: `${ROLE_COLOR}05`,
          }}
        />
      </View>
      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          style={{
            backgroundColor: "white",
            borderRadius: RADIUS.xxl,
            padding: 32,
            alignItems: "center",
            ...SHADOWS.lg,
          }}
        >
          <View style={{ position: "relative", marginBottom: 28 }}>
            <MaterialCommunityIcons
              name="check-circle"
              size={96}
              color="#10B981"
            />
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 500 }}
              style={{
                position: "absolute",
                bottom: 4,
                right: 4,
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: ROLE_COLOR,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 3,
                borderColor: "white",
              }}
            >
              <Feather name="clock" size={16} color="white" />
            </MotiView>
          </View>

          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: COLORS.foreground,
              textAlign: "center",
              marginBottom: 12,
              letterSpacing: -0.5,
            }}
          >
            Данные успешно отправлены!
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: COLORS.mutedForeground,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: 20,
            }}
          >
            Мы проверяем ваш диплом и другие документы.
          </Text>

          <View
            style={{
              backgroundColor: `${ROLE_COLOR}10`,
              paddingHorizontal: 20,
              paddingVertical: 14,
              borderRadius: RADIUS.md,
              marginBottom: 28,
            }}
          >
            <Text
              style={{ color: ROLE_COLOR, fontWeight: "800", fontSize: 14 }}
            >
              ⏱ Обычно это занимает до 24 часов
            </Text>
          </View>

          <View style={{ width: "100%", gap: 14, marginBottom: 36 }}>
            {[
              "Мы отправим уведомление на вашу почту, как только проверка будет завершена",
              "После одобрения вы получите доступ к платформе и сможете начать работу",
            ].map((text, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: ROLE_COLOR,
                    marginTop: 8,
                  }}
                />
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    color: COLORS.mutedForeground,
                    lineHeight: 22,
                  }}
                >
                  {text}
                </Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            onPress={onHome}
            style={{ width: "100%" }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={ROLE_GRADIENT}
              style={{
                paddingVertical: 18,
                borderRadius: RADIUS.xl,
                alignItems: "center",
                ...SHADOWS.md,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 17 }}>
                Вернуться на главную
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  input: {
    backgroundColor: COLORS.muted,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.foreground,
  },
});
