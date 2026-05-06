import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React from "react";
import {
  Platform,
  ScrollView,
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
  SPACING,
  TYPOGRAPHY,
} from "../../../constants/theme";
import { useOrgApplications } from "../../../hooks/useOrgData";
import { useIsDesktop } from "../../../lib/useIsDesktop";

export default function OrgApplicationsScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const paddingX = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : SPACING.xl;

  const { apps, approve, reject: rejectApp, loading } = useOrgApplications();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(52, 199, 89, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.success,
              }}
            >
              ОПЛАЧЕНО
            </Text>
          </View>
        );
      case "awaiting_payment":
        return (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(245, 158, 11, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: "#F59E0B",
              }}
            >
              ОЖИДАЕТ
            </Text>
          </View>
        );
      case "activated":
        return (
          <View
            style={{
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(59, 130, 246, 0.1)",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: "#3B82F6",
              }}
            >
              АКТИВЕН
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  const handleAction = (id: string, action: "approve" | "reject") => {
    if (action === "approve") {
      approve(id);
    } else {
      rejectApp(id);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header - Unified Brand Style */}
      <View
        style={{
          backgroundColor: COLORS.primary,
          borderBottomLeftRadius: RADIUS.xxl,
          borderBottomRightRadius: RADIUS.xxl,
          overflow: "hidden",
        }}
      >
        <LinearGradient
          colors={COLORS.gradients.header as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: SPACING.xl }}
        >
          <SafeAreaView edges={["top"]}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: paddingX,
                paddingTop: SPACING.md,
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: TYPOGRAPHY.size.xxl,
                    fontWeight: TYPOGRAPHY.weight.bold,
                    color: "white",
                  }}
                >
                  Заявки
                </Text>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: TYPOGRAPHY.size.sm,
                    fontWeight: TYPOGRAPHY.weight.medium,
                    marginTop: 2,
                  }}
                >
                  Новые поступления
                </Text>
              </View>
              <TouchableOpacity
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: RADIUS.md,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather name="filter" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: SPACING.xl,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Summary Card */}
        <View
          style={{
            ...SHADOWS.strict,
            backgroundColor: COLORS.white,
            borderRadius: RADIUS.xxl,
            padding: SPACING.xl,
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: SPACING.xxl,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        >
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.primary,
              }}
            >
              {apps.length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Заявок
            </Text>
          </View>
          <View
            style={{ width: 1, height: "100%", backgroundColor: COLORS.border }}
          />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.success,
              }}
            >
              {apps.filter((a) => a.status === "paid").length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Оплачено
            </Text>
          </View>
          <View
            style={{ width: 1, height: "100%", backgroundColor: COLORS.border }}
          />
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xxxl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: "#F59E0B",
              }}
            >
              {apps.filter((a) => a.status === "awaiting_payment").length}
            </Text>
            <Text
              style={{
                fontSize: 10,
                color: COLORS.mutedForeground,
                fontWeight: TYPOGRAPHY.weight.bold,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              Ожидают
            </Text>
          </View>
        </View>

        {/* Applications List */}
        {apps.length === 0 ? (
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: RADIUS.xxl,
              padding: 40,
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: COLORS.background,
                borderRadius: RADIUS.full,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: SPACING.xl,
              }}
            >
              <Feather
                name="check-circle"
                size={32}
                color={COLORS.mutedForeground}
              />
            </View>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.xl,
                fontWeight: TYPOGRAPHY.weight.bold,
                color: COLORS.foreground,
              }}
            >
              Заявок нет
            </Text>
          </View>
        ) : (
          <View style={{ gap: SPACING.lg }}>
            {apps.map((app, idx) => (
              <MotiView
                key={app.id}
                from={{ opacity: 0, translateY: 20 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ delay: idx * 100 }}
              >
                <View
                  style={{
                    ...SHADOWS.strict,
                    backgroundColor: COLORS.white,
                    borderRadius: 40,
                    padding: SPACING.xl,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: SPACING.xl,
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <View
                      style={{
                        width: 64,
                        height: 64,
                        borderRadius: RADIUS.full,
                        backgroundColor: `${COLORS.primary}10`,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "700",
                          color: COLORS.primary,
                        }}
                      >
                        {app.child_name.charAt(0)}
                      </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 2,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: TYPOGRAPHY.size.lg,
                            fontWeight: TYPOGRAPHY.weight.semibold,
                            color: COLORS.foreground,
                          }}
                        >
                          {app.child_name}
                        </Text>
                        {getStatusBadge(app.status)}
                      </View>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          color: COLORS.mutedForeground,
                          fontWeight: TYPOGRAPHY.weight.medium,
                        }}
                      >
                        {app.child_age} лет · {app.parent_name}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      backgroundColor: "rgba(108, 92, 231, 0.05)",
                      padding: 16,
                      borderRadius: RADIUS.lg,
                      marginBottom: SPACING.xl,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 4,
                      }}
                    >
                      <Feather
                        name="book-open"
                        size={14}
                        color={COLORS.primary}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: COLORS.foreground,
                        }}
                      >
                        {app.club}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.mutedForeground,
                        marginLeft: 24,
                      }}
                    >
                      Дата заявки: {app.applied_date}
                    </Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: SPACING.md }}>
                    <TouchableOpacity
                      onPress={() => handleAction(app.id, "reject")}
                      style={{
                        flex: 1,
                        height: 48,
                        backgroundColor: COLORS.background,
                        borderRadius: RADIUS.lg,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: COLORS.mutedForeground,
                          fontWeight: TYPOGRAPHY.weight.bold,
                          fontSize: 14,
                        }}
                      >
                        ОТКЛОНИТЬ
                      </Text>
                    </TouchableOpacity>

                    {app.status === "paid" ? (
                      <TouchableOpacity
                        onPress={() => handleAction(app.id, "approve")}
                        style={{
                          flex: 1.5,
                          height: 48,
                          backgroundColor: COLORS.success,
                          borderRadius: RADIUS.lg,
                          alignItems: "center",
                          justifyContent: "center",
                          ...SHADOWS.md,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: TYPOGRAPHY.weight.bold,
                            fontSize: 14,
                          }}
                        >
                          ЗАЧИСЛИТЬ
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={{
                          flex: 1.5,
                          height: 48,
                          backgroundColor: COLORS.border,
                          borderRadius: RADIUS.lg,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        disabled={true}
                      >
                        <Text
                          style={{
                            color: COLORS.mutedForeground,
                            fontWeight: TYPOGRAPHY.weight.bold,
                            fontSize: 14,
                          }}
                        >
                          ЖДЕМ ОПЛАТУ
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </MotiView>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
