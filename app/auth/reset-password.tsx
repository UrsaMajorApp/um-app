import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
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
import { isSupabaseConfigured, supabase } from "../../lib/supabase";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;
  const canSubmit = password.length >= 6 && password === confirmPassword;

  useEffect(() => {
    if (Platform.OS === "web") return;

    const parseAndSetSession = async (url: string | null) => {
      if (!url || !supabase || !isSupabaseConfigured) return;
      const hashPart = url.split("#")[1] ?? "";
      const queryPart = url.split("?")[1]?.split("#")[0] ?? "";
      const hashParams = new URLSearchParams(hashPart);
      const queryParams = new URLSearchParams(queryPart);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const code = queryParams.get("code");

      if (accessToken && refreshToken) {
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
      } else if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }
    };

    Linking.getInitialURL().then(parseAndSetSession);
    const sub = Linking.addEventListener("url", ({ url }) =>
      parseAndSetSession(url),
    );
    return () => sub.remove();
  }, []);

  const handleSubmit = async () => {
    setError("");
    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    const result = await updatePassword(password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Не удалось обновить пароль");
      return;
    }

    setDone(true);
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
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 400 }}
              style={{ marginBottom: 32 }}
            >
              <Text style={styles.title}>Новый пароль</Text>
              <Text style={styles.subtitle}>
                Придумайте новый пароль для входа в аккаунт.
              </Text>
            </MotiView>

            <MotiView
              from={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 100 }}
              style={styles.card}
            >
              {done ? (
                <View style={{ alignItems: "center", gap: 14 }}>
                  <View style={styles.iconBox}>
                    <Feather name="check" size={24} color={COLORS.primary} />
                  </View>
                  <Text style={styles.doneTitle}>Пароль обновлен</Text>
                  <PressableScale
                    onPress={() => router.replace("/login")}
                    scaleTo={0.93}
                  >
                    <Text style={styles.linkText}>Войти</Text>
                  </PressableScale>
                </View>
              ) : (
                <>
                  <PasswordField
                    label="Новый пароль"
                    value={password}
                    onChange={setPassword}
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                  />
                  <PasswordField
                    label="Повторите пароль"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    shown={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                  />

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
                    style={{ marginTop: 4 }}
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
                          Сохранить пароль
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

function PasswordField({ label, value, onChange, shown, onToggle }: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather
          name="lock"
          size={18}
          color={COLORS.mutedForeground}
          style={styles.inputIcon}
        />
        <TextInput
          placeholder="Минимум 6 символов"
          placeholderTextColor={COLORS.mutedForeground}
          value={value}
          onChangeText={onChange}
          secureTextEntry={!shown}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-100"
          style={styles.inputText}
        />
        <PressableScale
          onPress={onToggle}
          style={styles.eyeIcon}
          scaleTo={0.85}
        >
          <Feather
            name={shown ? "eye-off" : "eye"}
            size={18}
            color={COLORS.mutedForeground}
          />
        </PressableScale>
      </View>
    </View>
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
  eyeIcon: {
    position: "absolute",
    right: 16,
    zIndex: 1,
  },
  errorBox: {
    marginBottom: 16,
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
  doneTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: COLORS.foreground,
    textAlign: "center",
  },
  linkText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: "800",
  },
});
