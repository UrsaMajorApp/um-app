import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PressableScale } from "../../components/ui/PressableScale";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useIsDesktop } from "../../lib/useIsDesktop";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;
  const canSubmit = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);
    const result = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Не удалось отправить письмо");
      return;
    }

    setSent(true);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: "center",
            paddingVertical: isDesktop ? 24 : 12,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              width: "100%",
              maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
              paddingHorizontal: horizontalPadding,
              paddingTop: 8,
            }}
          >
            <PressableScale
              onPress={() => router.back()}
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
              }}
              scaleTo={0.93}
            >
              <Feather
                name="arrow-left"
                size={20}
                color={COLORS.mutedForeground}
              />
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  marginLeft: 8,
                  fontSize: 15,
                  fontWeight: "500",
                }}
              >
                Назад
              </Text>
            </PressableScale>

            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 400 }}
              style={{ marginBottom: 32 }}
            >
              <Text style={styles.title}>Восстановление пароля</Text>
              <Text style={styles.subtitle}>
                Укажите email аккаунта, и мы отправим ссылку для создания нового
                пароля.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
              style={styles.card}
            >
              {sent ? (
                <View style={{ alignItems: "center", gap: 14 }}>
                  <View style={styles.iconBox}>
                    <Feather name="mail" size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.sentTitle}>Письмо отправлено</Text>
                  <Text style={styles.sentText}>
                    Проверьте {email.trim().toLowerCase()} и перейдите по
                    ссылке, чтобы задать новый пароль.
                  </Text>
                  <PressableScale
                    onPress={() => router.replace("/login")}
                    scaleTo={0.93}
                  >
                    <Text style={styles.linkText}>Вернуться ко входу</Text>
                  </PressableScale>
                </View>
              ) : (
                <>
                  <Text style={styles.label}>EMAIL</Text>
                  <View style={styles.inputWrapper}>
                    <Feather
                      name="mail"
                      size={18}
                      color={COLORS.mutedForeground}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="you@example.com"
                      placeholderTextColor={COLORS.mutedForeground}
                      value={email}
                      onChangeText={(value) => setEmail(value.trim())}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl border border-gray-100"
                      style={styles.inputText}
                    />
                  </View>

                  {!!error && (
                    <MotiView
                      from={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={styles.errorBox}
                    >
                      <Text style={styles.errorText}>{error}</Text>
                    </MotiView>
                  )}

                  <PressableScale
                    onPress={handleSubmit}
                    disabled={!canSubmit || isSubmitting}
                    style={{ marginTop: 24 }}
                  >
                    <LinearGradient
                      colors={
                        canSubmit
                          ? [COLORS.primary, COLORS.secondary]
                          : [COLORS.muted, COLORS.muted]
                      }
                      style={styles.submitBtn}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text
                          style={[
                            styles.submitText,
                            !canSubmit && { color: COLORS.mutedForeground },
                          ]}
                        >
                          Отправить ссылку
                        </Text>
                      )}
                    </LinearGradient>
                  </PressableScale>
                </>
              )}
            </MotiView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.foreground,
    marginBottom: 8,
  },
  subtitle: {
    color: COLORS.mutedForeground,
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: "white",
    borderRadius: RADIUS.xxl,
    padding: 24,
    ...SHADOWS.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  inputIcon: {
    position: "absolute",
    left: 16,
    zIndex: 1,
  },
  inputText: {
    fontSize: 15,
    fontWeight: "500",
  },
  errorBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    color: "#B91C1C",
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },
  submitBtn: {
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  submitText: {
    fontSize: 18,
    fontWeight: "800",
    color: "white",
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: "center",
    justifyContent: "center",
  },
  sentTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.foreground,
    textAlign: "center",
  },
  sentText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.mutedForeground,
    textAlign: "center",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
});
