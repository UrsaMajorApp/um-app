import { COLORS } from "$constants/theme";
import { useAuth } from "$contexts/AuthContext";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import AdminHome from "$app/(tabs)/home/_home/AdminHome";
import MentorHome from "$app/(tabs)/home/_home/MentorHome";
import OrgHome from "$app/(tabs)/home/_home/OrgHome";
import ParentHome from "$app/(tabs)/home/_home/ParentHome";
import TeacherHome from "$app/(tabs)/home/_home/TeacherHome";
import YouthHome from "$app/(tabs)/home/_home/YouthHome";

type Role =
  | "parent"
  | "youth"
  | "child"
  | "mentor"
  | "org"
  | "teacher"
  | "admin";

export default function HomeScreenRouter() {
  const { user, isLoading } = useAuth();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    if (user?.role) {
      setRole(user.role as Role);
    } else {
      setRole(null);
    }
  }, [user]);

  // Показываем индикатор загрузки, пока мы достаем роль
  if (isLoading || !role) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Возвращаем изолированный экран на основе текущей роли
  switch (role) {
    case "parent":
      return <ParentHome />;
    case "youth":
    case "child":
      return <YouthHome />;
    case "mentor":
      return <MentorHome />;
    case "org":
      return <OrgHome />;
    case "teacher":
      return <TeacherHome />;
    case "admin":
      return <AdminHome />;
    default:
      return <ParentHome />;
  }
}
