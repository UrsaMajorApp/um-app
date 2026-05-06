/**
 * OsTask.tsx — Virtual OS simulation for 15-17 PRO phase.
 * Simulates Mail, Slack, and Trello interfaces.
 */
import { MotiView } from "moti";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";
import type { ProTask1517 } from "$data/diagnosticData1517";

interface Props {
  task: ProTask1517;
  index: number;
  total: number;
  onAnswer: (optionId: number, erasedOrFrantic?: boolean) => void;
}

const MODULE_STYLES = {
  mail: {
    icon: "📧",
    title: "Корпоративная Почта",
    bg: "#FFFFFF",
    headerBg: "#F3F4F6",
    color: "#4B5563",
  },
  slack: {
    icon: "💬",
    title: "Чат Команды",
    bg: "#4A154B",
    headerBg: "#350D36",
    color: "#FFFFFF",
  },
  trello: {
    icon: "📊",
    title: "Task Tracker",
    bg: "#0079BF",
    headerBg: "#005C91",
    color: "#FFFFFF",
  },
};

export default function OsTask({ task, index, total, onAnswer }: Props) {
  const stylesCfg = MODULE_STYLES[task.module];
  const [interacted, setInteracted] = useState(false);

  const handleSelect = (optId: number) => {
    // Basic stealth simulation:
    // If they interact multiple times (simulating frantic clicks or editing)
    onAnswer(optId, interacted);
  };

  return (
    <MotiView
      key={task.id}
      from={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      style={styles.wrapper}
    >
      <View style={[styles.window, { backgroundColor: stylesCfg.bg }]}>
        {/* OS Window Header */}
        <View
          style={[styles.windowHeader, { backgroundColor: stylesCfg.headerBg }]}
        >
          <View style={styles.windowControls}>
            <View style={[styles.dot, { backgroundColor: "#FF5F56" }]} />
            <View style={[styles.dot, { backgroundColor: "#FFBD2E" }]} />
            <View style={[styles.dot, { backgroundColor: "#27C93F" }]} />
          </View>
          <Text style={[styles.windowTitle, { color: stylesCfg.color }]}>
            {stylesCfg.icon} {stylesCfg.title} ({index + 1}/{total})
          </Text>
        </View>

        {/* Content Area */}
        <View style={styles.contentArea}>
          <View style={styles.senderRow}>
            <Text
              style={[
                styles.senderLabel,
                task.module !== "mail" && { color: "rgba(255,255,255,0.7)" },
              ]}
            >
              От:
            </Text>
            <Text
              style={[
                styles.senderName,
                task.module !== "mail" && { color: "#FFFFFF" },
              ]}
            >
              {task.sender}
            </Text>
          </View>

          <Text
            style={[
              styles.situationText,
              task.module !== "mail" && { color: "#FFFFFF" },
            ]}
          >
            {task.situation}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.optionsList}>
          {task.options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => {
                if (!interacted) setInteracted(true);
                handleSelect(opt.id);
              }}
              style={[
                styles.optionBtn,
                task.module !== "mail" && {
                  backgroundColor: "rgba(255,255,255,0.15)",
                  borderColor: "rgba(255,255,255,0.3)",
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  task.module !== "mail" && { color: "#FFFFFF" },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", paddingVertical: 10 },
  window: {
    width: "100%",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  windowHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  windowControls: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    left: 16,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  windowTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
  },
  contentArea: { padding: 24 },
  senderRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  senderLabel: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    fontWeight: "600",
  },
  senderName: { fontSize: 15, fontWeight: "800", color: COLORS.foreground },
  situationText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "500",
    color: COLORS.foreground,
  },
  optionsList: { padding: 24, paddingTop: 0, gap: 12 },
  optionBtn: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionText: {
    color: COLORS.foreground,
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
  },
});
