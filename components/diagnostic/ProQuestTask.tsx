/**
 * ProQuestTask.tsx — Single task screen for the PRO "Space Quest" phase.
 *
 * Cosmic-themed card with answer options, stealth timer, and mascot audio.
 */
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SHADOWS } from '$constants/theme';
import type { ProTask } from '$data/diagnosticData';

const STAR_POSITIONS = [
  { id: 'star-alpha', top: '12%', left: '18%', size: 3, opacity: 0.62 },
  { id: 'star-beta', top: '18%', left: '72%', size: 4, opacity: 0.48 },
  { id: 'star-gamma', top: '25%', left: '42%', size: 2, opacity: 0.72 },
  { id: 'star-delta', top: '34%', left: '86%', size: 3, opacity: 0.38 },
  { id: 'star-epsilon', top: '45%', left: '9%', size: 5, opacity: 0.52 },
  { id: 'star-zeta', top: '52%', left: '64%', size: 2, opacity: 0.8 },
  { id: 'star-eta', top: '61%', left: '31%', size: 4, opacity: 0.45 },
  { id: 'star-theta', top: '69%', left: '78%', size: 3, opacity: 0.68 },
  { id: 'star-iota', top: '76%', left: '15%', size: 2, opacity: 0.58 },
  { id: 'star-kappa', top: '82%', left: '53%', size: 5, opacity: 0.34 },
  { id: 'star-lambda', top: '88%', left: '91%', size: 3, opacity: 0.5 },
  { id: 'star-mu', top: '8%', left: '51%', size: 2, opacity: 0.74 },
] as const;

interface Props {
  task: ProTask;
  index: number;
  total: number;
  onAnswer: (optionId: number) => void;
}

export default function ProQuestTask({ task, index, total, onAnswer }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleSelect = (optionId: number) => {
    if (confirmed) return;
    setSelected(optionId);
  };

  const handleConfirm = () => {
    if (selected === null || confirmed) return;
    setConfirmed(true);
    // Short delay for visual feedback then advance
    setTimeout(() => {
      onAnswer(selected);
      setSelected(null);
      setConfirmed(false);
    }, 400);
  };

  return (
    <MotiView
      key={task.id}
      from={{ opacity: 0, translateX: 60 }}
      animate={{ opacity: 1, translateX: 0 }}
      exit={{ opacity: 0, translateX: -60 }}
      transition={{ type: 'timing', duration: 350 }}
      style={styles.wrapper}
    >
      {/* Cosmic card */}
      <LinearGradient
        colors={['#1A1040', '#2D1B69']}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Stars background decoration */}
        <View style={styles.starsContainer}>
          {STAR_POSITIONS.map((star) => (
            <View
              key={star.id}
              style={[
                styles.star,
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                },
              ]}
            />
          ))}
        </View>

        {/* Step */}
        <View style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Feather name="star" size={12} color="#FFD700" />
            <Text style={styles.stepText}>
              Задание {index + 1} из {total}
            </Text>
          </View>
        </View>

        {/* Visual hint */}
        {task.visualHint && (
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>{task.visualHint}</Text>
          </View>
        )}

        {/* Audio question text (shown for accessibility) */}
        <View style={styles.questionBubble}>
          <Feather name="volume-2" size={18} color="white" />
          <Text style={styles.questionText}>{task.audioQuestion}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsGrid}>
          {task.options.map((opt) => {
            const isSelected = selected === opt.id;
            const isCorrectFeedback =
              confirmed && isSelected && (task.correctIndex === -1 || opt.id === task.correctIndex);
            const isWrongFeedback =
              confirmed && isSelected && task.correctIndex !== -1 && opt.id !== task.correctIndex;

            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => handleSelect(opt.id)}
                activeOpacity={0.7}
                style={[
                  styles.optionButton,
                  isSelected && !confirmed && styles.optionSelected,
                  isCorrectFeedback && styles.optionCorrect,
                  isWrongFeedback && styles.optionWrong,
                ]}
              >
                <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Confirm */}
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={selected === null || confirmed}
          activeOpacity={0.8}
          style={[styles.confirmButton, (selected === null || confirmed) && styles.confirmDisabled]}
        >
          <Text style={styles.confirmText}>{confirmed ? '✓' : 'Ответить!'}</Text>
        </TouchableOpacity>
      </LinearGradient>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    borderRadius: 32,
    padding: 24,
    overflow: 'hidden',
    ...SHADOWS.lg,
  },
  starsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'white',
  },
  stepRow: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  stepText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
  },
  hintContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  hintText: {
    fontSize: 32,
    textAlign: 'center',
    lineHeight: 44,
  },
  questionBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 22,
    marginBottom: 24,
  },
  questionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    lineHeight: 22,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 20,
  },
  optionButton: {
    minWidth: '28%',
    flexGrow: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    borderColor: '#A78BFA',
    backgroundColor: 'rgba(167,139,250,0.2)',
  },
  optionCorrect: {
    borderColor: '#34C759',
    backgroundColor: 'rgba(52,199,89,0.25)',
  },
  optionWrong: {
    borderColor: '#FF3B30',
    backgroundColor: 'rgba(255,59,48,0.2)',
  },
  optionEmoji: {
    fontSize: 36,
    marginBottom: 6,
  },
  optionLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionLabelSelected: {
    color: 'white',
  },
  confirmButton: {
    backgroundColor: '#A78BFA',
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  confirmDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  confirmText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  },
});
