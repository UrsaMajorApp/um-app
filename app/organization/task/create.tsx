import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FormCard,
  LabeledTextInput,
  PrimaryActionButton,
} from "$components/ui/FormControls";
import { GradientScreenHeader } from "$components/ui/GradientScreenHeader";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "$constants/theme";
import { useIsDesktop } from "$lib/useIsDesktop";

export default function TaskCreateScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    groupId: "",
    dueDate: "",
    xp: "50",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.back();
    }, 1000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Новое задание"
        paddingX={paddingX}
        onBack={() => router.back()}
      />

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          <FormCard>
            <View style={{ gap: SPACING.xl }}>
              <LabeledTextInput
                label="Название задания *"
                placeholder="Например: Домашняя работа №1"
                value={formData.title}
                onChangeText={(val) =>
                  setFormData({ ...formData, title: val })
                }
              />

              <LabeledTextInput
                label="Инструкции"
                placeholder="Что нужно сделать?"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={formData.description}
                onChangeText={(val) =>
                  setFormData({ ...formData, description: val })
                }
                inputStyle={{
                  height: undefined,
                  minHeight: 120,
                  paddingVertical: 12,
                }}
              />

              <LabeledTextInput
                label="XP за выполнение"
                placeholder="50"
                keyboardType="numeric"
                value={formData.xp}
                onChangeText={(val) => setFormData({ ...formData, xp: val })}
              />

              <View>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: COLORS.mutedForeground,
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                    marginLeft: 4,
                  }}
                >
                  Срок выполнения
                </Text>
                <TouchableOpacity
                  style={{
                    height: 56,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: TYPOGRAPHY.weight.medium,
                      color: formData.dueDate
                        ? COLORS.foreground
                        : COLORS.mutedForeground,
                    }}
                  >
                    {formData.dueDate || "Выберите дату"}
                  </Text>
                  <Feather name="calendar" size={18} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </FormCard>

          <PrimaryActionButton
            onPress={handleSubmit}
            disabled={loading || !formData.title}
          >
            {loading ? "СОЗДАНИЕ..." : "ОПУБЛИКОВАТЬ ЗАДАНИЕ"}
          </PrimaryActionButton>
        </MotiView>
      </ScrollView>
    </View>
  );
}
