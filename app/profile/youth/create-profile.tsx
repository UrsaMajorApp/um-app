import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../../constants/theme";
import { useAuth } from "../../../contexts/AuthContext";

const ROLE_COLOR = "#3B82F6";
const ROLE_GRADIENT: [string, string] = ["#3B82F6", "#60A5FA"];

export default function CreateProfileTeen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: "",
    gender: "male",
    otherInterest: "",
    goals: "",
  });

  const [interests, setInterests] = useState<string[]>([]);

  const availableInterests = [
    "Рисование",
    "Музыка",
    "Спорт",
    "Программирование",
    "Фото/Видео",
    "Чтение",
    "Танцы",
    "Дизайн",
  ];

  const toggleInterest = (interest: string) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter((i) => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const addOtherInterest = () => {
    if (formData.otherInterest.trim() !== "") {
      setInterests([...interests, formData.otherInterest.trim()]);
      setFormData({ ...formData, otherInterest: "" });
    }
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/register");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <View style={{ flex: 1 }}>
        {/* Background blobs */}
        <View style={{ ...StyleSheet.absoluteFillObject, overflow: "hidden" }}>
          <View
            style={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              borderRadius: 100,
              backgroundColor: `${ROLE_COLOR}10`,
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
              backgroundColor: `${ROLE_COLOR}05`,
            }}
          />
        </View>

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
              {/* Header Nav */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 24,
                }}
              >
                <TouchableOpacity
                  onPress={handleBack}
                  style={{ flexDirection: "row", alignItems: "center" }}
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
                </TouchableOpacity>

                {/* Step dots */}
                <View style={{ flexDirection: "row", gap: 6 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <View
                      key={i}
                      style={{
                        width: i === 3 ? 24 : 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: i === 3 ? ROLE_COLOR : COLORS.border,
                      }}
                    />
                  ))}
                </View>
              </View>

              {/* Title Section */}
              <View style={{ marginBottom: 32 }}>
                <Text
                  style={{
                    fontSize: 32,
                    fontWeight: "900",
                    color: COLORS.foreground,
                    marginBottom: 8,
                    letterSpacing: -0.5,
                  }}
                >
                  Твой профиль
                </Text>
                <Text
                  style={{
                    color: COLORS.mutedForeground,
                    fontSize: 16,
                    lineHeight: 24,
                  }}
                >
                  Расскажи о себе — это поможет найти подходящие кружки и цели
                </Text>
              </View>

              {/* Personal Info Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Feather name="user" size={20} color={ROLE_COLOR} />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: COLORS.foreground,
                      marginLeft: 10,
                    }}
                  >
                    Личная информация
                  </Text>
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Имя</Text>
                  <TextInput
                    value={formData.firstName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, firstName: text })
                    }
                    placeholder="Введите имя"
                    placeholderTextColor={COLORS.mutedForeground}
                    style={styles.input}
                  />
                </View>

                <View style={{ marginBottom: 16 }}>
                  <Text style={styles.fieldLabel}>Фамилия</Text>
                  <TextInput
                    value={formData.lastName}
                    onChangeText={(text) =>
                      setFormData({ ...formData, lastName: text })
                    }
                    placeholder="Введите фамилию"
                    placeholderTextColor={COLORS.mutedForeground}
                    style={styles.input}
                  />
                </View>

                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Возраст</Text>
                    <TextInput
                      value={formData.age}
                      onChangeText={(text) =>
                        setFormData({
                          ...formData,
                          age: text.replace(/\D/g, ""),
                        })
                      }
                      placeholder="14"
                      maxLength={2}
                      placeholderTextColor={COLORS.mutedForeground}
                      keyboardType="numeric"
                      style={[
                        styles.input,
                        { textAlign: "center" },
                        formData.age.length > 0 &&
                        (parseInt(formData.age, 10) < 6 ||
                          parseInt(formData.age, 10) > 17)
                          ? {
                              borderColor: "#EF4444",
                              backgroundColor: "#FEF2F2",
                            }
                          : {},
                      ]}
                    />
                    {formData.age.length > 0 &&
                      (parseInt(formData.age, 10) < 6 ||
                        parseInt(formData.age, 10) > 17) && (
                        <Text
                          style={{
                            color: "#EF4444",
                            fontSize: 10,
                            marginTop: 4,
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          От 6 до 17 лет
                        </Text>
                      )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLabel}>Пол</Text>
                    <View
                      style={{
                        flexDirection: "row",
                        borderRadius: RADIUS.md,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        height: 50,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setFormData({ ...formData, gender: "male" })
                        }
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            formData.gender === "male"
                              ? ROLE_COLOR
                              : COLORS.muted,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            color:
                              formData.gender === "male"
                                ? "white"
                                : COLORS.mutedForeground,
                          }}
                        >
                          М
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          setFormData({ ...formData, gender: "female" })
                        }
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor:
                            formData.gender === "female"
                              ? "#EC4899"
                              : COLORS.muted,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            color:
                              formData.gender === "female"
                                ? "white"
                                : COLORS.mutedForeground,
                          }}
                        >
                          Ж
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>

              {/* Interests Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <MaterialCommunityIcons
                    name="star-four-points-outline"
                    size={20}
                    color={ROLE_COLOR}
                  />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: COLORS.foreground,
                      marginLeft: 10,
                    }}
                  >
                    Интересы
                  </Text>
                </View>

                <Text style={[styles.fieldLabel, { marginBottom: 12 }]}>
                  Что тебе интересно?
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 16,
                  }}
                >
                  {availableInterests.map((interest) => {
                    const isSelected = interests.includes(interest);
                    return (
                      <TouchableOpacity
                        key={interest}
                        onPress={() => toggleInterest(interest)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: RADIUS.xl,
                          borderWidth: 2,
                          borderColor: isSelected ? ROLE_COLOR : COLORS.border,
                          backgroundColor: isSelected
                            ? `${ROLE_COLOR}10`
                            : COLORS.muted,
                        }}
                      >
                        <Text
                          style={{
                            fontWeight: "600",
                            color: isSelected
                              ? ROLE_COLOR
                              : COLORS.mutedForeground,
                          }}
                        >
                          {interest}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                  Другое:
                </Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TextInput
                    value={formData.otherInterest}
                    onChangeText={(text) =>
                      setFormData({ ...formData, otherInterest: text })
                    }
                    placeholder="Введите свой интерес"
                    placeholderTextColor={COLORS.mutedForeground}
                    style={[styles.input, { flex: 1 }]}
                  />
                  <TouchableOpacity
                    onPress={addOtherInterest}
                    style={{
                      width: 50,
                      height: 50,
                      backgroundColor: ROLE_COLOR,
                      borderRadius: RADIUS.md,
                      alignItems: "center",
                      justifyContent: "center",
                      ...SHADOWS.sm,
                    }}
                  >
                    <Feather name="plus" size={22} color="white" />
                  </TouchableOpacity>
                </View>

                {/* Selected custom interests */}
                {interests.filter((i) => !availableInterests.includes(i))
                  .length > 0 && (
                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    {interests
                      .filter((i) => !availableInterests.includes(i))
                      .map((interest) => (
                        <View
                          key={interest}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: `${ROLE_COLOR}15`,
                            borderRadius: RADIUS.full,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                          }}
                        >
                          <Text
                            style={{
                              color: ROLE_COLOR,
                              fontSize: 13,
                              fontWeight: "600",
                              marginRight: 6,
                            }}
                          >
                            {interest}
                          </Text>
                          <TouchableOpacity
                            onPress={() => toggleInterest(interest)}
                          >
                            <Feather name="x" size={13} color={ROLE_COLOR} />
                          </TouchableOpacity>
                        </View>
                      ))}
                  </View>
                )}
              </View>

              {/* Goals Card */}
              <View
                style={{
                  backgroundColor: "white",
                  borderRadius: RADIUS.xxl,
                  padding: 24,
                  ...SHADOWS.md,
                  marginBottom: 20,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 20,
                  }}
                >
                  <Feather name="target" size={20} color={ROLE_COLOR} />
                  <Text
                    style={{
                      fontSize: 17,
                      fontWeight: "700",
                      color: COLORS.foreground,
                      marginLeft: 10,
                    }}
                  >
                    Цели
                  </Text>
                </View>
                <Text style={[styles.fieldLabel, { marginBottom: 8 }]}>
                  Чего ты хочешь достичь?
                </Text>
                <TextInput
                  value={formData.goals}
                  onChangeText={(text) =>
                    setFormData({ ...formData, goals: text })
                  }
                  placeholder="Опишите свои цели и стремления"
                  placeholderTextColor={COLORS.mutedForeground}
                  multiline
                  numberOfLines={4}
                  style={[
                    styles.input,
                    { height: 100, textAlignVertical: "top", paddingTop: 14 },
                  ]}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                disabled={
                  !(
                    formData.firstName.trim().length > 0 &&
                    parseInt(formData.age, 10) >= 6 &&
                    parseInt(formData.age, 10) <= 17
                  )
                }
                onPress={() => router.push("/profile/youth/testing")}
                style={{ marginTop: 8, marginBottom: 40 }}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    formData.firstName.trim().length > 0 &&
                    parseInt(formData.age, 10) >= 6 &&
                    parseInt(formData.age, 10) <= 17
                      ? ROLE_GRADIENT
                      : [COLORS.muted, COLORS.muted]
                  }
                  style={{
                    paddingVertical: 18,
                    borderRadius: RADIUS.xl,
                    alignItems: "center",
                    justifyContent: "center",
                    ...SHADOWS.md,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color:
                        formData.firstName.trim().length > 0 &&
                        parseInt(formData.age, 10) >= 6 &&
                        parseInt(formData.age, 10) <= 17
                          ? "white"
                          : COLORS.mutedForeground,
                    }}
                  >
                    Перейти к тестам
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.foreground,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
  },
  input: {
    backgroundColor: COLORS.muted,
    borderRadius: RADIUS.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500",
    color: COLORS.foreground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
