import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
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
} from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

async function resolveOrgId(userId: string): Promise<string | null> {
  if (!supabase) return null;
  const res = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_user_id", userId)
    .limit(1)
    .maybeSingle();
  return res.data?.id ?? null;
}

export default function GroupCreateScreen() {
  const router = useRouter();
  const { courseId } = useLocalSearchParams();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const [formData, setFormData] = useState({
    name: "",
    maxStudents: "12",
    schedule: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!supabase || !isSupabaseConfigured || !user?.id) {
      Alert.alert("Ошибка", "Supabase не настроен");
      return;
    }
    setLoading(true);
    const orgId = await resolveOrgId(user.id);
    if (!orgId) {
      setLoading(false);
      Alert.alert("Ошибка", "Организация не найдена");
      return;
    }
    const res = await supabase.from("org_groups").insert({
      org_id: orgId,
      name: formData.name,
      course_id: typeof courseId === "string" ? courseId : null,
      schedule: formData.schedule || null,
      capacity: parseInt(formData.maxStudents, 10) || 0,
      active: true,
    });
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
                  Создать группу
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
                  placeholder="Напр: Утренняя группа"
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
                  placeholder="Напр: Вт, Чт 16:00"
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
                  placeholder="12"
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
            disabled={loading || !formData.name}
            style={{
              height: 60,
              borderRadius: RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
              marginTop: SPACING.xxl,
              backgroundColor:
                loading || !formData.name ? COLORS.border : COLORS.primary,
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
              {loading ? "СОЗДАНИЕ..." : "СОЗДАТЬ ГРУППУ"}
            </Text>
          </TouchableOpacity>
        </MotiView>
      </ScrollView>
    </View>
  );
}
