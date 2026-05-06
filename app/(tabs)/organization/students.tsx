import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SHADOWS } from "../../../constants/theme";
import { useOrgApplications } from "../../../hooks/useOrgData";
import { getDashboardHorizontalPadding, useIsDesktop } from "../../../lib/useIsDesktop";

export default function OrgStudents() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop, 20);
  const [search, setSearch] = useState("");
  const [activeClub, setActiveClub] = useState("Все");

  const { apps, loading } = useOrgApplications();

  // Active students = activated or paid applications
  const students = apps
    .filter((a) => a.status === "activated" || a.status === "paid")
    .map((a) => ({
      id: a.id,
      name: a.child_name,
      age: a.child_age,
      club: a.club ?? "—",
    }));

  // Dynamic club filter from real data
  const clubs = [
    "Все",
    ...Array.from(
      new Set(students.map((s) => s.club).filter((c) => c !== "—")),
    ),
  ];

  const filtered = students.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchClub = activeClub === "Все" || s.club === activeClub;
    return matchSearch && matchClub;
  });

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
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
                paddingHorizontal: paddingX,
                paddingTop: 12,
                paddingBottom: 32,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700", color: "white" }}>
                Ученики
              </Text>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: isDesktop ? 32 : 100,
        }}
        stickyHeaderIndices={[0]}
      >
        {/* Sticky Search + Filter */}
        <View style={{ backgroundColor: COLORS.background, paddingBottom: 8 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 14,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOpacity: 0.04,
              shadowRadius: 6,
            }}
          >
            <Feather
              name="search"
              size={18}
              color="#9CA3AF"
              style={{ marginRight: 8 }}
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Найти ученика..."
              placeholderTextColor="#9CA3AF"
              style={{ flex: 1, fontSize: 15 }}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {clubs.map((club) => (
              <TouchableOpacity
                key={club}
                onPress={() => setActiveClub(club)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    activeClub === club ? COLORS.primary : COLORS.muted,
                  shadowColor: "#000",
                  shadowOpacity: 0.04,
                  shadowRadius: 4,
                }}
              >
                <Text
                  style={{
                    fontWeight: "600",
                    fontSize: 13,
                    color: activeClub === club ? "white" : "#6B7280",
                  }}
                >
                  {club}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Summary */}
        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginBottom: 20,
            marginTop: 8,
          }}
        >
          {[
            {
              label: "Учеников",
              value: filtered.length,
              ico: "users",
              color: COLORS.primary,
            },
          ].map((s) => (
            <View
              key={s.label}
              style={{
                flex: 1,
                backgroundColor: "white",
                borderRadius: 16,
                padding: 12,
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.04,
                shadowRadius: 6,
              }}
            >
              <Feather name={s.ico as any} size={18} color={s.color} />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "800",
                  color: "#1F1F2E",
                  marginTop: 6,
                }}
              >
                {s.value}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: "#9CA3AF",
                  textAlign: "center",
                  marginTop: 2,
                }}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>

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

        {/* Students */}
        {filtered.map((student) => (
          <Pressable
            key={student.id}
            onPress={() =>
              router.push(`/organization/student/${student.id}` as any)
            }
            style={SHADOWS.sm}
            className="bg-white rounded-3xl p-4 mb-4 border border-gray-100"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-purple-50 items-center justify-center mr-4">
                <Text className="text-xl font-bold text-primary">
                  {student.name.charAt(0)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">
                  {student.name}
                </Text>
                <Text className="text-xs text-gray-500 mt-0.5">
                  {student.age ? `${student.age} лет • ` : ""}
                  {student.club}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={COLORS.mutedForeground}
              />
            </View>
          </Pressable>
        ))}

        {!loading && filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Feather name="users" size={40} color="#E5E7EB" />
            <Text
              style={{
                marginTop: 16,
                color: COLORS.mutedForeground,
                fontWeight: "600",
              }}
            >
              {search ? "Ученики не найдены" : "Нет активных учеников"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
