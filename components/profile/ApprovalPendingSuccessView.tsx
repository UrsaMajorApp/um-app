import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import type { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, RADIUS, SHADOWS } from "../../constants/theme";

type ApprovalStep = {
  label: string;
  done: boolean;
};

type ApprovalPendingSuccessViewProps = {
  accentColor: string;
  gradient: [string, string];
  title: string;
  description: ReactNode;
  buttonLabel: string;
  onHome: () => void;
  variant: "steps" | "notes";
  steps?: ApprovalStep[];
  noteText?: string;
  notes?: string[];
};

export function ApprovalPendingSuccessView({
  accentColor,
  gradient,
  title,
  description,
  buttonLabel,
  onHome,
  variant,
  steps = [],
  noteText,
  notes = [],
}: ApprovalPendingSuccessViewProps) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
        <View
          style={{
            position: "absolute",
            top: -50,
            right: -50,
            width: 200,
            height: 200,
            borderRadius: 100,
            backgroundColor: `${accentColor}10`,
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
            backgroundColor: `${accentColor}05`,
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
            ...(variant === "notes" ? SHADOWS.lg : SHADOWS.md),
          }}
        >
          {variant === "notes" ? (
            <View style={{ position: "relative", marginBottom: 28 }}>
              <MaterialCommunityIcons
                name="check-circle"
                size={96}
                color={COLORS.success}
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
                  backgroundColor: accentColor,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 3,
                  borderColor: "white",
                }}
              >
                <Feather name="clock" size={16} color="white" />
              </MotiView>
            </View>
          ) : (
            <MotiView
              from={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 200 }}
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: `${accentColor}15`,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 24,
              }}
            >
              <Feather name="check-circle" size={40} color={accentColor} />
            </MotiView>
          )}

          <Text
            style={{
              fontSize: 26,
              fontWeight: "900",
              color: COLORS.foreground,
              textAlign: "center",
              marginBottom: 12,
              letterSpacing: 0,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: variant === "notes" ? 16 : 15,
              color: COLORS.mutedForeground,
              textAlign: "center",
              lineHeight: 24,
              marginBottom: variant === "notes" ? 20 : 24,
            }}
          >
            {description}
          </Text>

          {variant === "notes" && noteText ? (
            <View
              style={{
                backgroundColor: `${accentColor}10`,
                paddingHorizontal: 20,
                paddingVertical: 14,
                borderRadius: RADIUS.md,
                marginBottom: 28,
              }}
            >
              <Text
                style={{ color: accentColor, fontWeight: "800", fontSize: 14 }}
              >
                {noteText}
              </Text>
            </View>
          ) : null}

          {variant === "steps" ? (
            <View style={{ width: "100%", gap: 14, marginBottom: 32 }}>
              {steps.map((item) => (
                <View
                  key={item.label}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: item.done
                        ? `${accentColor}20`
                        : COLORS.muted,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Feather
                      name={item.done ? "check" : "circle"}
                      size={12}
                      color={item.done ? accentColor : COLORS.mutedForeground}
                    />
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: item.done
                        ? COLORS.foreground
                        : COLORS.mutedForeground,
                      fontWeight: item.done ? "700" : "400",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={{ width: "100%", gap: 14, marginBottom: 36 }}>
              {notes.map((text) => (
                <View
                  key={text}
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
                      backgroundColor: accentColor,
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
          )}

          <TouchableOpacity
            onPress={onHome}
            style={{ width: "100%" }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={gradient}
              style={{
                paddingVertical: 18,
                borderRadius: RADIUS.xl,
                alignItems: "center",
                ...SHADOWS.md,
              }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 17 }}>
                {buttonLabel}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}
