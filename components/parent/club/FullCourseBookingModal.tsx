// FullCourseBookingModal: собирает данные полной записи ребенка на выбранный курс.
import { Feather } from '@expo/vector-icons';
import { Modal, ScrollView, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import type { OrgGroup } from '$hooks/useOrgData';
import type { Child } from '$types/child';

interface FullCourseBookingModalProps {
  visible: boolean;
  activeChild: Pick<Child, 'name'> | null;
  groups: OrgGroup[];
  selectedGroupId: string | null;
  applying: boolean;
  onClose: () => void;
  onSelectGroup: (groupId: string) => void;
  onConfirm: () => void;
}

export function FullCourseBookingModal({
  visible,
  activeChild,
  groups,
  selectedGroupId,
  applying,
  onClose,
  onSelectGroup,
  onConfirm,
}: FullCourseBookingModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            padding: 24,
            paddingBottom: 40,
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
            <Text
              style={{
                fontSize: 22,
                fontWeight: '900',
                color: COLORS.foreground,
              }}
            >
              Запись на полный курс
            </Text>
            <PressableScale
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </PressableScale>
          </View>

          {activeChild && (
            <View
              style={{
                backgroundColor: `${COLORS.primary}10`,
                padding: 14,
                borderRadius: 18,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 14,
                }}
              >
                <Text style={{ color: 'white', fontSize: 18, fontWeight: '900' }}>
                  {activeChild.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text
                  style={{
                    fontSize: 11,
                    color: COLORS.mutedForeground,
                    fontWeight: '700',
                    textTransform: 'uppercase',
                  }}
                >
                  Ребёнок
                </Text>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: '900',
                    color: COLORS.foreground,
                  }}
                >
                  {activeChild.name}
                </Text>
              </View>
            </View>
          )}

          <Text
            style={{
              fontSize: 15,
              fontWeight: '800',
              color: COLORS.foreground,
              marginBottom: 12,
            }}
          >
            {groups.length > 0 ? 'Выберите группу' : 'Расписание уточняется'}
          </Text>

          {groups.length > 0 ? (
            <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
              {groups.map((group) => (
                <PressableScale
                  key={group.id}
                  onPress={() => onSelectGroup(group.id)}
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 14,
                    borderRadius: 18,
                    marginBottom: 10,
                    borderWidth: 2,
                    borderColor: selectedGroupId === group.id ? COLORS.primary : '#F3F4F6',
                    backgroundColor: selectedGroupId === group.id ? `${COLORS.primary}05` : 'white',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: '800',
                        color: COLORS.foreground,
                      }}
                    >
                      {group.name}
                    </Text>
                    {group.schedule ? (
                      <Text
                        style={{
                          fontSize: 12,
                          color: COLORS.mutedForeground,
                          marginTop: 3,
                        }}
                      >
                        {group.schedule}
                      </Text>
                    ) : null}
                    <Text
                      style={{
                        fontSize: 11,
                        color: COLORS.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      Мест:{' '}
                      {group.capacity - group.enrolled > 0
                        ? `${group.capacity - group.enrolled} свободно`
                        : 'Группа полная'}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      borderWidth: 2,
                      borderColor: selectedGroupId === group.id ? COLORS.primary : '#D1D5DB',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {selectedGroupId === group.id && (
                      <View
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: COLORS.primary,
                        }}
                      />
                    )}
                  </View>
                </PressableScale>
              ))}
            </ScrollView>
          ) : (
            <View
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: COLORS.mutedForeground,
                  fontSize: 14,
                  textAlign: 'center',
                }}
              >
                Организация скоро добавит группы с расписанием
              </Text>
            </View>
          )}

          <PressableScale
            disabled={applying || (groups.length > 0 && !selectedGroupId)}
            onPress={onConfirm}
            style={{
              backgroundColor:
                applying || (groups.length > 0 && !selectedGroupId) ? '#E5E7EB' : COLORS.primary,
              paddingVertical: 18,
              borderRadius: 22,
              alignItems: 'center',
              marginTop: 16,
            }}
          >
            <Text
              style={{
                color: applying || (groups.length > 0 && !selectedGroupId) ? '#9CA3AF' : 'white',
                fontSize: 16,
                fontWeight: '900',
              }}
            >
              {applying ? 'Отправка...' : 'Подтвердить заявку'}
            </Text>
          </PressableScale>
        </View>
      </View>
    </Modal>
  );
}
