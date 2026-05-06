import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { MotiView } from "moti";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NotificationsModal } from "../../app/(tabs)/layout-container";
import {
  COLORS,
  LAYOUT,
  RADIUS,
  SHADOWS,
  TYPOGRAPHY,
} from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import { useParentData } from "../../contexts/ParentDataContext";
import {
  courseGradient,
  SCORE_TO_SKILLS,
  usePublicCourses,
} from "../../hooks/usePublicData";
import { getDashboardHorizontalPadding, useIsDesktop } from "../../lib/useIsDesktop";

const AutonomousLogo = React.memo(({ width, height, dark }: any) => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(() => ({
    top: Math.random() * (height || 800),
    left: Math.random() * (width || 400),
    size: 20 + Math.random() * 70,
    rotation: `${Math.floor(Math.random() * 80) - 40}deg`,
    duration: 2500 + Math.random() * 2000,
  }));

  useEffect(() => {
    let isMounted = true;
    let timeoutId: any;

    const runCycle = () => {
      if (!isMounted) return;

      // 1. Показываем
      setVisible(true);

      // 2. Ждем пока покажется + небольшая пауза в видимом состоянии
      timeoutId = setTimeout(() => {
        if (!isMounted) return;

        // 3. Скрываем
        setVisible(false);

        // 4. Ждем пока полностью скроется
        timeoutId = setTimeout(() => {
          if (!isMounted) return;

          // 5. Меняем координаты только когда полностью невидимы
          setConfig({
            top: Math.random() * (height || 800),
            left: Math.random() * (width || 400),
            size: 20 + Math.random() * 70,
            rotation: `${Math.floor(Math.random() * 80) - 40}deg`,
            duration: 2500 + Math.random() * 2000,
          });

          // 6. Небольшая пауза перед следующим появлением
          timeoutId = setTimeout(runCycle, 1000);
        }, config.duration + 500);
      }, config.duration + 2000);
    };

    // Начальная задержка
    timeoutId = setTimeout(runCycle, Math.random() * 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [width, height]);

  return (
    <MotiView
      animate={{
        opacity: visible ? (dark ? 0.06 : 0.15) : 0,
        scale: visible ? 1.1 : 0.6,
        rotate: config.rotation,
      }}
      transition={{
        type: "timing",
        duration: config.duration,
      }}
      style={{
        position: "absolute",
        top: config.top,
        left: config.left,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <Image
        source={require("../../assets/logo/Frame 4.svg")}
        style={{
          width: config.size,
          height: config.size,
          tintColor: dark ? "#555555" : undefined,
        }}
        resizeMode="contain"
      />
    </MotiView>
  );
});

const FloatingBranding = React.memo(
  ({ count = 15, dark = false, width, height }: any) => {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <AutonomousLogo key={i} width={width} height={height} dark={dark} />
        ))}
      </>
    );
  },
);

