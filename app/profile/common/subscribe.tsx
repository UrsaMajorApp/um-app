import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSubscriptionPlans } from "../../../hooks/usePlatformData";
import { isWebMinWidth } from "../../../lib/useIsDesktop";

const { width } = Dimensions.get("window");
const IS_DESKTOP = isWebMinWidth(width, 900);

type Role = "parent" | "youth" | "child" | "young-adult" | "org" | "mentor";

function planKey(role: Role) {
  return `subscription_plan_${role}`;
}

export default function SubscribeScreen() {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const { plans, loading } = useSubscriptionPlans(role);

  useEffect(() => {
    AsyncStorage.getItem("user_role").then((v) =>
      setRole((v as Role) || "parent"),
    );
  }, []);

  useEffect(() => {
    if (!role) return;
    AsyncStorage.getItem(planKey(role)).then((v) => setSelected(v));
  }, [role]);

  async function choosePlan(title: string) {
    if (!role) return;
    await AsyncStorage.setItem(planKey(role), title);
    setSelected(title);
    router.replace("/(tabs)/home"); // после выбора подписки отправляем на home (первый таб)
  }

  function formatPrice(priceKzt: number, billingPeriod: string) {
    const period = billingPeriod === "month" ? "мес" : billingPeriod;
    return `${priceKzt.toLocaleString()} ₸ / ${period}`;
  }

  return (
    <LinearGradient colors={["#6C5CE7", "#ECEBFF"]} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: 60,
          paddingBottom: 120,
          paddingHorizontal: 20,
          alignItems: IS_DESKTOP ? "center" : "stretch",
        }}
      >
        <View style={{ width: IS_DESKTOP ? "50%" : "100%" }}>
          <MotiView
            from={{ opacity: 0, translateY: -10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ duration: 400 }}
            style={{ alignItems: "center", marginBottom: 10 }}
          >
            <Image
              source={require("../../../assets/logo/logo_white.png")}
              style={{ width: 160, height: 120, resizeMode: "contain" }}
            />
          </MotiView>

          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              textAlign: "center",
              color: "white",
              marginBottom: 10,
            }}
          >
            Подписки
          </Text>

          <Text
            style={{
              textAlign: "center",
              fontSize: 14,
              opacity: 0.8,
              color: "white",
              marginBottom: 28,
            }}
          >
            выберите подходящий план
          </Text>

          {!loading && plans.length === 0 && (
            <View
              style={{
                backgroundColor: "white",
                borderRadius: 24,
                padding: 24,
                alignItems: "center",
              }}
            >
              <Feather name="credit-card" size={28} color="#A1A1AA" />
              <Text
                style={{
                  marginTop: 12,
                  fontSize: 15,
                  color: "#71717A",
                  textAlign: "center",
                }}
              >
                Для этой роли пока нет активных тарифов.
              </Text>
            </View>
          )}

          {plans.map((plan, i) => {
            const isSelected = selected === plan.title;
            const isPopular = plan.popular === true;

            return (
              <MotiView
                key={`${plan.title}_${i}`}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ duration: 350, delay: i * 120 }}
                style={{
                  backgroundColor: "white",
                  borderRadius: 26,
                  padding: 22,
                  marginBottom: 24,
                  borderWidth: isPopular || isSelected ? 2 : 1,
                  borderColor: isSelected
                    ? "#6C5CE7"
                    : isPopular
                      ? "#6C5CE7"
                      : "rgba(15, 23, 42, 0.08)",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  {isPopular ? (
                    <View
                      style={{
                        backgroundColor: "#6C5CE7",
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontSize: 12 }}>
                        популярный
                      </Text>
                    </View>
                  ) : (
                    <View />
                  )}

                  {isSelected ? (
                    <View
                      style={{
                        backgroundColor: "#6C5CE7",
                        paddingVertical: 4,
                        paddingHorizontal: 10,
                        borderRadius: 10,
                        marginBottom: 10,
                        flexDirection: "row",
                        gap: 6,
                        alignItems: "center",
                      }}
                    >
                      <Feather name="check" size={14} color="white" />
                      <Text style={{ color: "white", fontSize: 12 }}>
                        выбран
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text
                  style={{ fontSize: 22, fontWeight: "700", marginBottom: 6 }}
                >
                  {plan.title}
                </Text>

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: "#6C5CE7",
                    marginBottom: 16,
                  }}
                >
                  {formatPrice(plan.price_kzt, plan.billing_period)}
                </Text>

                {plan.features.map((f, idx) => (
                  <View
                    key={idx}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 8,
                    }}
                  >
                    <Feather name="check" size={18} color="#6C5CE7" />
                    <Text style={{ marginLeft: 10, fontSize: 15 }}>{f}</Text>
                  </View>
                ))}

                <TouchableOpacity
                  onPress={() => choosePlan(plan.title)}
                  style={{
                    backgroundColor: isSelected ? "#6C5CE7" : "#6C5CE7",
                    marginTop: 20,
                    paddingVertical: 14,
                    borderRadius: 999,
                  }}
                >
                  <Text
                    style={{
                      textAlign: "center",
                      color: "white",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    {isSelected ? "оставить выбранным" : "выбрать"}
                  </Text>
                </TouchableOpacity>
              </MotiView>
            );
          })}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
