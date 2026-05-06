import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "../../../components/ui/PressableScale";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "../../../constants/theme";
import { formatPhone } from "../../../lib/formatPhone";

export default function StaffAddScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState({ login: "", password: "" });
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const handleSubmit = () => {
    setLoading(true);
    // Simulate generation of credentials
    const login = formData.phone.replace(/\D/g, "");
    const password = Math.random().toString(36).slice(-8).toUpperCase();

    setTimeout(() => {
      setLoading(false);
      setCredentials({ login: login || "user_777", password });
      setShowCredentials(true);
    }, 1200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{ paddingHorizontal: paddingX, paddingTop: SPACING.md }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <PressableScale
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
                  scaleTo={0.88}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </PressableScale>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xl,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: "white",
                  }}
                >
                  Добавить учителя
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
        >
          {/* Info Banner */}
          <View
            style={{
              backgroundColor: "rgba(108, 92, 231, 0.05)",
              padding: SPACING.xl,
              borderRadius: RADIUS.xxl,
              marginBottom: SPACING.xxl,
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.lg,
              borderWidth: 1,
              borderColor: "rgba(108, 92, 231, 0.1)",
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                backgroundColor: COLORS.white,
                borderRadius: RADIUS.lg,
                alignItems: "center",
                justifyContent: "center",
                ...SHADOWS.sm,
              }}
            >
              <Feather name="send" size={20} color={COLORS.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.primary,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  marginBottom: 2,
                }}
              >
                Приглашение
              </Text>
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  fontSize: 12,
                  fontWeight: TYPOGRAPHY.weight.medium,
                  lineHeight: 16,
                }}
              >
                После добавления учитель получит СМС-приглашение в личный
                кабинет.
              </Text>
            </View>
          </View>

          <View
            style={{
              ...SHADOWS.strict,
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: SPACING.xl,
              gap: SPACING.xl,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                ФИО УЧИТЕЛЯ
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
                placeholder="Имя Фамилия"
                placeholderTextColor={COLORS.mutedForeground}
                value={formData.fullName}
                onChangeText={(v) => setFormData({ ...formData, fullName: v })}
              />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                НОМЕР ТЕЛЕФОНА
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
                placeholder="+7 777 777 7777"
                placeholderTextColor={COLORS.mutedForeground}
                keyboardType="phone-pad"
                value={formData.phone}
                onChangeText={(v) =>
                  setFormData({ ...formData, phone: formatPhone(v) })
                }
              />
            </View>

            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: COLORS.mutedForeground,
                  fontWeight: TYPOGRAPHY.weight.bold,
                  textTransform: "uppercase",
                  letterSpacing: 1,
                  marginBottom: 8,
                  marginLeft: 4,
                }}
              >
                Специализация
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
                placeholder="Напр. Робототехника"
                placeholderTextColor={COLORS.mutedForeground}
                value={formData.specialization}
                onChangeText={(v) =>
                  setFormData({ ...formData, specialization: v })
                }
              />
            </View>
          </View>

          <PressableScale
            onPress={handleSubmit}
            disabled={loading || !formData.fullName || !formData.phone}
            style={{
              ...SHADOWS.md,
              height: 60,
              borderRadius: RADIUS.xl,
              alignItems: "center",
              justifyContent: "center",
              marginTop: SPACING.xxxl,
              backgroundColor:
                loading || !formData.fullName || !formData.phone
                  ? COLORS.border
                  : COLORS.primary,
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: TYPOGRAPHY.weight.bold,
                fontSize: 16,
              }}
            >
              {loading ? "ОТПРАВКА..." : "ПРИГЛАСИТЬ УЧИТЕЛЯ"}
            </Text>
          </PressableScale>
        </MotiView>
      </ScrollView>

      {/* Credentials Modal */}
      {showCredentials && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{
              backgroundColor: "white",
              borderRadius: 32,
              padding: 32,
              width: "100%",
              maxWidth: 400,
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: 64,
                height: 64,
                backgroundColor: "#10B98115",
                borderRadius: 32,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
                alignSelf: "center",
              }}
            >
              <Feather name="check" size={32} color="#10B981" />
            </View>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: "#111827",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Учитель добавлен!
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 32,
              }}
            >
              Данные для входа автоматически отправлены по СМС:
            </Text>

            <View className="w-full gap-4 mb-8">
              <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  ЛОГИН
                </Text>
                <Text className="text-lg font-black text-gray-900">
                  {credentials.login}
                </Text>
              </View>
              <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <Text className="text-[10px] text-gray-400 font-bold uppercase mb-1">
                  ПАРОЛЬ
                </Text>
                <Text className="text-lg font-black text-gray-900">
                  {credentials.password}
                </Text>
              </View>
            </View>

            <PressableScale
              onPress={() => router.back()}
              style={{
                width: "100%",
                height: 56,
                backgroundColor: "#111827",
                borderRadius: 16,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>ГОТОВО</Text>
            </PressableScale>
          </MotiView>
        </View>
      )}
    </View>
  );
}
