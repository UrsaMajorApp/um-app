import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "$constants/theme";
import { useStudentTasks } from "$hooks/useStudentData";
import { getDashboardHorizontalPadding, useIsDesktop } from "$lib/useIsDesktop";

// Color palette cycling for tasks
const TASK_COLORS = [
  "#A78BFA",
  "#6C5CE7",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

export default function YouthTasks() {
  const router = useRouter();
  const { tasks: rawTasks, toggleTask, loading } = useStudentTasks();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);

  const tasks = rawTasks.map((t, i) => ({
    ...t,
    completed: t.done,
    xp: t.xp_reward,
    color: TASK_COLORS[i % TASK_COLORS.length],
  }));

  const doneCount = tasks.filter((t) => t.completed).length;
  const totalXP = tasks
    .filter((t) => t.completed)
    .reduce((sum, t) => sum + t.xp, 0);

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
                Задания
              </Text>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Text className="text-white/70 text-[10px] font-black uppercase mb-1">
                  XP ЗА СЕГОДНЯ
                </Text>
                <Text className="text-white text-2xl font-black">
                  {totalXP}
                </Text>
              </View>
              <View className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                <Text className="text-white/70 text-[10px] font-black uppercase mb-1">
                  ВЫПОЛНЕНО
                </Text>
                <Text className="text-white text-2xl font-black">
                  {doneCount} / {tasks.length}
                </Text>
              </View>
            </View>
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
        <Text className="text-lg font-black text-gray-900 mb-4 px-1">
          Твой список дел
        </Text>

        <View className="gap-3">
          {loading ? (
            <Text
              style={{
                textAlign: "center",
                marginTop: 20,
                color: COLORS.mutedForeground,
              }}
            >
              Загрузка...
            </Text>
          ) : null}
          {tasks.map((task) => (
            <Pressable
              key={task.id}
              onPress={() => toggleTask(task.id)}
              style={SHADOWS.sm}
              className={`flex-row items-center p-4 rounded-3xl border ${task.completed ? "bg-green-50/30 border-green-100" : "bg-white border-gray-50"}`}
            >
              <View
                style={{ backgroundColor: task.color + "15" }}
                className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
              >
                <Feather
                  name={task.completed ? "check" : "square"}
                  size={20}
                  color={task.completed ? "#10B981" : task.color}
                />
              </View>

              <View className="flex-1">
                <Text
                  className={`font-bold text-base ${task.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
                >
                  {task.title}
                </Text>
                <Text className="text-xs text-gray-400 font-medium">
                  {task.club}
                </Text>
              </View>

              <View className="flex-row items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-full">
                <Feather name="star" size={12} color="#FBBF24" />
                <Text className="text-[10px] font-black text-gray-700">
                  {task.xp} XP
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {doneCount === tasks.length && (
          <View
            style={SHADOWS.md}
            className="mt-8 bg-green-500 rounded-[32px] p-6 items-center"
          >
            <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
              <Feather name="award" size={32} color="white" />
            </View>
            <Text className="text-white text-xl font-black text-center mb-2">
              Отличный результат!
            </Text>
            <Text className="text-white/80 text-sm text-center font-medium">
              Ты выполнил все задачи на сегодня. Заслуженный отдых!
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