export default function ParentHome() {
  const router = useRouter();
  const { user } = useAuth();
  const { width, height } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const {
    parentProfile,
    childrenProfile: children,
    activeChildId,
    setActiveChildId,
  } = useParentData();

  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const activeChild =
    children.find((child) => child.id === activeChildId) || children[0] || null;

  const { courses: publicCourses } = usePublicCourses();

  const recommendations = useMemo(() => {
    if (publicCourses.length === 0) return [];
    if (!activeChild?.talentProfile) return publicCourses.slice(0, 3);

    const scores = activeChild.talentProfile.scores as Record<string, number>;
    const topTraits = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([t]) => t);
    const wantedSkills = new Set(
      topTraits.flatMap((t) => SCORE_TO_SKILLS[t] ?? []),
    );

    const matched = publicCourses.filter((c) =>
      c.skills.some((s) => wantedSkills.has(s)),
    );
    return (matched.length > 0 ? matched : publicCourses).slice(0, 3);
  }, [activeChild, publicCourses]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Intensive Fixed Background Layer (Branded "Rain") */}
      <View
        style={{
          ...Platform.select({
            web: { position: "fixed" } as any,
            default: { position: "absolute" },
          }),
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
        }}
      >
        <FloatingBranding
          count={40}
          dark={true}
          width={width}
          height={height}
          seed="body"
        />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: isDesktop ? 32 : 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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
                  paddingHorizontal: horizontalPadding,
                  paddingTop: 12,
                  paddingBottom: 32,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: TYPOGRAPHY.size.xxxl,
                      fontWeight: TYPOGRAPHY.weight.semibold,
                      color: COLORS.white,
                      letterSpacing: TYPOGRAPHY.letterSpacing.tight,
                    }}
                  >
                    Привет,{" "}
                    {user?.firstName || parentProfile?.firstName || "Родитель"}!
                  </Text>
                  {!isDesktop && (
                    <Pressable
                      onPress={() => setNotificationsVisible(true)}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: RADIUS.lg,
                        backgroundColor: "rgba(255,255,255,0.2)",
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: "rgba(255,255,255,0.3)",
                        ...(Platform.OS === "web" &&
                          ({ cursor: "pointer" } as any)),
                      }}
                    >
                      <Feather name="bell" size={20} color="white" />
                      <View
                        style={{
                          position: "absolute",
                          top: 14,
                          right: 14,
                          width: 10,
                          height: 10,
                          backgroundColor: COLORS.destructive,
                          borderRadius: 5,
                          borderWidth: 1.5,
                          borderColor: "rgba(255,255,255,0.4)",
                        }}
                      />
                    </Pressable>
                  )}
                </View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 13,
                    fontWeight: "500",
                    marginTop: 4,
                  }}
                >
                  Узнайте, как развиваются ваши дети сегодня
                </Text>
              </View>
            </SafeAreaView>
          </LinearGradient>
        </View>
        {/* Children Section */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 24 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-black text-gray-900">Мои дети</Text>
            <Pressable
              onPress={() => router.push("/(tabs)/parent/children" as any)}
            >
              <Text className="text-purple-600 font-bold text-sm">Все</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="overflow-visible"
          >
            {children.map((child) => (
              <Pressable
                key={child.id}
                onPress={() => {
                  setActiveChildId(child.id);
                  router.push(`/(tabs)/parent/child/${child.id}` as any);
                }}
                style={SHADOWS.md}
                className={`mr-4 w-36 p-5 bg-white rounded-[32px] items-center border ${activeChildId === child.id ? "border-purple-200" : "border-gray-50"}`}
              >
                <View className="w-16 h-16 rounded-full bg-purple-100 items-center justify-center mb-3">
                  <Text className="text-purple-600 font-black text-xl">
                    {child.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text
                  className="font-bold text-sm text-gray-800 text-center"
                  numberOfLines={1}
                >
                  {child.name}
                </Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                  {child.age} ЛЕТ
                </Text>
              </Pressable>
            ))}

            <Pressable
              onPress={() =>
                router.push("/profile/youth/create-profile-child" as any)
              }
              className="w-36 p-5 bg-gray-50 rounded-[32px] items-center justify-center border-2 border-dashed border-gray-100"
            >
              <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mb-2">
                <Feather name="plus" size={20} color="#9CA3AF" />
              </View>
              <Text className="text-xs font-bold text-gray-400 text-center">
                Добавить
              </Text>
            </Pressable>
          </ScrollView>
        </View>

        {/* Dashboard Insight Widget (Tariff Based) */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 32 }}>
          {parentProfile?.tariff === "pro" ? (
            <View
              style={SHADOWS.md}
              className="bg-purple-50 rounded-[32px] p-6 border border-purple-100 flex-row items-center"
            >
              <View className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 border-2 border-purple-200">
                <Feather name="message-circle" size={20} color="#6C5CE7" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-purple-900 font-bold text-sm mb-1">
                  Сообщение от Ментора
                </Text>
                <Text className="text-purple-700 text-xs leading-4">
                  «{activeChild?.name} показывает отличные результаты в логике.
                  Я подобрал новые секции!»
                </Text>
                <View className="flex-row gap-2 mt-3">
                  <Pressable
                    onPress={() => router.push("/chats" as any)}
                    className="bg-purple-600 px-3 py-1.5 rounded-full flex-row items-center gap-1"
                  >
                    <Text className="text-white font-black text-[10px] uppercase tracking-widest">
                      Чат 🔥
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push("/parent/mentors" as any)}
                    className="bg-white px-3 py-1.5 rounded-full border border-purple-200 flex-row items-center gap-1"
                  >
                    <Feather name="users" size={10} color="#6C5CE7" />
                    <Text className="text-purple-600 font-black text-[10px] uppercase tracking-widest">
                      Менторы
                    </Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : activeChild ? (
            <View
              style={SHADOWS.sm}
              className="bg-blue-50 rounded-[32px] p-6 border border-blue-100 flex-row items-center"
            >
              <View
                className="w-12 h-12 bg-white rounded-full items-center justify-center mr-4 border border-blue-50"
                style={SHADOWS.sm}
              >
                <Feather name="cpu" size={20} color="#3B82F6" />
              </View>
              <View className="flex-1 pr-2">
                <Text className="text-blue-900 font-bold text-sm mb-1">
                  AI Диагностика
                </Text>
                <Text className="text-blue-700 text-xs leading-4">
                  Пройдите диагностику талантов для {activeChild.name}, чтобы
                  получить персональные рекомендации по развитию.
                </Text>
                <Pressable
                  onPress={() => {
                    if (!activeChild) return;
                    setActiveChildId(activeChild.id);
                    router.push({
                      pathname: "/profile/youth/testing",
                      params: { childId: activeChild.id },
                    } as any);
                  }}
                  className="mt-3 bg-white self-start px-3 py-1.5 rounded-full border border-blue-200"
                >
                  <Text className="text-blue-600 font-black text-[10px] uppercase tracking-widest">
                    Начать тест
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        {/* AI Recommendations Section */}
        <View style={{ marginTop: 32 }}>
          <View style={{ paddingHorizontal: horizontalPadding }}>
            <Text className="text-xl font-black text-gray-900 mb-1">
              Рекомендации AI
            </Text>
            <Text className="text-xs text-gray-400 font-medium mb-4">
              На основе интересов {activeChild?.name}
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ paddingLeft: horizontalPadding }}
          >
            {recommendations.length === 0 ? (
              <View
                style={{
                  width: 260,
                  backgroundColor: "#F9FAFB",
                  borderRadius: 28,
                  padding: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "#F3F4F6",
                }}
              >
                <Feather name="inbox" size={28} color="#D1D5DB" />
                <Text
                  style={{
                    color: "#9CA3AF",
                    fontWeight: "700",
                    fontSize: 13,
                    marginTop: 10,
                    textAlign: "center",
                  }}
                >
                  Курсы появятся{"\n"}когда организации их добавят
                </Text>
              </View>
            ) : (
              recommendations.map((rec, idx) => {
                const [c1, c2] = courseGradient(idx);
                return (
                  <Pressable
                    key={rec.id}
                    onPress={() => router.push(`/parent/club/${rec.id}` as any)}
                    style={[
                      SHADOWS.sm,
                      {
                        marginRight: 16,
                        width: 240,
                        backgroundColor: "white",
                        borderRadius: 28,
                        overflow: "hidden",
                        borderWidth: 1,
                        borderColor: "#F9FAFB",
                      },
                    ]}
                  >
                    <View
                      style={{
                        height: 120,
                        backgroundColor: c1 + "20",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Feather
                        name={(rec.icon as any) || "book-open"}
                        size={36}
                        color={c1}
                      />
                    </View>
                    <View style={{ padding: 14 }}>
                      <Text
                        style={{
                          fontWeight: "800",
                          color: "#111827",
                          marginBottom: 2,
                          fontSize: 14,
                        }}
                        numberOfLines={1}
                      >
                        {rec.title}
                      </Text>
                      {rec.org_name ? (
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            fontWeight: "600",
                            marginBottom: 6,
                          }}
                          numberOfLines={1}
                        >
                          {rec.org_name}
                        </Text>
                      ) : null}
                      <View
                        style={{
                          backgroundColor: "#EDE9FE",
                          alignSelf: "flex-start",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 8,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 9,
                            fontWeight: "900",
                            color: "#6C5CE7",
                            textTransform: "uppercase",
                          }}
                        >
                          {rec.price.toLocaleString()} ₸/мес
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Upcoming Classes Section */}
        <View style={{ paddingHorizontal: horizontalPadding, marginTop: 32 }}>
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-black text-gray-900">
              Ближайшие занятия
            </Text>
            <Pressable onPress={() => router.push("/parent/calendar" as any)}>
              <Text className="text-purple-600 font-bold text-sm">
                Календарь
              </Text>
            </Pressable>
          </View>

          <View className="bg-gray-50 rounded-[32px] p-8 items-center border border-gray-100">
            <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center mb-4 border border-gray-100">
              <Feather name="calendar" size={28} color="#D1D5DB" />
            </View>
            <Text className="text-gray-400 font-bold text-sm mb-4 text-center">
              Пока нет запланированных занятий
            </Text>
            <Pressable
              onPress={() => router.push("/parent/clubs" as any)}
              className="bg-purple-600 px-6 py-3 rounded-2xl"
            >
              <Text className="text-white font-black text-sm uppercase">
                Найти кружок
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <NotificationsModal
        visible={notificationsVisible}
        onClose={() => setNotificationsVisible(false)}
      />
    </View>
  );
}
