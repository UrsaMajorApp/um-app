// WYRCard: карточка выбора “что бы ты предпочел” для creator-диагностики.
/**
 * WYRCard.tsx — "Would You Rather" card for the BASIC phase (9–11).
 *
 * Shows a situation and two large choice buttons.
 * A 10-second countdown timer encourages intuitive responses.
 */
import { MotiView } from 'moti';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';
import type { BasicSkill911, WYRCard as WYRCardType } from '$data/diagnosticData911';

interface Props {
  card: WYRCardType;
  index: number;
  total: number;
  onChoice: (skill: BasicSkill911) => void;
  /** Seconds for the intuitive-response timer. Default 10. */
  timerSeconds?: number;
}

export default function WYRCard({ card, index, total, onChoice, timerSeconds = 10 }: Props) {
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [chosen, setChosen] = useState<'A' | 'B' | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const optionASkill = card.optionA.skill;
  const optionBSkill = card.optionB.skill;

  // Reset on card change
  useEffect(() => {
    void card.id;
    setTimeLeft(timerSeconds);
    setChosen(null);
  }, [card.id, timerSeconds]);

  // Countdown
  useEffect(() => {
    void card.id;
    if (chosen) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          // Auto-choose randomly on timeout for natural flow
          const auto = Math.random() < 0.5 ? 'A' : 'B';
          setChosen(auto);
          setTimeout(() => onChoice(auto === 'A' ? optionASkill : optionBSkill), 300);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [card.id, chosen, onChoice, optionASkill, optionBSkill]);

  const handleChoice = (which: 'A' | 'B') => {
    if (chosen) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setChosen(which);
    setTimeout(() => onChoice(which === 'A' ? optionASkill : optionBSkill), 350);
  };

  const timerColor =
    timeLeft > 6 ? COLORS.success : timeLeft > 3 ? COLORS.warning : COLORS.destructive;
  const timerPct = (timeLeft / timerSeconds) * 100;

  return (
    <MotiView
      key={card.id}
      from={{ opacity: 0, translateY: 28 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -28 }}
      transition={{ type: 'timing', duration: 350 }}
      style={styles.wrapper}
    >
      {/* Step badge */}
      <View style={styles.stepRow}>
        <Text style={styles.stepText}>
          {index + 1} / {total}
        </Text>
      </View>

      {/* Situation card */}
      <View style={styles.situationCard}>
        <Text style={styles.questionEmoji}>🤔</Text>
        <Text style={styles.situationText}>{card.situation}</Text>

        {/* Timer bar */}
        <View style={styles.timerTrack}>
          <MotiView
            animate={{ width: `${timerPct}%` }}
            transition={{ type: 'timing', duration: 900 }}
            style={[styles.timerFill, { backgroundColor: timerColor }]}
          />
        </View>
        <Text style={[styles.timerLabel, { color: timerColor }]}>{timeLeft} сек</Text>
      </View>

      {/* VS divider */}
      <View style={styles.vsDivider}>
        <View style={styles.vsLine} />
        <View style={styles.vsBadge}>
          <Text style={styles.vsText}>ИЛИ</Text>
        </View>
        <View style={styles.vsLine} />
      </View>

      {/* Option buttons */}
      <View style={styles.optionsRow}>
        <TouchableOpacity
          onPress={() => handleChoice('A')}
          activeOpacity={0.75}
          disabled={!!chosen}
          style={[
            styles.optionButton,
            styles.optionA,
            chosen === 'A' && styles.optionChosen,
            chosen === 'B' && styles.optionFaded,
          ]}
        >
          <Text style={styles.optionLabel}>{card.optionA.label}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleChoice('B')}
          activeOpacity={0.75}
          disabled={!!chosen}
          style={[
            styles.optionButton,
            styles.optionB,
            chosen === 'B' && styles.optionChosen,
            chosen === 'A' && styles.optionFaded,
          ]}
        >
          <Text style={styles.optionLabel}>{card.optionB.label}</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  stepRow: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  situationCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  questionEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  situationText: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.foreground,
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 20,
  },
  timerTrack: {
    width: '100%',
    height: 6,
    backgroundColor: COLORS.muted,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  timerFill: {
    height: '100%',
    borderRadius: 3,
  },
  timerLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 18,
    gap: 10,
  },
  vsLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  vsBadge: {
    backgroundColor: COLORS.muted,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  vsText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.mutedForeground,
    letterSpacing: 1.5,
  },
  optionsRow: {
    width: '100%',
    gap: 14,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  optionA: {
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 2,
    borderColor: `${COLORS.primary}40`,
  },
  optionB: {
    backgroundColor: `${COLORS.secondary}15`,
    borderWidth: 2,
    borderColor: `${COLORS.secondary}40`,
  },
  optionChosen: {
    opacity: 1,
    borderWidth: 2.5,
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}22`,
  },
  optionFaded: {
    opacity: 0.4,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    textAlign: 'center',
    lineHeight: 22,
  },
});
