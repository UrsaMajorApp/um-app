import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
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
import { COLORS, LAYOUT, RADIUS, SHADOWS } from "../../../constants/theme";
import { useOrgSchedule } from "../../../hooks/useOrgData";

const DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

export default function OrgScheduleScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === "web" && width >= LAYOUT.desktopBreakpoint;
  const horizontalPadding = isDesktop
    ? LAYOUT.dashboardHorizontalPaddingDesktop
    : 20;

  const [selectedDay, setSelectedDay] = useState(0);
  const { items, loading } = useOrgSchedule(selectedDay);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
          style={{ paddingBottom: 24 }}
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
                <TouchableOpacity
                  onPress={() => router.back()}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 12,
                  }}
                >
                  <Feather name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "800",
                    color: "white",
                    flex: 1,
                  }}
                >
                  Расписание
                </Text>
                <TouchableOpacity
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: RADIUS.md,
                    backgroundColor: "rgba(255,255,255,0.2)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Feather name="plus" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-1 px-1 overflow-visible"
              >
                {DAYS.map((day, index) => (
                  <Pressable
                    key={day}
                    onPress={() => setSelectedDay(index)}
                    style={{
                      marginRight: 12,
                      width: 48,
                      height: 64,
                      borderRadius: RADIUS.md,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      backgroundColor:
                        selectedDay === index
                          ? "white"
                          : "rgba(255,255,255,0.1)",
                      borderColor:
                        selectedDay === index
                          ? "white"
                          : "rgba(255,255,255,0.2)",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "900",
                        fontSize: 12,
                        color:
                          selectedDay === index
                            ? COLORS.primary
                            : "rgba(255,255,255,0.6)",
                      }}
                    >
                      {day}
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        width: 4,
                        height: 4,
                        borderRadius: 2,
                        backgroundColor:
                          selectedDay === index
                            ? COLORS.primary
                            : "transparent",
                      }}
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 24,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <Text
            style={{
              textAlign: "center",
              color: COLORS.mutedForeground,
              marginTop: 20,
            }}
          >
            Загрузка...
          </Text>
        )}

        {!loading && items.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Feather name="calendar" size={40} color="#E5E7EB" />
            <Text
              style={{
                marginTop: 16,
                color: COLORS.mutedForeground,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              Нет занятий на этот день
            </Text>
          </View>
        )}

        <View className="gap-4">
          {items.map((item) => (
            <View
              key={item.id}
              style={SHADOWS.sm}
              className="bg-white rounded-[32px] p-5 flex-row border border-gray-50 items-center"
            >
              <View className="pr-5 border-r border-gray-100 items-center justify-center w-20">
                <Text className="text-gray-900 font-black text-lg">
                  {item.time_label}
                </Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                  START
                </Text>
              </View>

              <View className="pl-5 flex-1">
                <Text className="text-base font-black text-gray-900 mb-1">
                  {item.subject}
                </Text>
                <View className="flex-row items-center gap-2 mb-2">
                  <View
                    style={{ backgroundColor: item.color + "15" }}
                    className="px-2 py-0.5 rounded-lg"
                  >
                    <Text
                      style={{ color: item.color }}
                      className="text-[10px] font-black uppercase"
                    >
                      {item.group_name}
                    </Text>
                  </View>
                  {item.room ? (
                    <Text className="text-[10px] text-gray-400 font-bold uppercase">
                      • КАБ. {item.room}
                    </Text>
                  ) : null}
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs text-gray-500 font-bold">
                    {item.teacher_name}
                  </Text>
                </View>
              </View>

              <Pressable className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                <Feather name="more-vertical" size={16} color="#D1D5DB" />
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
