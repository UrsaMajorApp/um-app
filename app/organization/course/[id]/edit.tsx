import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ICON_OPTIONS,
  LEVEL_OPTIONS,
  SKILL_OPTIONS,
  STATUS_OPTIONS,
  type CourseLevel as Level,
  type CourseStatus as Status,
} from "../../../../constants/courseOptions";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../../constants/theme";
import { useOrgCourseById, useOrgCourses } from "../../../../hooks/useOrgData";

export default function CourseEditScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { course, loading: courseLoading } = useOrgCourseById(id);
  const { updateCourse, deleteCourse } = useOrgCourses();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [status, setStatus] = useState<Status>("draft");
  const [icon, setIcon] = useState("book");
  const [skills, setSkills] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Populate form once course loads
  useEffect(() => {
    if (!course) return;
    setTitle(course.title);
    setDescription(course.description ?? "");
    setPrice(String(course.price));
    setLevel(course.level);
    setStatus(course.status);
    setIcon(course.icon);
    setSkills(course.skills ?? []);
  }, [course]);

  const toggleSkill = (s: string) =>
    setSkills((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s],
    );

  const handleSave = async () => {
    if (!title.trim() || !id) return;
    setSaving(true);
    const result = await updateCourse(id, {
      title: title.trim(),
      description: description.trim() || undefined,
      level,
      price: parseInt(price, 10) || 0,
      icon,
      skills,
      status,
    });
    setSaving(false);
    if (result.error) {
      Alert.alert("Ошибка", result.error);
      return;
    }
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Удалить курс?",
      `Курс «${title}» будет удалён навсегда. Это действие нельзя отменить.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            if (!id) return;
            const result = await deleteCourse(id);
            if (result.error) {
              Alert.alert("Ошибка", result.error);
            } else {
              router.back();
              router.back(); // pop both detail + edit
            }
          },
        },
      ],
    );
  };

  if (courseLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header as any}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: SPACING.md,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: "white",
                  }}
                >
                  Редактировать курс
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: paddingX,
            paddingTop: SPACING.xl,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
          >
            {/* Main fields */}
            <View
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
                gap: SPACING.xl,
              }}
            >
              <View>
                <Text style={labelStyle}>Название курса *</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="Например: Английский язык"
                  placeholderTextColor={COLORS.mutedForeground}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View>
                <Text style={labelStyle}>Описание</Text>
                <TextInput
                  style={[
                    inputStyle,
                    { height: undefined, minHeight: 120, paddingVertical: 12 },
                  ]}
                  placeholder="О чём этот курс?"
                  placeholderTextColor={COLORS.mutedForeground}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>

              <View>
                <Text style={labelStyle}>Цена (₸/мес) *</Text>
                <TextInput
                  style={inputStyle}
                  placeholder="0"
                  placeholderTextColor={COLORS.mutedForeground}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>
            </View>

            {/* Level + Status */}
            <View
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                marginTop: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
                gap: SPACING.xl,
              }}
            >
              <View>
                <Text style={labelStyle}>Уровень</Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: SPACING.sm,
                    marginTop: 8,
                  }}
                >
                  {LEVEL_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setLevel(opt.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: RADIUS.lg,
                        alignItems: "center",
                        backgroundColor:
                          level === opt.value
                            ? COLORS.primary
                            : COLORS.background,
                        borderWidth: 1,
                        borderColor:
                          level === opt.value ? COLORS.primary : COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color:
                            level === opt.value
                              ? "white"
                              : COLORS.mutedForeground,
                        }}
                      >
                        {opt.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text style={labelStyle}>Статус</Text>
                <View
                  style={{
                    flexDirection: "row",
                    gap: SPACING.sm,
                    marginTop: 8,
                  }}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <TouchableOpacity
                      key={opt.value}
                      onPress={() => setStatus(opt.value)}
                      style={{
                        flex: 1,
                        paddingVertical: 10,
                        borderRadius: RADIUS.lg,
                        alignItems: "center",
                        backgroundColor:
                          status === opt.value
                            ? opt.color + "20"
                            : COLORS.background,
                        borderWidth: 1.5,
                        borderColor:
                          status === opt.value ? opt.color : COLORS.border,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color:
                            status === opt.value
                              ? opt.color
                              : COLORS.mutedForeground,
                        }}
                      >
                        {opt.label.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Icon picker */}
            <View
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                marginTop: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text style={labelStyle}>Иконка курса</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: SPACING.sm,
                  marginTop: 8,
                }}
              >
                {ICON_OPTIONS.map((ic) => (
                  <TouchableOpacity
                    key={ic}
                    onPress={() => setIcon(ic)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.lg,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        icon === ic
                          ? "rgba(108,92,231,0.1)"
                          : COLORS.background,
                      borderWidth: 2,
                      borderColor: icon === ic ? COLORS.primary : COLORS.border,
                    }}
                  >
                    <Feather
                      name={ic as any}
                      size={20}
                      color={
                        icon === ic ? COLORS.primary : COLORS.mutedForeground
                      }
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Skills */}
            <View
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.xxl,
                padding: SPACING.xl,
                marginTop: SPACING.xl,
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <Text style={labelStyle}>Развиваемые навыки</Text>
              <View
                style={{
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: SPACING.sm,
                  marginTop: 8,
                }}
              >
                {SKILL_OPTIONS.map((skill) => {
                  const selected = skills.includes(skill);
                  return (
                    <TouchableOpacity
                      key={skill}
                      onPress={() => toggleSkill(skill)}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        borderRadius: RADIUS.full,
                        borderWidth: 1,
                        borderColor: selected ? COLORS.primary : COLORS.border,
                        backgroundColor: selected
                          ? COLORS.primary
                          : COLORS.white,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          color: selected ? "white" : COLORS.mutedForeground,
                        }}
                      >
                        {skill.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Save */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving || !title.trim()}
              style={{
                height: 60,
                borderRadius: RADIUS.xl,
                alignItems: "center",
                justifyContent: "center",
                marginTop: SPACING.xxl,
                backgroundColor:
                  saving || !title.trim() ? COLORS.border : COLORS.primary,
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: 16,
                }}
              >
                {saving ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ИЗМЕНЕНИЯ"}
              </Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              onPress={handleDelete}
              style={{
                height: 56,
                borderRadius: RADIUS.lg,
                alignItems: "center",
                justifyContent: "center",
                marginTop: SPACING.md,
              }}
            >
              <Text
                style={{
                  color: COLORS.destructive,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: 14,
                }}
              >
                УДАЛИТЬ КУРС
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const labelStyle = {
  fontSize: 10,
  fontWeight: TYPOGRAPHY.weight.bold,
  color: COLORS.mutedForeground,
  textTransform: "uppercase" as const,
  letterSpacing: 1,
  marginBottom: 8,
  marginLeft: 4,
};

const inputStyle = {
  height: 56,
  backgroundColor: COLORS.background,
  borderRadius: RADIUS.lg,
  paddingHorizontal: 16,
  fontSize: 16,
  fontWeight: TYPOGRAPHY.weight.medium,
  color: COLORS.foreground,
  borderWidth: 1,
  borderColor: COLORS.border,
};
