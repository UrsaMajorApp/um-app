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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AuthMethodSwitcher,
  type AuthMethod,
} from "../../components/auth/AuthMethodSwitcher";
import { PressableScale } from "../../components/ui/PressableScale";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../constants/theme";
import { useAuth, type UserRole } from "../../contexts/AuthContext";
import { useDevSettings } from "../../contexts/DevSettingsContext";
import { formatPhone } from "../../lib/formatPhone";
import { useIsDesktop } from "../../lib/useIsDesktop";

const ROLES: {
  title: string;
  description: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  role: UserRole;
  route: string;
  color: string;
  gradient: [string, string];
}[] = [
  {
    title: "Родитель",
    description: "Управление профилями детей и кружками",
    icon: "users",
    role: "parent",
    route: "/profile/parent/create-profile",
    color: "#6C5CE7",
    gradient: ["#6C5CE7", "#8B7FE8"],
  },
  {
    title: "Ученик",
    description: "Цели, достижения и поиск интересов",
    icon: "zap",
    role: "youth",
    route: "/profile/youth/create-profile",
    color: "#3B82F6",
    gradient: ["#3B82F6", "#60A5FA"],
  },
  {
    title: "Организация",
    description: "Управление клубами и сотрудниками",
    icon: "briefcase",
    role: "org",
    route: "/profile/organization/create-profile",
    color: "#10B981",
    gradient: ["#10B981", "#34D399"],
  },
  {
    title: "Ментор",
    description: "Планы развития и сопровождение",
    icon: "user-check",
    role: "mentor",
    route: "/profile/mentor/create-profile",
    color: "#EF4444",
    gradient: ["#EF4444", "#F87171"],
  },
];

