/**
 * BasicSwipeCard.tsx — Card component for the BASIC "Palette" swipe phase.
 *
 * Shows a large emoji, label, and Like/Dislike buttons.
 * Designed for zero-text interaction (the question is read aloud by TTS).
 */
import { Feather } from "@expo/vector-icons";
import { MotiView } from "moti";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SHADOWS } from "$constants/theme";
import { CATEGORY_COLORS, type BasicCard } from "$data/diagnosticData";

interface Props {
  card: BasicCard;
  index: number;
  total: number;
  onLike: () => void;
  onDislike: () => void;
}

export default function BasicSwipeCard({
  card,
  index,
  total,
  onLike,
  onDislike,
}: Props) {
  const palette = CATEGORY_COLORS[card.category];

  return (
    <MotiView
      key={card.id}
      from={{ opacity: 0, scale: 0.85, translateY: 30 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.85, translateY: -30 }}
      transition={{ type: "timing", duration: 350 }}
      style={styles.wrapper}
    >
      {/* Card */}
      <View style={[styles.card, { backgroundColor: palette.bg }]}>
        {/* Step indicator */}
        <View style={styles.stepRow}>
          <Text style={[styles.stepText, { color: palette.text }]}>
            {index + 1} / {total}
          </Text>
        </View>

        {/* Big emoji */}
        <View style={styles.emojiContainer}>
          <Text style={styles.emoji}>{card.emoji}</Text>
        </View>

        {/* Label */}
        <Text style={[styles.label, { color: palette.text }]}>
          {card.label}
        </Text>

        {/* audio hint */}
        <View
          style={[styles.audioBubble, { backgroundColor: palette.text + "15" }]}
        >
          <Feather name="volume-2" size={16} color={palette.text} />
          <Text
            style={[styles.audioText, { color: palette.text }]}
            numberOfLines={2}
          >
            {card.audioQuestion}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          onPress={onDislike}
          activeOpacity={0.7}
          style={[styles.actionButton, styles.dislikeButton]}
        >
          <Text style={styles.actionEmoji}>👎</Text>
          <Text style={styles.dislikeLabel}>Нет</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onLike}
          activeOpacity={0.7}
          style={[styles.actionButton, styles.likeButton]}
        >
          <Text style={styles.actionEmoji}>👍</Text>
          <Text style={styles.likeLabel}>Да!</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: 32,
    padding: 28,
    alignItems: "center",
    ...SHADOWS.md,
  },
  stepRow: {
    alignSelf: "flex-end",
    marginBottom: 8,
  },
  stepText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255,255,255,0.7)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    ...SHADOWS.sm,
  },
  emoji: {
    fontSize: 80,
  },
  label: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
    textAlign: "center",
  },
  audioBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  audioText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 28,
    width: "100%",
    justifyContent: "center",
  },
  actionButton: {
    flex: 1,
    maxWidth: 160,
    paddingVertical: 20,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.md,
  },
  likeButton: {
    backgroundColor: "#34C759",
  },
  dislikeButton: {
    backgroundColor: "#FF3B30",
  },
  actionEmoji: {
    fontSize: 36,
    marginBottom: 4,
  },
  likeLabel: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
  dislikeLabel: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },
});
