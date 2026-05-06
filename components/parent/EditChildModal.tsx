import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { COLORS, RADIUS, SHADOWS, SPACING } from "../../constants/theme";
import { isWebMinWidth } from "../../lib/useIsDesktop";
import { Child } from "../../models/types";

export default function EditChildModal({
  child,
  onSave,
  onClose,
}: {
  child: Child;
  onSave: (patch: Partial<Child>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(child.name);
  const [age, setAge] = useState(String(child.age ?? ""));
  const { width } = useWindowDimensions();
  const isDesktop = isWebMinWidth(width, 768);

  const handleSave = () => {
    const parsed = parseInt(age, 10);
    const ageCategory: Child["ageCategory"] =
      parsed <= 11 ? "child" : parsed <= 17 ? "teen" : "young-adult";
    onSave({
      name: name.trim() || child.name,
      age: Number.isFinite(parsed) ? parsed : child.age,
      ageCategory,
    });
    onClose();
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "center",
          alignItems: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: isDesktop ? 400 : "90%",
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: 24,
            ...SHADOWS.lg,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: COLORS.foreground,
              }}
            >
              Редактировать профиль
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </Pressable>
          </View>

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.mutedForeground,
              marginBottom: 6,
            }}
          >
            Имя
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              marginBottom: 16,
              fontSize: 15,
              color: COLORS.foreground,
              backgroundColor: COLORS.background,
            }}
            placeholder="Имя ребёнка"
          />

          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: COLORS.mutedForeground,
              marginBottom: 6,
            }}
          >
            Возраст
          </Text>
          <TextInput
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: RADIUS.md,
              padding: SPACING.md,
              marginBottom: 24,
              fontSize: 15,
              color: COLORS.foreground,
              backgroundColor: COLORS.background,
            }}
            placeholder="Возраст"
          />

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={onClose}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: "center",
              }}
            >
              <Text style={{ color: COLORS.foreground, fontWeight: "600" }}>
                Отмена
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.primary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                Сохранить
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
