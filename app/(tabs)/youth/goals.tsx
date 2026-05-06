import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, LAYOUT, SHADOWS } from "../../../constants/theme";
import { useYouthGoals } from "../../../hooks/useStudentData";
import { getDashboardHorizontalPadding, useIsDesktop } from "../../../lib/useIsDesktop";

export default function YouthGoals() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const { goals, loading } = useYouthGoals();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <LinearGradient
        colors={COLORS.gradients.header as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingBottom: 24,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
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
                marginBottom: 20,
              }}
            >
              <Pressable
                onPress={() => router.back()}
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
                Мои цели
              </Text>
            </View>
            <Text
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: 13,
                fontWeight: "500",
                paddingLeft: 4,
              }}
            >
              Ставь амбициозные цели и достигай их
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add Goal Button */}
        <Pressable className="h-16 rounded-3xl border-2 border-dashed border-gray-200 items-center justify-center flex-row gap-3 mb-8">
          <Feather
            name="plus-circle"
            size={20}
            color={COLORS.mutedForeground}
          />
          <Text className="font-bold text-gray-500">Добавить новую цель</Text>
        </Pressable>

        {loading && (
          <Text
            style={{
              textAlign: "center",
              color: COLORS.mutedForeground,
              marginBottom: 16,
            }}
          >
            Загрузка...
          </Text>
        )}

        {/* Goals List */}
        <View className="gap-6">
          {goals.map((goal) => (
            <View
              key={goal.id}
              style={SHADOWS.md}
              className="bg-white rounded-[32px] p-6 border border-gray-50 overflow-hidden"
            >
              <View className="flex-row justify-between items-start mb-4">
                <View className="flex-1">
                  <Text className="text-xl font-black text-gray-900 mb-1">
                    {goal.title}
                  </Text>
                  <Text className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {goal.steps.filter((s) => s.done).length} из{" "}
                    {goal.steps.length} ШАГОВ
                  </Text>
                </View>
                <View className="items-end">
                  <Text
                    style={{ color: goal.color }}
                    className="text-2xl font-black"
                  >
                    {goal.progress}%
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold uppercase">
                    ПРОГРЕСС
                  </Text>
                </View>
              </View>

              <View className="h-2.5 bg-gray-50 rounded-full overflow-hidden mb-6">
                <View
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: goal.color,
                  }}
                  className="h-full rounded-full"
                />
              </View>

              <View className="gap-3 mb-4">
                {goal.steps.map((step) => (
                  <View
                    key={step.id}
                    className={`flex-row items-center gap-3 p-3.5 rounded-2xl ${step.done ? "bg-green-50/50" : "bg-gray-50"}`}
                  >
                    <View
                      className={`w-5 h-5 rounded-md items-center justify-center ${step.done ? "bg-green-500" : "border border-gray-300"}`}
                    >
                      {step.done && (
                        <Feather name="check" size={12} color="white" />
                      )}
                    </View>
                    <Text
                      className={`text-sm ${step.done ? "text-gray-400 line-through" : "text-gray-700 font-bold"}`}
                    >
                      {step.text}
                    </Text>
                  </View>
                ))}
              </View>

              <Pressable className="h-12 bg-gray-50 rounded-xl items-center justify-center">
                <Text className="text-gray-500 font-bold text-sm">
                  Редактировать шаги
                </Text>
              </Pressable>
            </View>
          ))}

          {!loading && goals.length === 0 && (
            <View className="items-center py-10">
              <Feather name="target" size={40} color="#E5E7EB" />
              <Text className="mt-4 text-gray-400 font-bold text-center">
                Целей пока нет. Добавь первую!
              </Text>
            </View>
          )}
        </View>

        {/* Motivation Card */}
        <LinearGradient
          colors={["#3B82F6", "#6C5CE7"]}
          style={SHADOWS.md}
          className="p-6 rounded-[32px] mt-8"
        >
          <View className="flex-row items-center gap-4">
            <View className="w-12 h-12 bg-white/20 rounded-2xl items-center justify-center">
              <Feather name="star" size={24} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-white mb-1">
                Держи фокус!
              </Text>
              <Text className="text-white/80 text-sm leading-5">
                Дисциплина — это мост между целями и достижениями.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </View>
  );
}
