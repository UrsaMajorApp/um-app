import { COLORS, SPACING, TYPOGRAPHY } from "@/constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminLayout } from "./adminUtils";

export function AdminHeader({
  title,
  subtitle,
  trailing,
}: {
  title: string;
  subtitle: string;
  trailing?: React.ReactNode;
}) {
  const { paddingX } = useAdminLayout();
  return (
    <View style={{ backgroundColor: COLORS.primary, overflow: "hidden" }}>
      <LinearGradient
        colors={COLORS.gradients.header as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: Platform.OS === "ios" ? 0 : 20 }}
      >
        <SafeAreaView edges={["top"]}>
          <View
            style={{
              paddingHorizontal: paddingX,
              paddingTop: 12,
              paddingBottom: 28,
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.md,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.xxl,
                  fontWeight: "900",
                  color: COLORS.white,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.72)",
                  fontSize: TYPOGRAPHY.size.sm,
                  fontWeight: "600",
                  marginTop: 4,
                }}
              >
                {subtitle}
              </Text>
            </View>
            {trailing}
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
