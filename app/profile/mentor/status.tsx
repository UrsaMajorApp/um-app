import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
   Platform,
   Text,
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
   TYPOGRAPHY,
} from "../../../constants/theme";
import { useIsDesktop } from "../../../lib/useIsDesktop";

export default function MentorStatusPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            width: "100%",
            maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
            alignSelf: "center",
            paddingHorizontal: horizontalPadding,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <MotiView
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 500 }}
            style={{ alignItems: "center", marginBottom: 32 }}
          >
            <View
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: COLORS.primary + "15",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Feather name="clock" size={48} color={COLORS.primary} />
            </View>

            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              Заявка на рассмотрении
            </Text>

            <Text
              style={{
                fontSize: TYPOGRAPHY.size.md,
                color: COLORS.mutedForeground,
                textAlign: "center",
                lineHeight: 24,
                paddingHorizontal: 20,
              }}
            >
              Мы получили вашу анкету ментора. Администратор проверит информацию
              и примет решение. Вы получите уведомление, когда доступ будет
              открыт.
            </Text>
          </MotiView>

          <View style={{ width: "100%", paddingHorizontal: 20 }}>
            <View
              style={{
                backgroundColor: COLORS.secondary,
                padding: 16,
                borderRadius: RADIUS.lg,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 40,
              }}
            >
              <Feather name="info" size={20} color={COLORS.mutedForeground} />
              <Text
                style={{
                  flex: 1,
                  fontSize: TYPOGRAPHY.size.sm,
                  color: COLORS.mutedForeground,
                }}
              >
                Обычно проверка занимает от 1 до 3 рабочих дней.
              </Text>
            </View>

            <Text
              style={{
                textAlign: "center",
                color: COLORS.mutedForeground,
                fontSize: 12,
                marginBottom: 12,
                letterSpacing: 0.5,
                fontWeight: "600",
                textTransform: "uppercase",
              }}
            >
              DEV Режим
            </Text>
            <TouchableOpacity
              onPress={() => router.replace("/(tabs)/mentor" as any)}
              style={{
                width: "100%",
                paddingVertical: 16,
                backgroundColor: COLORS.primary,
                borderRadius: RADIUS.md,
                alignItems: "center",
                ...SHADOWS.md,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: TYPOGRAPHY.weight.bold,
                  fontSize: TYPOGRAPHY.size.md,
                }}
              >
                Перейти на дашборд ментора
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace("/login")}
              style={{
                width: "100%",
                paddingVertical: 16,
                marginTop: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.foreground,
                  fontWeight: TYPOGRAPHY.weight.semibold,
                }}
              >
                Вернуться на главную
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
