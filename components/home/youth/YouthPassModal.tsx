import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { COLORS, RADIUS, SHADOWS } from "@/constants/theme";

type YouthPassModalProps = {
  visible: boolean;
  qrValue: string;
  userName: string;
  onClose: () => void;
};

export function YouthPassModal({
  visible,
  qrValue,
  userName,
  onClose,
}: YouthPassModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          alignItems: "center",
          justifyContent: "center",
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: "white",
            borderRadius: 32,
            padding: 32,
            alignItems: "center",
            width: 300,
            ...SHADOWS.lg,
          }}
        >
          <LinearGradient
            colors={[COLORS.primary, "#A78BFA"]}
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Feather name="maximize" size={30} color="white" />
          </LinearGradient>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: COLORS.foreground,
              marginBottom: 4,
            }}
          >
            Мой пропуск
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: COLORS.mutedForeground,
              marginBottom: 24,
            }}
          >
            {userName}
          </Text>

          <View
            style={{
              padding: 16,
              backgroundColor: "#F9FAFB",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 20,
            }}
          >
            <QRCode
              value={qrValue}
              size={180}
              color={COLORS.foreground}
              backgroundColor="#F9FAFB"
            />
          </View>

          <Text
            style={{
              fontSize: 11,
              color: COLORS.mutedForeground,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Покажите QR куратору или на входе в секцию
          </Text>

          <TouchableOpacity
            onPress={onClose}
            style={{
              paddingHorizontal: 32,
              paddingVertical: 12,
              borderRadius: RADIUS.full,
              backgroundColor: COLORS.primary,
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Закрыть</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
