/**
 * VibeSwipeCard.tsx — TikTok/Pinterest style moodboard for 12-14 BASIC phase.
 */
import { MotiView } from "moti";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { COLORS, RADIUS, SHADOWS } from "$constants/theme";
import type { VibeCard } from "$data/diagnosticData1214";
import SwipeableDecisionCard from "$components/diagnostic/SwipeableDecisionCard";

interface Props {
  card: VibeCard;
  index: number;
  total: number;
  onSwipe: (liked: boolean) => void;
}

export default function VibeSwipeCard({ card, index, total, onSwipe }: Props) {
  const [imageLoadState, setImageLoadState] = React.useState({
    uri: card.imageUrl,
    loading: Boolean(card.imageUrl),
  });
  const imageSource = React.useMemo(
    () => (card.imageUrl ? { uri: card.imageUrl } : undefined),
    [card.imageUrl],
  );
  const isImageLoading = Boolean(card.imageUrl) && (
    imageLoadState.uri !== card.imageUrl || imageLoadState.loading
  );
  const handleImageSettled = React.useCallback(() => {
    setImageLoadState({ uri: card.imageUrl, loading: false });
  }, [card.imageUrl]);

  return (
    <MotiView
      key={card.id}
      from={{ opacity: 0, scale: 0.9, translateY: 20 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.9, translateY: -20 }}
      transition={{ type: "timing", duration: 300 }}
      style={styles.wrapper}
    >
      <SwipeableDecisionCard
        cardKey={card.id}
        dislikeLabel="SKIP"
        likeLabel="VIBE"
        onSwipe={onSwipe}
      >
        {({ isLeaving, swipe }) => (
          <>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.stepText}>Vibe Check {index + 1}/{total}</Text>
              </View>

              {/* Image or Pseudo moodboard representation */}
              {card.imageUrl ? (
                <View style={styles.imageFrame}>
                  <Image
                    source={imageSource}
                    style={styles.cardImage}
                    resizeMode="cover"
                    onLoadEnd={handleImageSettled}
                    onError={handleImageSettled}
                  />
                  {isImageLoading && (
                    <View style={styles.imageLoader}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    </View>
                  )}
                </View>
              ) : (
                <View style={styles.moodboardPlaceholder}>
                  <Text style={styles.moodboardEmoji}>📸</Text>
                  <Text style={styles.moodboardDesc}>{card.moodboardDesc}</Text>
                </View>
              )}

              <Text style={styles.cardText}>{card.text}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  disabled={isLeaving}
                  onPress={() => swipe(false)}
                  style={[styles.btn, styles.btnDislike]}
                >
                  <Text style={styles.btnEmoji}>🗑️</Text>
                  <Text style={styles.btnLabelDislike}>Skip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  disabled={isLeaving}
                  onPress={() => swipe(true)}
                  style={[styles.btn, styles.btnLike]}
                >
                  <Text style={styles.btnEmoji}>🔥</Text>
                  <Text style={styles.btnLabelLike}>Vibe</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </SwipeableDecisionCard>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", alignItems: "center" },
  card: {
    width: "100%", backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: 24, ...SHADOWS.md
  },
  header: { alignItems: "center", marginBottom: 20 },
  stepText: { fontSize: 13, fontWeight: "800", color: COLORS.mutedForeground, textTransform: "uppercase", letterSpacing: 1 },
  moodboardPlaceholder: {
    width: "100%", height: 240, backgroundColor: COLORS.muted,
    borderRadius: RADIUS.lg, alignItems: "center", justifyContent: "center",
    marginBottom: 24, padding: 20
  },
  moodboardEmoji: { fontSize: 40, marginBottom: 12 },
  moodboardDesc: { fontSize: 14, color: COLORS.mutedForeground, textAlign: "center", fontStyle: "italic" },
  imageFrame: {
    width: "100%", height: 240, borderRadius: RADIUS.lg,
    marginBottom: 24, backgroundColor: COLORS.muted, overflow: "hidden"
  },
  cardImage: {
    width: "100%", height: "100%"
  },
  imageLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.55)"
  },
  cardText: { fontSize: 22, fontWeight: "900", textAlign: "center", marginBottom: 32 },
  actions: { flexDirection: "row", gap: 16, width: "100%" },
  btn: { flex: 1, paddingVertical: 18, borderRadius: RADIUS.lg, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  btnDislike: { backgroundColor: COLORS.muted },
  btnLike: { backgroundColor: COLORS.primary }, // App's primary violet
  btnEmoji: { fontSize: 20 },
  btnLabelDislike: { fontSize: 16, fontWeight: "800", color: COLORS.foreground },
  btnLabelLike: { fontSize: 16, fontWeight: "800", color: "white" }
});
