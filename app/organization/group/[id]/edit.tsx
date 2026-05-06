import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
  Alert,
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
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../../constants/theme";
import { useOrgGroupById } from "../../../../hooks/useOrgData";
import { isSupabaseConfigured, supabase } from "../../../../lib/supabase";

export default function GroupEditScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
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
      {/* Header - Unified Brand Style */}
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
                  Настройки группы
                </Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

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
          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View style={{ gap: SPACING.xl }}>
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
                  Название группы *
                </Text>
                <TextInput
                  style={{
                    height: 56,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    fontWeight: TYPOGRAPHY.weight.medium,
                    color: COLORS.foreground,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                  placeholder="Например: Старшая группа"
                  placeholderTextColor={COLORS.mutedForeground}
                  value={formData.name}
                  onChangeText={(val) =>
                    setFormData({ ...formData, name: val })
                  }
                />
              </View>

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
                  Расписание
                </Text>
                <TextInput
                  style={{
                    height: 56,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    fontWeight: TYPOGRAPHY.weight.medium,
                    color: COLORS.foreground,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                  placeholder="Напр: Пн, Ср 18:00"
                  placeholderTextColor={COLORS.mutedForeground}
                  value={formData.schedule}
                  onChangeText={(val) =>
                    setFormData({ ...formData, schedule: val })
                  }
                />
              </View>

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
                  Макс. учеников
                </Text>
                <TextInput
                  style={{
                    height: 56,
                    backgroundColor: COLORS.background,
                    borderRadius: RADIUS.lg,
                    paddingHorizontal: 16,
                    fontSize: 16,
                    fontWeight: TYPOGRAPHY.weight.medium,
                    color: COLORS.foreground,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                  placeholder="15"
                  placeholderTextColor={COLORS.mutedForeground}
                  keyboardType="numeric"
                  value={formData.maxStudents}
                  onChangeText={(val) =>
                    setFormData({ ...formData, maxStudents: val })
                  }
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading || groupLoading || !formData.name}
            style={{
              height: 60,
              borderRadius: RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
              marginTop: SPACING.xxl,
              backgroundColor:
                loading || groupLoading || !formData.name
                  ? COLORS.border
                  : COLORS.primary,
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
              {loading ? "СОХРАНЕНИЕ..." : "СОХРАНИТЬ ИЗМЕНЕНИЯ"}
            </Text>
          </TouchableOpacity>

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
