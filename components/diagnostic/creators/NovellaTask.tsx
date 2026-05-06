/**
 * NovellaTask.tsx — Visual novel / messenger UI for PRO phase (9–11).
 *
 * Renders the RPG "Тайна Лаборатории 404" quest tasks in a chat-like
 * messenger style. Messages appear from virtual friends (Макс, Алиса)
 * or the SYSTEM.
 */
import { LinearGradient } from "expo-linear-gradient";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RADIUS, SHADOWS } from "../../../constants/theme";
import type { ProTask911 } from "../../../data/diagnosticData911";

const SPEAKER_CONFIG = {
  system: {
    name: "🖥️ СИСТЕМА",
    avatar: "🖥️",
    bubbleColor: "#1E1B4B",
    textColor: "#C7D2FE",
    nameColor: "#818CF8",
  },
  max: {
    name: "👦 Макс",
    avatar: "👦",
    bubbleColor: "#0F172A",
    textColor: "#BAE6FD",
    nameColor: "#38BDF8",
  },
  alice: {
    name: "👧 Алиса",
    avatar: "👧",
    bubbleColor: "#1F0B2E",
    textColor: "#F5D0FE",
    nameColor: "#E879F9",
  },
};

const ACT_LABELS: Record<1 | 2 | 3, string> = {
  1: "АКТ 1 · Вход в систему",
  2: "АКТ 2 · Командная работа",
  3: "АКТ 3 · Кризис",
};

interface Props {
  task: ProTask911;
  index: number;
  total: number;
  onAnswer: (optionId: number) => void;
}

export default function NovellaTask({ task, index, total, onAnswer }: Props) {
  const cfg = SPEAKER_CONFIG[task.speaker];

  return (
    <MotiView
      key={task.id}
      from={{ opacity: 0, translateY: 24 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -24 }}
      transition={{ type: "timing", duration: 380 }}
      style={styles.wrapper}
    >
      {/* Act label */}
      <View style={styles.actRow}>
        <Text style={styles.actLabel}>{ACT_LABELS[task.act]}</Text>
        <Text style={styles.stepLabel}>
          {index + 1} / {total}
        </Text>
      </View>

      {/* Construct tag */}
      <View style={styles.constructTag}>
        <Text style={styles.constructText}>{task.construct}</Text>
      </View>

      {/* Chat bubble */}
      <MotiView
        from={{ opacity: 0, scale: 0.93 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "timing", duration: 350, delay: 100 }}
      >
        <View style={[styles.bubble, { backgroundColor: cfg.bubbleColor }]}>
          {/* Speaker */}
          <View style={styles.speakerRow}>
            <Text style={styles.speakerAvatar}>{cfg.avatar}</Text>
            <Text style={[styles.speakerName, { color: cfg.nameColor }]}>
              {cfg.name}
            </Text>
          </View>

          {/* Message text */}
          <Text style={[styles.messageText, { color: cfg.textColor }]}>
            {task.situation}
          </Text>
        </View>
      </MotiView>

      {/* Options */}
      <View style={styles.optionsContainer}>
        <Text style={styles.chooseHint}>Выберите действие:</Text>
        <View style={styles.optionsList}>
          {task.options.map((opt, i) => (
            <MotiView
              key={opt.id}
              from={{ opacity: 0, translateX: 20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{
                type: "timing",
                duration: 300,
                delay: 200 + i * 80,
              }}
            >
              <TouchableOpacity
                onPress={() => onAnswer(opt.id)}
                activeOpacity={0.75}
                style={styles.optionButton}
              >
                <LinearGradient
                  colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.03)"]}
                  style={styles.optionGradient}
                >
                  <View style={styles.optionInner}>
                    <View style={styles.optionBullet}>
                      <Text style={styles.optionBulletText}>
                        {String.fromCharCode(65 + i)}
                      </Text>
                    </View>
                    <Text style={styles.optionText}>{opt.label}</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  actRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  actLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#6366F1",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 0.5,
  },
  constructTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(99,102,241,0.2)",
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.4)",
  },
  constructText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#818CF8",
    letterSpacing: 0.5,
  },
  bubble: {
    borderRadius: RADIUS.lg,
    padding: 18,
    marginBottom: 20,
    borderTopLeftRadius: 4,
    ...SHADOWS.md,
  },
  speakerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  speakerAvatar: {
    fontSize: 20,
  },
  speakerName: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  messageText: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
  optionsContainer: {
    gap: 10,
  },
  chooseHint: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  optionGradient: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  optionInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  optionBullet: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(99,102,241,0.35)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.6)",
  },
  optionBulletText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#A5B4FC",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    flex: 1,
    lineHeight: 20,
  },
});
