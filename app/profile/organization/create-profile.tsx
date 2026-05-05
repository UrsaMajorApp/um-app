import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";
import { PressableScale } from "../../../components/ui/PressableScale";
import { formatPhone } from "../../../lib/formatPhone";
import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

// Org brand colour — matches the ROLES entry in register.tsx
const ORG_COLOR = "#10B981";
const ORG_GRADIENT: [string, string] = ["#10B981", "#34D399"];

export default function CreateProfileOrganization() {
  const router = useRouter();
  const { user, finalizeRegistration } = useAuth();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const [orgName, setOrgName] = useState("");
  const [city, setCity] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  const [contactEmail, setContactEmail] = useState("");

  const handlePhoneChange = (text: string) => setContactPhone(formatPhone(text));

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const canSubmit =
    orgName.trim().length > 0 &&
    city.trim().length > 0 &&
    contactPerson.trim().length > 0 &&
    contactPhone.replace(/\D/g, "").length >= 10 &&
    contactEmail.trim().length > 0;

  const handleSubmit = async () => {
    setError(null);
    if (!orgName.trim()) { setError("Укажите название организации."); return; }
    if (!city.trim()) { setError("Укажите город."); return; }
    if (!contactPerson.trim()) { setError("Укажите ФИО ответственного лица."); return; }
    if (contactPhone.replace(/\D/g, "").length < 10) { setError("Укажите контактный телефон."); return; }
    if (!contactEmail.trim()) { setError("Укажите email."); return; }

    setSubmitting(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error: insertErr } = await supabase.from("organizations").insert({
          owner_user_id: user?.id ?? null,
          name: orgName.trim(),
          city: city.trim(),
          contact_person: contactPerson.trim(),
          phone: contactPhone.trim() || user?.phone || null,
          email: contactEmail.trim() || null,
          status: "new",
        });
        if (insertErr) { setError(insertErr.message); setSubmitting(false); return; }
      }
      await finalizeRegistration();
      setIsSuccess(true);
    } catch (e: any) {
      setError(e.message || "Произошла ошибка");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/register");
  };

  if (isSuccess) {
    return <SuccessView onHome={() => router.replace("/(tabs)/home")} />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar barStyle="dark-content" />

      {/* Background blobs — same as register.tsx */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
        <View style={{
          position: "absolute", top: -50, right: -50,
          width: 200, height: 200, borderRadius: 100,
          backgroundColor: `${ORG_COLOR}10`,
        }} />
        <View style={{
          position: "absolute", bottom: "20%", left: -80,
          width: 250, height: 250, borderRadius: 125,
          backgroundColor: `${ORG_COLOR}05`,
        }} />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, alignItems: "center", paddingVertical: isDesktop ? 24 : 12 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{
            flex: 1,
            width: "100%",
            maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
            paddingHorizontal: horizontalPadding,
            paddingTop: 8,
          }}>
            {/* Header nav — identical structure to register.tsx */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <PressableScale
                onPress={handleBack}
                style={{ flexDirection: "row", alignItems: "center" }}
                scaleTo={0.93}
              >
                <Feather name="arrow-left" size={20} color={COLORS.mutedForeground} />
                <Text style={{ color: COLORS.mutedForeground, marginLeft: 8, fontSize: 15, fontWeight: "500" }}>
                  Назад
                </Text>
              </PressableScale>

              {/* 4-dot indicator — this is the 4th step after role/phone/otp/name */}
              <View style={{ flexDirection: "row", gap: 6 }}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={{
                    width: i === 3 ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: i === 3 ? ORG_COLOR : COLORS.border,
                  }} />
                ))}
              </View>
            </View>

            {/* Title */}
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 500 }}
              style={{ marginBottom: 32 }}
            >
              <Text style={{ fontSize: 32, fontWeight: "900", color: COLORS.foreground, marginBottom: 8, letterSpacing: -0.5 }}>
                Об организации
              </Text>
              <Text style={{ color: COLORS.mutedForeground, fontSize: 16, lineHeight: 24 }}>
                Минимальные данные — документы можно добавить позже из кабинета
              </Text>
            </MotiView>

            {/* Form card — same style as register.tsx steps */}
            <MotiView
              from={{ opacity: 0, translateX: 10 }}
              animate={{ opacity: 1, translateX: 0 }}
              style={{ backgroundColor: "white", borderRadius: RADIUS.xxl, padding: 24, ...SHADOWS.md }}
            >
              <Field
                label="Название организации"
                icon="briefcase"
                value={orgName}
                onChange={setOrgName}
                placeholder="Например: RoboTech Academy"
                autoFocus
              />
              <Field
                label="Город"
                icon="map-pin"
                value={city}
                onChange={setCity}
                placeholder="Алматы"
              />

              {/* Divider */}
              <View style={{ height: 1, backgroundColor: COLORS.border, marginVertical: 8, marginBottom: 20 }} />

              <Field
                label="ФИО ответственного лица"
                icon="user"
                value={contactPerson}
                onChange={setContactPerson}
                placeholder="Иванов Иван Иванович"
              />
              <Field
                label="Контактный телефон"
                icon="phone"
                value={contactPhone}
                onChange={handlePhoneChange}
                placeholder="+7 777 777 7777"
                keyboardType="phone-pad"
                required
              />
              <Field
                label="Email"
                icon="mail"
                value={contactEmail}
                onChange={setContactEmail}
                placeholder="org@example.com"
                keyboardType="email-address"
                required
                last
              />
            </MotiView>

            {error && (
              <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ marginTop: 16, padding: 12, borderRadius: RADIUS.md, backgroundColor: "#FEE2E2", borderWidth: 1, borderColor: "#FCA5A5" }}
              >
                <Text style={{ color: "#B91C1C", textAlign: "center", fontSize: 13, fontWeight: "600" }}>{error}</Text>
              </MotiView>
            )}

            {/* Button — same shape/structure as register.tsx */}
            <PressableScale
              onPress={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{ marginTop: 32 }}
            >
              <LinearGradient
                colors={canSubmit ? ORG_GRADIENT : [COLORS.muted, COLORS.muted]}
                style={{ paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: "center", justifyContent: "center", ...SHADOWS.md }}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={{ fontSize: 18, fontWeight: "800", color: canSubmit ? "white" : COLORS.mutedForeground }}>
                    Создать профиль
                  </Text>
                )}
              </LinearGradient>
            </PressableScale>

            {/* Login link — same as register.tsx */}
            <View style={{ flexDirection: "row", justifyContent: "center", marginTop: 24, paddingBottom: 40 }}>
              <Text style={{ color: COLORS.mutedForeground, fontSize: 15 }}>Уже есть аккаунт? </Text>
              <PressableScale onPress={() => router.push("/login")} scaleTo={0.93}>
                <Text style={{ color: ORG_COLOR, fontWeight: "800", fontSize: 15 }}>Войти</Text>
              </PressableScale>
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// Field component — same as the one in register.tsx
function Field({
  label, icon, value, onChange, placeholder,
  keyboardType = "default", autoFocus = false, secure = false,
  showToggle, shown, last = false, required = false,
}: any) {
  return (
    <View style={{ marginBottom: last ? 0 : 20 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 13, fontWeight: "700", color: COLORS.foreground, textTransform: "uppercase", letterSpacing: 0.5, opacity: 0.7 }}>
          {label}
        </Text>
        {required && (
          <Text style={{ fontSize: 13, fontWeight: "700", color: ORG_COLOR, marginLeft: 3, opacity: 1 }}>*</Text>
        )}
      </View>
      <View style={{ position: "relative", justifyContent: "center" }}>
        <Feather name={icon} size={18} color={COLORS.mutedForeground} style={{ position: "absolute", left: 16, zIndex: 1 }} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder=""
          keyboardType={keyboardType}
          secureTextEntry={secure && !shown}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-4 bg-gray-50 rounded-2xl border border-gray-100"
          style={{ fontSize: 15, fontWeight: "500" }}
        />
        {!value && !!placeholder && (
          <Text
            numberOfLines={1}
            style={{
              position: "absolute",
              left: 48,
              right: 48,
              pointerEvents: "none",
              color: COLORS.mutedForeground,
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            {placeholder}
          </Text>
        )}
        {secure && showToggle && (
          <PressableScale onPress={showToggle} style={{ position: "absolute", right: 16, zIndex: 1 }} scaleTo={0.85}>
            <Feather name={shown ? "eye-off" : "eye"} size={18} color={COLORS.mutedForeground} />
          </PressableScale>
        )}
      </View>
    </View>
  );
}

function SuccessView({ onHome }: { onHome: () => void }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Background blobs */}
      <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
        <View style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: `${ORG_COLOR}10` }} />
        <View style={{ position: "absolute", bottom: "20%", left: -80, width: 250, height: 250, borderRadius: 125, backgroundColor: `${ORG_COLOR}05` }} />
      </View>

      <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 24 }}>
        <MotiView
          from={{ opacity: 0, scale: 0.9, translateY: 20 }}
          animate={{ opacity: 1, scale: 1, translateY: 0 }}
          style={{ backgroundColor: "white", borderRadius: RADIUS.xxl, padding: 32, alignItems: "center", ...SHADOWS.md }}
        >
          <MotiView
            from={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 200 }}
            style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: `${ORG_COLOR}15`, alignItems: "center", justifyContent: "center", marginBottom: 24 }}
          >
            <Feather name="check-circle" size={40} color={ORG_COLOR} />
          </MotiView>

          <Text style={{ fontSize: 26, fontWeight: "900", color: COLORS.foreground, textAlign: "center", marginBottom: 12, letterSpacing: -0.5 }}>
            Данные отправлены!
          </Text>
          <Text style={{ fontSize: 15, color: COLORS.mutedForeground, textAlign: "center", lineHeight: 24, marginBottom: 24 }}>
            Ваш профиль создан. В течение{" "}
            <Text style={{ color: ORG_COLOR, fontWeight: "700" }}>24 часов</Text>{" "}
            мы проверим данные и откроем доступ к кабинету.
          </Text>

          {/* Steps */}
          <View style={{ width: "100%", gap: 14, marginBottom: 32 }}>
            {[
              { label: "Профиль создан", done: true },
              { label: "Загрузить документы для верификации", done: false },
              { label: "Модерация администратором", done: false },
              { label: "Синяя галочка и выход в поиск", done: false },
            ].map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <View style={{
                  width: 24, height: 24, borderRadius: 12,
                  backgroundColor: item.done ? `${ORG_COLOR}20` : COLORS.muted,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Feather name={item.done ? "check" : "circle"} size={12} color={item.done ? ORG_COLOR : COLORS.mutedForeground} />
                </View>
                <Text style={{ fontSize: 14, color: item.done ? COLORS.foreground : COLORS.mutedForeground, fontWeight: item.done ? "700" : "400" }}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>

          <PressableScale onPress={onHome} style={{ width: "100%" }}>
            <LinearGradient
              colors={ORG_GRADIENT}
              style={{ paddingVertical: 18, borderRadius: RADIUS.xl, alignItems: "center", ...SHADOWS.md }}
            >
              <Text style={{ color: "white", fontWeight: "900", fontSize: 17 }}>Перейти в кабинет</Text>
            </LinearGradient>
          </PressableScale>
        </MotiView>
      </SafeAreaView>
    </View>
  );
}
