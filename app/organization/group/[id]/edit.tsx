import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  FormCard,
  LabeledTextInput,
  PrimaryActionButton,
} from "../../../../components/ui/FormControls";
import { GradientScreenHeader } from "../../../../components/ui/GradientScreenHeader";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
} from "../../../../constants/theme";
import { useOrgGroupById } from "../../../../hooks/useOrgData";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";
import { useIsDesktop } from "../../../../lib/useIsDesktop";

export default function GroupEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;
  const { group, loading: groupLoading } = useOrgGroupById(id as string);

  const [formData, setFormData] = useState({
    name: "",
    maxStudents: "",
    schedule: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!group) return;
    setFormData({
      name: group.name ?? "",
      maxStudents: String(group.capacity ?? ""),
      schedule: group.schedule ?? "",
    });
  }, [group]);

  const handleSubmit = async () => {
    if (!supabase || !isSupabaseConfigured || !id) {
      Alert.alert("Ошибка", "Supabase не настроен");
      return;
    }
    setLoading(true);
    const res = await supabase
      .from("org_groups")
      .update({
        name: formData.name,
        schedule: formData.schedule || null,
        capacity: parseInt(formData.maxStudents, 10) || 0,
      })
      .eq("id", id);
    setLoading(false);
    if (res.error) {
      Alert.alert("Ошибка", res.error.message);
      return;
    }
    router.back();
  };

  const handleArchive = async () => {
    if (!supabase || !isSupabaseConfigured || !id) return;
    setLoading(true);
    const res = await supabase
      .from("org_groups")
      .update({ active: false })
      .eq("id", id);
    setLoading(false);
    if (res.error) {
      Alert.alert("Ошибка", res.error.message);
      return;
    }
    router.back();
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <GradientScreenHeader
        title="Настройки группы"
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
                label="Название группы *"
                placeholder="Например: Старшая группа"
                value={formData.name}
                onChangeText={(val) => setFormData({ ...formData, name: val })}
              />

              <LabeledTextInput
                label="Расписание"
                placeholder="Напр: Пн, Ср 18:00"
                value={formData.schedule}
                onChangeText={(val) =>
                  setFormData({ ...formData, schedule: val })
                }
              />

              <LabeledTextInput
                label="Макс. учеников"
                placeholder="15"
                keyboardType="numeric"
                value={formData.maxStudents}
                onChangeText={(val) =>
                  setFormData({ ...formData, maxStudents: val })
                }
              />
            </View>
          </FormCard>

          <PrimaryActionButton
            onPress={handleSubmit}
            disabled={loading || groupLoading || !formData.name}
          >
            {loading ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ИЗМЕНЕНИЯ"}
          </PrimaryActionButton>

          <TouchableOpacity
            onPress={handleArchive}
            disabled={loading || groupLoading}
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
              АРХИВИРОВАТЬ ГРУППУ
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </View>
  );
}
