import {
  AdminCard,
  AdminHeader,
  formatKZT,
  useAdminLayout,
  useAdminNavigation,
} from "@/components/admin/shared";
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
  TYPOGRAPHY,
} from "@/constants/theme";
import {
  useAdminCourses,
  useAdminEnrollments,
  useAdminStats,
  useAllUsers,
  useFamilies,
  useMentorApps,
  useOrganizations,
  useTickets,
  useTransactions,
} from "@/hooks/useAdminData";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function AdminOverviewScreen() {
  const { isTablet, paddingX } = useAdminLayout();
  const goAdmin = useAdminNavigation();
  const families = useFamilies();
  const mentorApps = useMentorApps();
  const orgs = useOrganizations();
  const txs = useTransactions();
  const tickets = useTickets();
  const courses = useAdminCourses();
  const users = useAllUsers();
  const enrollments = useAdminEnrollments();
  const stats = useAdminStats(mentorApps.data, txs.data, families.data);

  const draftCourses = courses.data.filter((c) => c.status === "draft").length;
  const activeCourses = courses.data.filter(
    (c) => c.status === "active",
  ).length;
  const orgsNeedingAction = orgs.data.filter(
    (o) => o.status === "pending" || o.status === "ready_for_review",
  ).length;
  const verifiedOrgs = orgs.data.filter((o) => o.status === "verified").length;
  const pendingEnrollments = enrollments.data.filter(
    (e) => e.status === "awaiting_payment",
  ).length;
  const unresolvedTickets = tickets.data.filter(
    (t) => t.status !== "resolved",
  ).length;
  const totalPending =
    stats.pendingMentors +
    orgsNeedingAction +
    draftCourses +
    pendingEnrollments;

  const queue = [
    {
      title: "Заявки менторов",
      count: stats.pendingMentors,
      description: "Проверьте профиль, специализацию и описание",
      icon: "user-check",
      color: COLORS.primary,
      action: () => goAdmin("users"),
    },
    {
      title: "Проверка организаций",
      count: orgsNeedingAction,
      description: "Активируйте или отклоните центры на проверке",
      icon: "briefcase",
      color: "#2563EB",
      action: () => goAdmin("organizations"),
    },
    {
      title: "Модерация курсов",
      count: draftCourses,
      description: "Опубликуйте курс или верните с причиной отказа",
      icon: "book-open",
      color: "#CA8A04",
      action: () => goAdmin("organizations"),
    },
    {
      title: "Оплаты записей",
      count: pendingEnrollments,
      description: "Отметьте оплату, активируйте запись или отклоните",
      icon: "credit-card",
      color: COLORS.destructive,
      action: () => goAdmin("organizations"),
    },
  ];
  const visibleQueue = queue.filter((item) => item.count > 0);
  const metrics = [
    {
      label: "Пользователи",
      value: users.data.length,
      detail: `${families.data.length} семей`,
      icon: "users",
      color: COLORS.primary,
      action: () => goAdmin("users"),
    },
    {
      label: "Проверенные орг.",
      value: verifiedOrgs,
      detail: `${orgs.data.length} всего`,
      icon: "briefcase",
      color: "#2563EB",
      action: () => goAdmin("organizations"),
    },
    {
      label: "Активные курсы",
      value: activeCourses,
      detail: `${draftCourses} на проверке`,
      icon: "book-open",
      color: COLORS.success,
      action: () => goAdmin("organizations"),
    },
    {
      label: "Поддержка",
      value: unresolvedTickets,
      detail: "открытых обращений",
      icon: "shield",
      color: COLORS.destructive,
      action: () => goAdmin("support"),
    },
    {
      label: "Доход",
      value: formatKZT(stats.revenue),
      detail: `${formatKZT(stats.gmv)} оборот`,
      icon: "dollar-sign",
      color: "#CA8A04",
      action: () => goAdmin("billing"),
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AdminHeader
        title="Очередь проверки"
        subtitle="Сначала разберите операционные задачи, потом отчеты и настройки."
        trailing={
          <TouchableOpacity
            onPress={() => {
              families.refresh();
              mentorApps.refresh();
              orgs.refresh();
              txs.refresh();
              courses.refresh();
              users.refresh();
              enrollments.refresh();
              tickets.refresh();
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.sm,
              paddingHorizontal: SPACING.md,
              height: 38,
              borderRadius: RADIUS.md,
              backgroundColor: "rgba(255,255,255,0.16)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.24)",
            }}
          >
            <Feather name="refresh-cw" size={15} color={COLORS.white} />
            <Text
              style={{
                color: COLORS.white,
                fontWeight: "800",
                fontSize: TYPOGRAPHY.size.sm,
              }}
            >
              Обновить
            </Text>
          </TouchableOpacity>
        }
      />
      <ScrollView style={{ flex: 1 }}>
        <View
          style={{
            width: "100%",
            maxWidth: 1180,
            alignSelf: "center",
            padding: paddingX,
            gap: SPACING.lg,
          }}
        >
          <View
            style={{
              flexDirection: isTablet ? "row" : "column",
              alignItems: "flex-start",
              gap: SPACING.md,
            }}
          >
            <AdminCard
              style={{
                width: isTablet ? undefined : "100%",
                flex: isTablet ? 1.5 : undefined,
                minHeight: isTablet ? 312 : undefined,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  padding: SPACING.lg,
                  borderBottomWidth: 1,
                  borderColor: COLORS.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: SPACING.sm,
                }}
              >
                <Feather
                  name="alert-circle"
                  size={18}
                  color={totalPending > 0 ? COLORS.destructive : COLORS.success}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.md,
                      fontWeight: "900",
                      color: COLORS.foreground,
                    }}
                  >
                    Требует внимания
                  </Text>
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xs,
                      color: COLORS.mutedForeground,
                      marginTop: 2,
                    }}
                  >
                    {totalPending > 0
                      ? `${totalPending} открытых задач`
                      : "Срочных задач нет"}
                  </Text>
                </View>
              </View>
              {visibleQueue.length > 0 ? (
                visibleQueue.map((item, index) => (
                  <TouchableOpacity
                    key={item.title}
                    onPress={item.action}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: SPACING.md,
                      padding: SPACING.lg,
                      borderTopWidth: index > 0 ? 1 : 0,
                      borderColor: COLORS.border,
                    }}
                  >
                    <View
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: RADIUS.md,
                        backgroundColor: item.color + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={item.icon as any}
                        size={18}
                        color={item.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.sm,
                          fontWeight: "800",
                          color: COLORS.foreground,
                        }}
                      >
                        {item.title}
                      </Text>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          color: COLORS.mutedForeground,
                          marginTop: 2,
                        }}
                      >
                        {item.description}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: TYPOGRAPHY.size.xl,
                        fontWeight: "900",
                        color: item.color,
                      }}
                    >
                      {item.count}
                    </Text>
                    <Feather
                      name="chevron-right"
                      size={18}
                      color={COLORS.mutedForeground}
                    />
                  </TouchableOpacity>
                ))
              ) : (
                <View
                  style={{
                    flex: isTablet ? 1 : undefined,
                    minHeight: isTablet ? 232 : 170,
                    padding: SPACING.xl,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: RADIUS.lg,
                      backgroundColor: COLORS.success + "15",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: SPACING.sm,
                    }}
                  >
                    <Feather
                      name="check-circle"
                      size={22}
                      color={COLORS.success}
                    />
                  </View>
                  <Text
                    style={{
                      color: COLORS.foreground,
                      fontWeight: "800",
                      textAlign: "center",
                    }}
                  >
                    Очередь пуста
                  </Text>
                  <Text
                    style={{
                      maxWidth: 320,
                      color: COLORS.mutedForeground,
                      fontSize: TYPOGRAPHY.size.xs,
                      marginTop: 4,
                      textAlign: "center",
                    }}
                  >
                    Новые задачи модерации и поддержки появятся здесь.
                  </Text>
                </View>
              )}
            </AdminCard>
            <AdminCard
              style={{
                width: isTablet ? undefined : "100%",
                flex: isTablet ? 1 : undefined,
                minHeight: isTablet ? 312 : undefined,
                padding: SPACING.lg,
              }}
            >
              <Text
                style={{
                  fontSize: TYPOGRAPHY.size.md,
                  fontWeight: "900",
                  color: COLORS.foreground,
                  marginBottom: SPACING.md,
                }}
              >
                Состояние платформы
              </Text>
              <View style={{ gap: SPACING.md }}>
                {metrics.map((metric) => (
                  <TouchableOpacity
                    key={metric.label}
                    onPress={metric.action}
                    activeOpacity={0.75}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: SPACING.md,
                    }}
                  >
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: RADIUS.md,
                        backgroundColor: metric.color + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={metric.icon as any}
                        size={15}
                        color={metric.color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: TYPOGRAPHY.size.xs,
                          color: COLORS.mutedForeground,
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        {metric.label}
                      </Text>
                      <Text
                        style={{
                          color: COLORS.foreground,
                          fontWeight: "900",
                          marginTop: 1,
                        }}
                      >
                        {String(metric.value)}
                      </Text>
                    </View>
                    <Text
                      style={{
                        color: COLORS.mutedForeground,
                        fontSize: TYPOGRAPHY.size.xs,
                      }}
                    >
                      {metric.detail}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </AdminCard>
          </View>

          <TouchableOpacity
            onPress={() => goAdmin("support")}
            activeOpacity={0.75}
            style={{
              flexDirection: isTablet ? "row" : "column",
              alignItems: isTablet ? "center" : "flex-start",
              gap: SPACING.md,
              backgroundColor: COLORS.surface,
              borderRadius: RADIUS.lg,
              borderWidth: 1,
              borderColor: COLORS.border,
              padding: SPACING.lg,
              ...SHADOWS.sm,
            }}
          >
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.destructive + "12",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name="shield" size={18} color={COLORS.destructive} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: COLORS.foreground,
                  fontWeight: "900",
                  fontSize: TYPOGRAPHY.size.md,
                }}
              >
                Поддержка и контроль качества
              </Text>
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  fontSize: TYPOGRAPHY.size.sm,
                  marginTop: 2,
                }}
              >
                {unresolvedTickets > 0
                  ? `${unresolvedTickets} обращений ждут обработки`
                  : "Открытых обращений нет. Журнал качества доступен в разделе поддержки."}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: SPACING.xs,
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontWeight: "800",
                  fontSize: TYPOGRAPHY.size.sm,
                }}
              >
                Открыть
              </Text>
              <Feather name="chevron-right" size={16} color={COLORS.primary} />
            </View>
          </TouchableOpacity>

          <AdminCard style={{ padding: SPACING.lg }}>
            <Text
              style={{
                fontSize: TYPOGRAPHY.size.md,
                fontWeight: "900",
                color: COLORS.foreground,
                marginBottom: SPACING.md,
              }}
            >
              Операционные разделы
            </Text>
            <View
              style={{
                flexDirection: isTablet ? "row" : "column",
                gap: SPACING.md,
              }}
            >
              {queue.map((item) => (
                <TouchableOpacity
                  key={item.title}
                  onPress={item.action}
                  activeOpacity={0.75}
                  style={{
                    flex: 1,
                    minHeight: 92,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: RADIUS.md,
                    backgroundColor: COLORS.background,
                    padding: SPACING.md,
                    justifyContent: "space-between",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: SPACING.sm,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: RADIUS.md,
                        backgroundColor: item.color + "15",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={item.icon as any}
                        size={15}
                        color={item.color}
                      />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: COLORS.foreground,
                        fontWeight: "800",
                        fontSize: TYPOGRAPHY.size.sm,
                      }}
                      numberOfLines={1}
                    >
                      {item.title}
                    </Text>
                  </View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "flex-end",
                      justifyContent: "space-between",
                      gap: SPACING.sm,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: COLORS.mutedForeground,
                        fontSize: TYPOGRAPHY.size.xs,
                      }}
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                    <Text
                      style={{
                        color: item.color,
                        fontSize: TYPOGRAPHY.size.xl,
                        fontWeight: "900",
                      }}
                    >
                      {item.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </AdminCard>
        </View>
      </ScrollView>
    </View>
  );
}
