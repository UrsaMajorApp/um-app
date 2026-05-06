import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { COLORS, RADIUS, SHADOWS } from '$constants/theme';

export function NotificationsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.4)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            width: 340,
            backgroundColor: COLORS.card,
            borderRadius: RADIUS.lg,
            padding: 24,
            ...SHADOWS.lg,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                flex: 1,
                fontSize: 18,
                fontWeight: '700',
                color: COLORS.foreground,
              }}
            >
              Уведомления
            </Text>
            <Pressable onPress={onClose}>
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </Pressable>
          </View>
          <View style={{ alignItems: 'center', paddingVertical: 32 }}>
            <Feather
              name="bell-off"
              size={36}
              color={COLORS.mutedForeground}
              style={{ marginBottom: 12 }}
            />
            <Text style={{ color: COLORS.mutedForeground, textAlign: 'center' }}>
              Нет новых уведомлений
            </Text>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Desktop side nav ────────────────────────────────────────────────────────
