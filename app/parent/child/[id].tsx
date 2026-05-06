import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
   Platform,
   Pressable,
   ScrollView,
   Text,
   TouchableOpacity,
   useWindowDimensions,
   View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, SHADOWS } from "../../../constants/theme";
import { useParentData } from "../../../contexts/ParentDataContext";

export default function ParentChildDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { childrenProfile, parentProfile, setActiveChildId } = useParentData();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : 20;

  const child = childrenProfile.find((c) => c.id === id) || childrenProfile[0];

  if (!child) return null;

  const getDynamicSkills = () => {
    if (child.talentProfile?.scores) {
      const s = child.talentProfile.scores;
      return [
        { label: "Креативность", value: s.creative, color: "#A78BFA" },
        { label: "Логика", value: s.logical, color: "#10B981" },
        { label: "Социум", value: s.social, color: "#3B82F6" },
        { label: "Физическая", value: s.physical, color: "#F59E0B" },
        { label: "Лингвистика", value: s.linguistic, color: "#EC4899" },
      ].sort((a, b) => b.value - a.value);
    }
    return [];
  };

  const currentSkills = getDynamicSkills();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={COLORS.gradients.header as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: 40,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
        }}
      >
        <SafeAreaView edges={["top"]}>
          <View
            style={{ paddingHorizontal: horizontalPadding, paddingTop: 12 }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 32,
              }}
            >
              <Pressable
                onPress={() => {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    router.replace("/" as any);
                  }
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: "rgba(255,255,255,0.2)",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                }}
              >
                <Feather name="arrow-left" size={20} color="white" />
              </Pressable>
              <Text style={{ fontSize: 20, fontWeight: "800", color: "white" }}>
                Профиль
              </Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <View
                style={SHADOWS.md}
                className="w-24 h-24 bg-white rounded-[32px] items-center justify-center mb-5 border-4 border-white/20"
              >
                <Text
                  style={{ color: "#6C5CE7" }}
                  className="text-4xl font-black"
                >
                  {(child.name || "").charAt(0)}
                </Text>
              </View>
              <Text className="text-2xl font-black text-white">
                {child.name}
              </Text>
              <View className="mt-2 bg-white/20 px-4 py-1.5 rounded-full border border-white/30">
                <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                  {child.ageCategory === "child"
                    ? "МЛАДШАЯ ГРУППА"
                    : "СРЕДНЯЯ ГРУППА"}
                </Text>
              </View>

              <View className="flex-row gap-10 mt-8">
                <View className="items-center">
                  <Text className="text-white text-xl font-black">
                    {child.talentProfile ? "Готов" : "Нет"}
                  </Text>
                  <Text className="text-white/60 text-[10px] font-bold uppercase mt-1">
                    ПРОФИЛЬ
                  </Text>
                </View>
                <View className="w-px h-8 bg-white/20" />
                <View className="items-center">
                  <Text className="text-white text-xl font-black">
                    {child.talentProfile?.recommendedConstellation || "—"}
                  </Text>
                  <Text className="text-white/60 text-[10px] font-bold uppercase mt-1">
                    ТИП
                  </Text>
                </View>
                <View className="w-px h-8 bg-white/20" />
                <View className="items-center">
                  <Text className="text-white text-xl font-black">
                    {currentSkills.length}
                  </Text>
                  <Text className="text-white/60 text-[10px] font-bold uppercase mt-1">
                    НАВЫКИ
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 32,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Insight Box */}
        <View className="bg-blue-50 p-6 rounded-[32px] mb-8 flex-row items-center gap-4 border border-blue-100">
          <View className="w-12 h-12 bg-white rounded-2xl items-center justify-center shadow-sm">
            <Feather name="info" size={20} color="#3B82F6" />
          </View>
          <Text className="flex-1 text-blue-900 text-xs font-medium leading-5">
            Заполните анкету интересов, чтобы AI подобрал идеальный путь
            развития для {child.name}.
          </Text>
        </View>

        {/* PRO TOOLS: SESSION & BIG TEST */}
        {parentProfile?.tariff === "pro" && (
          <View className="mb-8 gap-4">
            <View className="flex-row items-center gap-2 mb-2 px-1">
              <Feather name="zap" size={20} color="#F59E0B" />
              <Text className="text-lg font-black text-gray-900">
                PRO Инструменты
              </Text>
            </View>

            <View
              style={SHADOWS.sm}
              className="bg-white rounded-[32px] p-6 border border-gray-100 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className="font-bold text-gray-900 text-lg mb-1">
                  Сессия с ментором
                </Text>
                <Text className="text-sm font-medium text-gray-500 mb-4 leading-5">
                  Выберите 3 варианта времени для созвона-синхронизации с
                  ментором.
                </Text>
              </View>
              <View className="w-16 h-16 bg-purple-50 rounded-[20px] items-center justify-center border border-purple-100">
                <Feather name="video" size={24} color={COLORS.primary} />
              </View>
            </View>

            <View
              style={SHADOWS.sm}
              className="bg-white rounded-[32px] p-6 border border-gray-100 flex-row items-center justify-between"
            >
              <View className="flex-1 pr-4">
                <Text className="font-bold text-gray-900 text-lg mb-1">
                  Большое тестирование
                </Text>
                <Text className="text-sm font-medium text-gray-500 mb-4 leading-5">
                  Прохождение 1 раз в месяц для детальной корректировки профиля
                  (навыки, архетип).
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/profile/youth/testing" as any)}
                  className="bg-blue-50 py-3 px-5 rounded-2xl self-start"
                >
                  <Text className="text-blue-600 font-black text-xs uppercase tracking-wide">
                    Начать тест
                  </Text>
                </TouchableOpacity>
              </View>
              <View className="w-16 h-16 bg-blue-50 rounded-[20px] items-center justify-center border border-blue-100">
                <Feather name="file-text" size={24} color="#3B82F6" />
              </View>
            </View>
          </View>
        )}

        {/* Skills Section */}
        <View
          style={SHADOWS.sm}
          className="bg-white rounded-[40px] p-8 mb-8 border border-gray-50"
        >
          <View className="flex-row items-center gap-3 mb-8">
            <View className="w-10 h-10 bg-purple-50 rounded-2xl items-center justify-center">
              <Feather name="target" size={20} color="#6C5CE7" />
            </View>
            <Text className="text-xl font-black text-gray-900">
              Развитие навыков
            </Text>
          </View>

          <View className="gap-6">
            {currentSkills.length === 0 && (
              <Text className="text-sm font-semibold text-gray-500">
                Результаты появятся после диагностики.
              </Text>
            )}
            {currentSkills.map((skill, idx) => (
              <View key={idx}>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-sm font-bold text-gray-700">
                    {skill.label}
                  </Text>
                  <Text className="text-sm font-black text-gray-900">
                    {skill.value}%
                  </Text>
                </View>
                <View className="h-2 bg-gray-50 rounded-full overflow-hidden flex-row">
                  <View
                    style={{
                      width: `${skill.value}%`,
                      backgroundColor: skill.color,
                    }}
                    className="h-full rounded-full"
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Talent Map Info (if available) */}
        {child.talentProfile && (
          <View
            style={SHADOWS.md}
            className="bg-purple-50 p-6 rounded-[32px] mb-8 border border-purple-100"
          >
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-purple-100 rounded-2xl items-center justify-center">
                <Feather name="star" size={20} color="#6C5CE7" />
              </View>
              <Text className="text-lg font-black text-purple-900 flex-1">
                {child.talentProfile.recommendedConstellation}
              </Text>
            </View>
            <Text className="text-purple-800 text-sm leading-5 font-medium mb-5">
              {child.talentProfile.summary}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setActiveChildId(child.id);
                router.push("/profile/youth/results");
              }}
              className="bg-white py-3.5 rounded-2xl items-center justify-center border border-purple-100"
            >
              <View className="flex-row items-center gap-2">
                <Text className="text-primary font-black text-xs uppercase tracking-wide">
                  Открыть полный отчет
                </Text>
                <Feather
                  name="external-link"
                  size={14}
                  color={COLORS.primary}
                />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Diagnostic CTA (Shown only if NO talent profile yet) */}
        {!child.talentProfile && (
          <View
            style={SHADOWS.md}
            className="bg-gray-900 rounded-[40px] p-8 overflow-hidden mb-8"
          >
            <LinearGradient
              colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0)"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-white/10 rounded-2xl items-center justify-center">
                <Feather name="award" size={20} color="white" />
              </View>
              <Text className="text-white text-lg font-black">
                AI Диагностика
              </Text>
            </View>
            <Text className="text-white/60 text-sm leading-5 mb-6">
              Пройдите глубокий тест способностей ребенка для открытия новых
              талантов.
            </Text>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/parent/testing",
                  params: { childId: child.id },
                } as any)
              }
              className="bg-white h-14 rounded-2xl items-center justify-center active:bg-gray-100"
            >
              <Text className="text-gray-900 font-black text-sm uppercase">
                Начать тест
              </Text>
            </Pressable>
          </View>
        )}

        {/* PRO Upgrade CTA (Shown if they have a profile but NOT the PRO tariff) */}
        {child.talentProfile && parentProfile?.tariff !== "pro" && (
          <View
            style={SHADOWS.md}
            className="bg-gray-900 rounded-[40px] p-8 overflow-hidden mb-8"
          >
            <LinearGradient
              colors={["#A78BFA", "#6C5CE7"]}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.2,
              }}
            />
            <View className="flex-row items-center gap-3 mb-4">
              <View className="w-10 h-10 bg-purple-500/20 rounded-2xl items-center justify-center border border-purple-500/30">
                <Feather name="unlock" size={20} color="#A78BFA" />
              </View>
              <Text className="text-white text-lg font-black">
                PRO Подписка
              </Text>
            </View>
            <Text className="text-white/80 text-sm leading-5 mb-6">
              Откройте 100% потенциала: персональные рекомендации секций,
              трекинг с ментором и детальная аналитика.
            </Text>
            <Pressable
              onPress={() => router.push("/parent/subscription" as any)}
              className="bg-purple-500 h-14 rounded-2xl items-center justify-center active:bg-purple-600"
            >
              <Text className="text-white font-black text-sm uppercase tracking-wide">
                🔥 Открыть все данные
              </Text>
            </Pressable>
          </View>
        )}

        {/* Enrolled Clubs */}
        <View style={{ marginTop: 8 }}>
          <View className="flex-row items-center gap-2 mb-4 px-1">
            <Feather name="shopping-bag" size={20} color={COLORS.primary} />
            <Text className="text-lg font-black text-gray-900">
              Записан в кружки
            </Text>
          </View>
          <View
            style={SHADOWS.sm}
            className="bg-white rounded-[32px] p-6 border border-gray-100"
          >
            <Text className="text-sm font-semibold text-gray-500">
              Активные кружки появятся после записи ребенка на курс.
            </Text>
          </View>
        </View>

        {/* My Mentor Section */}
        <View style={{ marginTop: 32 }}>
          <View className="flex-row items-center gap-2 mb-4 px-1">
            <Feather name="user-check" size={20} color="#10B981" />
            <Text className="text-lg font-black text-gray-900">
              Персональный ментор
            </Text>
          </View>
          <View
            style={SHADOWS.sm}
            className="bg-white rounded-[32px] p-4 border border-gray-100"
          >
            <Text className="text-sm font-semibold text-gray-500">
              Персональный ментор появится после подтверждения заявки на
              сопровождение.
            </Text>
          </View>
        </View>

        {/* QR Code Login Stub */}
        {!child.phone && (
          <View
            style={SHADOWS.sm}
            className="bg-white rounded-[40px] p-8 mt-8 border border-gray-50 items-center"
          >
            <View className="flex-row items-center gap-2 mb-6">
              <Feather name="smartphone" size={20} color="#6C5CE7" />
              <Text className="text-xl font-black text-gray-900">
                Вход для ребенка
              </Text>
            </View>
            <Text className="text-gray-500 text-center text-sm mb-6 leading-5">
              Так как у {child.name} нет привязанного номера телефона,
              используйте этот QR-код для входа с планшета или телефона ребенка.
            </Text>
            <View className="w-48 h-48 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center p-4">
              <View className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-xl" />
              <View className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-xl" />
              <View className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-xl" />
              <View className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-xl" />

              <Feather
                name="grid"
                size={64}
                color="#6C5CE7"
                style={{ opacity: 0.8 }}
              />
              <Text className="text-purple-600 font-black mt-4 text-[10px] tracking-widest uppercase text-center">
                сканировать
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
