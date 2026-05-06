import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
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
} from "$constants/theme";
import { useLearningMaterials } from "$hooks/useMentorData";
import { featherIconName } from "$lib/icons";
import { useIsDesktop } from "$lib/useIsDesktop";

export default function MentorLibrary() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;
  const { materials, loading } = useLearningMaterials();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: COLORS.primary }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: paddingX,
            paddingVertical: 16,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(255,255,255,0.2)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="arrow-left" size={20} color="white" />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: TYPOGRAPHY.size.xl,
              fontWeight: TYPOGRAPHY.weight.bold,
              color: "white",
            }}
          >
            База материалов
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 24,
          paddingBottom: 110,
        }}
      >
        <Text
          style={{
            fontSize: TYPOGRAPHY.size.lg,
            fontWeight: TYPOGRAPHY.weight.semibold,
            color: COLORS.foreground,
            marginBottom: 16,
          }}
        >
          Учебные материалы
        </Text>

        {loading && (
          <Text
            style={{
              textAlign: "center",
              marginTop: 20,
              color: COLORS.mutedForeground,
            }}
          >
            Загрузка...
          </Text>
        )}
        <View style={{ gap: 12 }}>
          {materials.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              style={{
                ...SHADOWS.strict,
                backgroundColor: COLORS.surface,
                borderRadius: RADIUS.lg,
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: COLORS.border,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: RADIUS.md,
                  backgroundColor: item.color + "15",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 14,
                }}
              >
                <Feather
                  name={featherIconName(item.icon_name, "file-text")}
                  size={22}
                  color={item.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.md,
                    fontWeight: TYPOGRAPHY.weight.semibold,
                    color: COLORS.foreground,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: COLORS.mutedForeground,
                    marginTop: 2,
                  }}
                >
                  {item.material_type} · {item.size_label}
                </Text>
              </View>
              <Feather
                name="download"
                size={18}
                color={COLORS.mutedForeground}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
