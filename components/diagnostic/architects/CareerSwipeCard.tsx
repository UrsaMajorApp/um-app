/**
 * CareerSwipeCard.tsx — Strict, stylish Tinder/LinkedIn style for 15-17 BASIC.
 */
import { MotiView } from "moti";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { COLORS, RADIUS, SHADOWS } from "../../../constants/theme";
import type { CareerCard } from "../../../data/diagnosticData1517";
import SwipeableDecisionCard from "../SwipeableDecisionCard";

interface Props {
  card: CareerCard;
  index: number;
  total: number;
  onSwipe: (liked: boolean) => void;
}

export default function CareerSwipeCard({ card, index, total, onSwipe }: Props) {
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
      from={{ opacity: 0, scale: 0.95, translateY: 15 }}
      animate={{ opacity: 1, scale: 1, translateY: 0 }}
      exit={{ opacity: 0, scale: 0.95, translateY: -15 }}
      transition={{ type: "timing", duration: 250 }}
      style={styles.wrapper}
    >
      <SwipeableDecisionCard
        cardKey={card.id}
        dislikeLabel="НЕТ"
        likeLabel="МАТЧ"
        onSwipe={onSwipe}
      >
        {({ isLeaving, swipe }) => (
          <View style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.stepText}>Карьерный Мэтч {index + 1}/{total}</Text>
            </View>

            {/* Image or Pseudo visual representation */}
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
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imageEmoji}>💼</Text>
                <Text style={styles.imageDesc}>{card.visualDesc}</Text>
              </View>
            )}

            <Text style={styles.cardText}>{card.text}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                disabled={isLeaving}
                onPress={() => swipe(false)}
                style={[styles.btn, styles.btnDislike]}
              >
                <Text style={styles.btnEmoji}>❌</Text>
                <Text style={styles.btnLabelDislike}>Не моё</Text>
              </TouchableOpacity>
              <TouchableOpacity
                disabled={isLeaving}
                onPress={() => swipe(true)}
                style={[styles.btn, styles.btnLike]}
              >
                <Text style={styles.btnEmoji}>🔥</Text>
                <Text style={styles.btnLabelLike}>Хочу так</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </SwipeableDecisionCard>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%", alignItems: "center" },
  card: {
    width: "100%", backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl, padding: 24, ...SHADOWS.lg,
    borderWidth: 1, borderColor: "rgba(0,0,0,0.05)"
  },
  header: { alignItems: "center", marginBottom: 20 },
  stepText: { fontSize: 12, fontWeight: "700", color: COLORS.mutedForeground, textTransform: "uppercase", letterSpacing: 1.5 },
  imagePlaceholder: {
    width: "100%", height: 280, backgroundColor: "#F3F4F6",
    borderRadius: RADIUS.xl, alignItems: "center", justifyContent: "center",
    marginBottom: 24, padding: 20
  },
  imageEmoji: { fontSize: 48, marginBottom: 16 },
  imageDesc: { fontSize: 15, color: COLORS.mutedForeground, textAlign: "center", fontStyle: "italic" },
  imageFrame: {
    width: "100%", height: 280, borderRadius: RADIUS.xl,
    marginBottom: 24, backgroundColor: "#F3F4F6", overflow: "hidden"
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
  cardText: { fontSize: 20, fontWeight: "800", textAlign: "center", marginBottom: 32, lineHeight: 28, color: COLORS.foreground },
  actions: { flexDirection: "row", gap: 16, width: "100%" },
  btn: { flex: 1, paddingVertical: 18, borderRadius: RADIUS.full, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  btnDislike: { backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  btnLike: { backgroundColor: COLORS.primary },
  btnEmoji: { fontSize: 18 },
  btnLabelDislike: { fontSize: 16, fontWeight: "700", color: COLORS.foreground },
  btnLabelLike: { fontSize: 16, fontWeight: "700", color: "white" }
});