export default function RegisterScreen() {
  const router = useRouter();
  const { sendRegistrationCode, registerWithIdentifier, devOtpCode, devMode } =
    useAuth();
  const { useRealOtp } = useDevSettings();

  // step 0 = role, step 1 = phone/email + password, step 2 = OTP for phone, step 3 = name
  const [step, setStep] = useState<number>(0);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedRoute, setSelectedRoute] = useState("");

  const [authMethod, setAuthMethod] = useState<AuthMethod>("phone");
  const [identifier, setIdentifier] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [confirmationEmail, setConfirmationEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const isEmail = authMethod === "email";
  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());
  const isValidPhone = identifier.replace(/\D/g, "").length >= 10;
  const handleIdentifierChange = (text: string) => {
    if (isEmail) {
      setIdentifier(text.trim());
      return;
    }
    setIdentifier(formatPhone(text));
  };

  const handleAuthMethodChange = (method: AuthMethod) => {
    setAuthMethod(method);
    setIdentifier("");
    setOtp("");
    setError("");
  };

  const handleAction = async () => {
    setError("");

    if (step === 0) {
      if (!selectedRole) {
        setError("Выберите роль для продолжения");
        return;
      }
      setStep(1);
      return;
    }

    if (step === 1) {
      if (isEmail ? !isValidEmail : !isValidPhone) {
        setError("Введите корректный телефон или email");
        return;
      }
      if (password.length < 6) {
        setError("Пароль должен содержать минимум 6 символов");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }

      setIsSubmitting(true);
      const result = await sendRegistrationCode(identifier);
      setIsSubmitting(false);

      if (!result.success) {
        setError(result.error || "Не удалось отправить код");
        return;
      }

      setOtp("");
      setStep(isEmail ? 3 : 2);
      return;
    }

    if (step === 2) {
      if (otp.length < 6) {
        setError("Введите 6-значный код");
        return;
      }
      setStep(3);
      return;
    }

    // step 3: name collected — create account
    if (!firstName.trim()) {
      setError("Введите имя");
      return;
    }

    setIsSubmitting(true);
    const result = await registerWithIdentifier(
      identifier,
      otp,
      password,
      selectedRole!,
      firstName,
      lastName,
    );
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || "Не удалось завершить регистрацию");
      return;
    }

    if (result.requiresEmailConfirmation) {
      setConfirmationEmail(identifier.trim().toLowerCase());
      return;
    }

    router.replace(selectedRoute as any);
  };

  const handleBack = () => {
    setError("");
    if (step === 0) {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace("/intro");
      return;
    }

    if (step === 3 && isEmail) setStep(1);
    else setStep(step - 1);
  };

  const isButtonEnabled = () => {
    if (step === 0) return selectedRole !== null;
    if (step === 1)
      return (
        (isEmail ? isValidEmail : isValidPhone) &&
        password.length >= 6 &&
        password === confirmPassword
      );
    if (step === 2) return otp.length === 6;
    return firstName.trim().length > 0;
  };

  const getButtonLabel = () => {
    if (step === 0) return "Далее";
    if (step === 1) return isEmail ? "Продолжить" : "Получить код";
    if (step === 2) return "Подтвердить";
    return "Создать аккаунт";
  };

  const currentRoleInfo = ROLES.find((r) => r.role === selectedRole);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar style="dark" />
      <View style={{ flex: 1 }}>
        {/* Background blobs for color */}
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: `${selectedRole ? currentRoleInfo?.color : COLORS.primary}10`,
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
              backgroundColor: `${selectedRole ? currentRoleInfo?.color : COLORS.secondary}05`,
            }}
          />
        </View>

        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: "center",
              paddingTop: isDesktop ? 24 : 12,
              paddingBottom: 20,
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
              {/* Header Nav */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <PressableScale
                  onPress={handleBack}
                  style={{ flexDirection: "row", alignItems: "center" }}
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

                {/* Step Indicator */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: step === i ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor:
                          step === i
                            ? selectedRole
                              ? currentRoleInfo?.color
                              : COLORS.primary
                            : COLORS.border,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Title Section */}
              <MotiView
                from={{ opacity: 0, translateY: 10 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{
                  type: "timing",
                  duration: Platform.OS === "web" ? 300 : 500,
                }}
                style={{ marginBottom: 32 }}
              >
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "900",
                    color: COLORS.foreground,
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }}
                >
                  {step === 0
                    ? "Давайте знакомиться"
                    : step === 1
                      ? "Создайте аккаунт"
                      : step === 2
                        ? "Подтвердите номер"
                        : "Как вас зовут?"}
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  {step === 0
                    ? "Выберите вашу роль, чтобы мы настроили приложение специально под вас"
                    : step === 1
                      ? "Введите телефон или email и придумайте пароль"
                      : step === 2
                        ? `Введите 6-значный код, отправленный на ${identifier}`
                        : "Введите ваше имя для профиля"}
                </Text>
              </MotiView>

              {/* Step 0: Role Selection — single MotiView for the whole list */}
              {step === 0 && (
                <MotiView
                  from={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 200, delay: 100 }}
                >
                  {ROLES.map((item) => {
                    const isSelected = selectedRole === item.role;
                    return (
                      <PressableScale
                        key={item.role}
                        onPress={() => {
                          setSelectedRole(item.role);
                          setSelectedRoute(item.route);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 18,
                          marginBottom: 12,
                          borderRadius: RADIUS.xl,
                          backgroundColor: isSelected ? "white" : COLORS.card,
                          borderWidth: 2,
                          borderColor: isSelected ? item.color : "transparent",
                          ...SHADOWS.sm,
                          elevation: isSelected ? 4 : 1,
                        }}
                      >
                        <LinearGradient
                          colors={item.gradient}
                          style={{
                            width: 54,
                            height: 54,
                            borderRadius: 16,
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 16,
                          }}
                        >
                          <Feather name={item.icon} size={24} color="white" />
                        </LinearGradient>

                        <View style={{ flex: 1, paddingRight: 12 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              marginBottom: 4,
                            }}
                          >
                            <Text
                              style={{
                                fontWeight: "800",
                                fontSize: 16,
                                color: COLORS.foreground,
                              }}
                            >
                              {item.title}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 13,
                              color: COLORS.mutedForeground,
                              lineHeight: 18,
                            }}
                          >
                            {item.description}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: 18,
                            height: 18,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MotiView
                            animate={{
                              opacity: isSelected ? 1 : 0,
                              scale: isSelected ? 1 : 0.7,
                            }}
                            transition={{ type: "spring" }}
                            style={{ pointerEvents: "none" }}
                          >
                            <View
                              style={{
                                width: 18,
                                height: 18,
                                borderRadius: 9,
                                backgroundColor: item.color,
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Feather name="check" size={11} color="white" />
                            </View>
                          </MotiView>
                        </View>
                      </PressableScale>
                    );
                  })}
                </MotiView>
              )}

              {/* Steps 1–3: persistent card — no remount between steps */}
              {step >= 1 && !confirmationEmail && (
                <MotiView
                  from={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 200 }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: RADIUS.xxl,
                    padding: 24,
                    ...SHADOWS.md,
                  }}
                >
                  {/* Inner content fades between steps without remounting the card */}

                  {/* Step 1: Phone + Password */}
                  {step === 1 && (
                    <MotiView
                      key="s1"
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "timing", duration: 150 }}
                    >
                      <AuthMethodSwitcher
                        value={authMethod}
                        onChange={handleAuthMethodChange}
                      />
                      <Field
                        label={isEmail ? "Email" : "Номер телефона"}
                        icon={isEmail ? "mail" : "phone"}
                        value={identifier}
                        onChange={handleIdentifierChange}
                        placeholder={
                          isEmail ? "you@example.com" : "+7 777 777 7777"
                        }
                        keyboardType={isEmail ? "email-address" : "phone-pad"}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      <Field
                        label="Пароль"
                        icon="lock"
                        value={password}
                        onChange={setPassword}
                        placeholder="Минимум 6 символов"
                        secure
                        showToggle={() => setShowPassword(!showPassword)}
                        shown={showPassword}
                      />
                      <Field
                        label="Подтвердите пароль"
                        icon="lock"
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        placeholder="Повторите пароль"
                        secure
                        showToggle={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        shown={showConfirmPassword}
                        last
                      />
                    </MotiView>
                  )}

                  {/* Step 2: OTP */}
                  {step === 2 && (
                    <MotiView
                      key="s2"
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "timing", duration: 150 }}
                    >
                      <View style={{ alignItems: "center" }}>
                        {!!devOtpCode && devMode && !useRealOtp && (
                          <View
                            style={{
                              backgroundColor: "#FEF9C3",
                              padding: 8,
                              borderRadius: 8,
                              marginBottom: 20,
                              width: "100%",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                color: "#854D0E",
                                fontSize: 12,
                                fontWeight: "bold",
                              }}
                            >
                              DEV MODE: {devOtpCode}
                            </Text>
                          </View>
                        )}
                        <TextInput
                          placeholder="000000"
                          placeholderTextColor={COLORS.border}
                          value={otp}
                          onChangeText={(t) =>
                            setOtp(t.replace(/\D/g, "").slice(0, 6))
                          }
                          keyboardType="number-pad"
                          autoFocus
                          style={
                            {
                              fontSize: 48,
                              fontWeight: "900",
                              textAlign: "center",
                              letterSpacing: 10,
                              color: currentRoleInfo?.color || COLORS.primary,
                              marginBottom: 20,
                              outlineWidth: 0,
                            } as any
                          }
                        />
                        <PressableScale
                          onPress={() => sendRegistrationCode(identifier)}
                          scaleTo={0.93}
                        >
                          <Text
                            style={{
                              color: COLORS.mutedForeground,
                              fontSize: 14,
                            }}
                          >
                            Не получили код?{" "}
                            <Text
                              style={{
                                color: currentRoleInfo?.color || COLORS.primary,
                                fontWeight: "bold",
                              }}
                            >
                              Отправить еще раз
                            </Text>
                          </Text>
                        </PressableScale>
                      </View>
                    </MotiView>
                  )}

                  {/* Step 3: Name */}
                  {step === 3 && (
                    <MotiView
                      key="s3"
                      from={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ type: "timing", duration: 150 }}
                    >
                      <Field
                        label="Имя"
                        icon="user"
                        value={firstName}
                        onChange={setFirstName}
                        placeholder="Как к вам обращаться?"
                        autoFocus
                      />
                      <Field
                        label="Фамилия (опционально)"
                        icon="user"
                        value={lastName}
                        onChange={setLastName}
                        placeholder="Ваша фамилия"
                        last
                      />
                    </MotiView>
                  )}
                </MotiView>
              )}

              {!!confirmationEmail && (
                <MotiView
                  from={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "timing", duration: 200 }}
                  style={{
                    backgroundColor: "white",
                    borderRadius: RADIUS.xxl,
                    padding: 24,
                    ...SHADOWS.md,
                  }}
                >
                  <View style={{ alignItems: "center", gap: 14 }}>
                    <View
                      style={{
                        width: 54,
                        height: 54,
                        borderRadius: 16,
                        backgroundColor: `${currentRoleInfo?.color || COLORS.primary}15`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name="mail"
                        size={24}
                        color={currentRoleInfo?.color || COLORS.primary}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "900",
                        color: COLORS.foreground,
                        textAlign: "center",
                      }}
                    >
                      Проверьте почту
                    </Text>
                    <Text
                      style={{
                        fontSize: 15,
                        lineHeight: 22,
                        color: COLORS.mutedForeground,
                        textAlign: "center",
                      }}
                    >
                      Мы отправили письмо для подтверждения на{" "}
                      {confirmationEmail}. После подтверждения вы сможете войти
                      с email и паролем.
                    </Text>
                  </View>
                </MotiView>
              )}

              {!!error && (
                <MotiView
                  from={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    marginTop: 16,
                    padding: 12,
                    borderRadius: RADIUS.md,
                    backgroundColor: "#FEE2E2",
                    borderWidth: 1,
                    borderColor: "#FCA5A5",
                  }}
                >
                  <Text
                    style={{
                      color: "#B91C1C",
                      textAlign: "center",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    {error}
                  </Text>
                </MotiView>
              )}
            </View>
          </ScrollView>
          <View style={styles.bottomBar}>
            <View
              style={{
                width: "100%",
                maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
                paddingHorizontal: horizontalPadding,
              }}
            >
              <PressableScale
                onPress={handleAction}
                disabled={
                  !!confirmationEmail || !isButtonEnabled() || isSubmitting
                }
              >
                <LinearGradient
                  colors={
                    isButtonEnabled()
                      ? currentRoleInfo?.gradient || [
                          COLORS.primary,
                          COLORS.secondary,
                        ]
                      : [COLORS.muted, COLORS.muted]
                  }
                  style={styles.footerActionButton}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "800",
                        color: isButtonEnabled()
                          ? "white"
                          : COLORS.mutedForeground,
                      }}
                    >
                      {getButtonLabel()}
                    </Text>
                  )}
                </LinearGradient>
              </PressableScale>

              <View style={styles.accountSwitchRow}>
                <Text style={styles.accountSwitchText}>Уже есть аккаунт? </Text>
                <PressableScale
                  onPress={() => router.push("/login")}
                  scaleTo={0.93}
                >
                  <Text
                    style={[
                      styles.accountSwitchLink,
                      { color: currentRoleInfo?.color || COLORS.primary },
                    ]}
                  >
                    Войти
                  </Text>
                </PressableScale>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  icon,
  value,
  onChange,
  placeholder,
  keyboardType = "default",
  secure = false,
  autoFocus = false,
  showToggle,
  shown,
  autoCapitalize,
  autoCorrect,
}: any) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: COLORS.foreground,
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: 0.5,
          opacity: 0.7,
        }}
      >
        {label}
      </Text>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <Feather
          name={icon}
          size={18}
          color={COLORS.mutedForeground}
          style={{ position: "absolute", left: 16, zIndex: 1 }}
        />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder=""
          placeholderTextColor={COLORS.mutedForeground}
          keyboardType={keyboardType as any}
          secureTextEntry={secure && !shown}
          autoFocus={autoFocus}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-100"
          style={{ fontSize: 15, fontWeight: "500" }}
        />
        {!value && (
          <Text
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              pointerEvents: "none",
              color: COLORS.mutedForeground,
              fontSize: 15,
              fontWeight: "500",
            }}
            numberOfLines={1}
          >
            {placeholder}
          </Text>
        )}
        {secure && showToggle && (
          <PressableScale
            onPress={showToggle}
            style={{ position: "absolute", right: 16, zIndex: 1 }}
            scaleTo={0.85}
          >
            <Feather
              name={shown ? "eye-off" : "eye"}
              size={18}
              color={COLORS.mutedForeground}
            />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    alignItems: "center",
    backgroundColor: COLORS.background,
    paddingTop: 12,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.border}80`,
  },
  footerActionButton: {
    paddingVertical: 18,
    borderRadius: RADIUS.xl,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  accountSwitchRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 32,
    marginTop: 10,
  },
  accountSwitchText: {
    color: COLORS.mutedForeground,
    fontSize: 15,
  },
  accountSwitchLink: {
    fontWeight: "800",
    fontSize: 15,
  },
});
