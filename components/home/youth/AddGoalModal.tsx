// AddGoalModal: модал с одним инпутом для создания новой цели young-adult.
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, RADIUS, SHADOWS, SPACING } from '$constants/theme';
import { isWebMinWidth } from '$lib/useIsDesktop';

export default function AddGoalModal({
  onSave,
  onClose,
}: {
  onSave: (title: string) => void | Promise<void>;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { width } = useWindowDimensions();
  const isDesktop = isWebMinWidth(width, 768);

  const handleSave = async () => {
    const trimmed = title.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    try {
      await onSave(trimmed);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: isDesktop ? 400 : '90%',
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: 24,
            ...SHADOWS.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.foreground }}>
              Новая цель
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </Pressable>
          </View>

          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: COLORS.mutedForeground,
              marginBottom: 6,
            }}
          >
            Название
          </Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            autoFocus
            onSubmitEditing={handleSave}
            returnKeyType="done"
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
            placeholder="Например, Прочитать 5 книг"
          />

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <PressableScale
              onPress={onClose}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: RADIUS.md,
                borderWidth: 1,
                borderColor: COLORS.border,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: COLORS.foreground, fontWeight: '600' }}>Отмена</Text>
            </PressableScale>
            <PressableScale
              onPress={handleSave}
              disabled={!title.trim() || submitting}
              style={{
                flex: 1,
                padding: 14,
                borderRadius: RADIUS.md,
                backgroundColor: COLORS.primary,
                alignItems: 'center',
                opacity: !title.trim() || submitting ? 0.5 : 1,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700' }}>
                {submitting ? 'Создание…' : 'Создать'}
              </Text>
            </PressableScale>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
