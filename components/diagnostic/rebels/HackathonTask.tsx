/**
 * HackathonTask.tsx — Messenger simulation for 12-14 PRO phase.
 */
import { MotiView } from 'moti';
import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, RADIUS } from '$constants/theme';
import type { ProTask1214 } from '$data/diagnosticData1214';

const SPEAKERS = {
  system: { name: 'СИСТЕМА', color: '#818CF8', bg: '#1E1B4B' },
  max: { name: 'Макс', color: '#38BDF8', bg: '#0F172A' },
  alice: { name: 'Алиса', color: '#E879F9', bg: '#1F0B2E' },
  bot: { name: 'Бот', color: '#34D399', bg: '#064E3B' },
  jury: { name: 'Жюри', color: '#FBBF24', bg: '#451A03' },
};

interface Props {
  task: ProTask1214;
  index: number;
  total: number;
  onAnswer: (optionId: number, erasedAggressive?: boolean) => void;
}

export default function HackathonTask({ task, index, total, onAnswer }: Props) {
  const cfg = SPEAKERS[task.speaker];
  const [erased] = useState(false);

  const handleSelect = (optId: number) => {
    // Basic stealth simulation:
    // In a real app we'd track backspaces in a text input,
    // but here if they click option 0 (often aggressive/impulsive in our data)
    // and then switch to option 1, we count it as "erased aggressive".
    // For MVP, we'll just pass false to keep it simple, or implement a 2-tap confirm.
    onAnswer(optId, erased);
  };

  return (
    <MotiView
      key={task.id}
      from={{ opacity: 0, translateY: 15 }}
      animate={{ opacity: 1, translateY: 0 }}
      exit={{ opacity: 0, translateY: -15 }}
      style={styles.wrapper}
    >
      <View style={styles.header}>
        <Text style={styles.headerText}>
          ACT {task.act} • {task.construct}
        </Text>
        <Text style={styles.stepText}>
          {index + 1}/{total}
        </Text>
      </View>

      <View style={[styles.bubble, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
        <Text style={[styles.speakerName, { color: cfg.color }]}>{cfg.name}</Text>
        <Text style={styles.messageText}>{task.situation}</Text>
      </View>

      <View style={styles.optionsList}>
        {task.options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => handleSelect(opt.id)}
            style={styles.optionBtn}
          >
            <Text style={styles.optionText}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: '100%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  headerText: {
    color: COLORS.mutedForeground,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  stepText: { color: COLORS.mutedForeground, fontSize: 12, fontWeight: '700' },
  bubble: {
    padding: 16,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: 24,
    borderTopLeftRadius: 4,
  },
  speakerName: { fontSize: 13, fontWeight: '800', marginBottom: 6 },
  messageText: { color: 'white', fontSize: 16, lineHeight: 24, fontWeight: '500' },
  optionsList: { gap: 10 },
  optionBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
