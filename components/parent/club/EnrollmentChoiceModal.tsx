import { Feather } from '@expo/vector-icons';
import { Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, SHADOWS } from '$constants/theme';
import { formatKZT } from '$lib/formatCurrency';
import type { PublicCourse, TrialLessonSlot } from '$hooks/usePublicData';
import type { Child } from '$types/child';

type EnrollmentChoiceModalProps = {
  visible: boolean;
  course: Pick<PublicCourse, 'price'>;
  activeChild: Pick<Child, 'name'> | null;
  trialSlots: TrialLessonSlot[];
  enrollmentType: 'trial' | 'full' | null;
  selectedTimeSlot: string | null;
  applying: boolean;
  onClose: () => void;
  onSelectTrial: () => void;
  onSelectFullCourse: () => void;
  onBackFromTrial: () => void;
  onSelectTimeSlot: (slotId: string) => void;
  onConfirmTrial: () => void;
};

export function EnrollmentChoiceModal({
  visible,
  course,
  activeChild,
  trialSlots,
  enrollmentType,
  selectedTimeSlot,
  applying,
  onClose,
  onSelectTrial,
  onSelectFullCourse,
  onBackFromTrial,
  onSelectTimeSlot,
  onConfirmTrial,
}: EnrollmentChoiceModalProps) {
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
              Выберите тип записи
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Feather name="x" size={22} color={COLORS.mutedForeground} />
            </TouchableOpacity>
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

          {!enrollmentType && (
            <View style={{ gap: 12 }}>
              <Pressable
                onPress={onSelectTrial}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: '#10B981',
                  backgroundColor: '#ECFDF5',
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: '#10B981',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Feather name="play-circle" size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '900',
                        color: '#065F46',
                      }}
                    >
                      Пробный урок
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: '#059669',
                        fontWeight: '600',
                      }}
                    >
                      Бесплатно
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={22} color="#10B981" />
                </View>
                <Text style={{ fontSize: 13, color: '#047857', lineHeight: 18 }}>
                  Посетите одно занятие бесплатно, чтобы познакомиться с педагогом и программой
                </Text>
              </Pressable>

              <Pressable
                onPress={onSelectFullCourse}
                style={{
                  padding: 20,
                  borderRadius: 20,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                  backgroundColor: `${COLORS.primary}08`,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: COLORS.primary,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Feather name="calendar" size={20} color="white" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: '900',
                        color: '#4C1D95',
                      }}
                    >
                      Полный курс
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: COLORS.primary,
                        fontWeight: '600',
                      }}
                    >
                      {formatKZT(course.price)}/мес
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={22} color={COLORS.primary} />
                </View>
                <Text style={{ fontSize: 13, color: '#6B21A8', lineHeight: 18 }}>
                  Запишитесь на полный курс занятий с регулярным расписанием
                </Text>
              </Pressable>
            </View>
          )}

          {enrollmentType === 'trial' && (
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 16,
                }}
              >
                <TouchableOpacity onPress={onBackFromTrial} style={{ marginRight: 12 }}>
                  <Feather name="arrow-left" size={20} color={COLORS.mutedForeground} />
                </TouchableOpacity>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '800',
                    color: COLORS.foreground,
                  }}
                >
                  Выберите время пробного урока
                </Text>
              </View>

              <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {trialSlots.length === 0 && (
                    <Text
                      style={{
                        color: COLORS.mutedForeground,
                        paddingVertical: 16,
                      }}
                    >
                      Организация пока не добавила слоты для пробного урока.
                    </Text>
                  )}
                  {trialSlots.map((slot) => {
                    const isSelected = selectedTimeSlot === slot.id;
                    return (
                      <Pressable
                        key={slot.id}
                        onPress={() => onSelectTimeSlot(slot.id)}
                        style={{
                          paddingHorizontal: 18,
                          paddingVertical: 14,
                          borderRadius: 16,
                          borderWidth: 2,
                          borderColor: isSelected ? '#10B981' : '#E5E7EB',
                          backgroundColor: isSelected ? '#ECFDF5' : 'white',
                          minWidth: 90,
                          alignItems: 'center',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '800',
                            color: isSelected ? '#065F46' : COLORS.foreground,
                          }}
                        >
                          {slot.day_label}
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: isSelected ? '#059669' : COLORS.mutedForeground,
                            marginTop: 2,
                          }}
                        >
                          {slot.time_label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              <TouchableOpacity
                disabled={applying || !selectedTimeSlot}
                onPress={onConfirmTrial}
                style={{
                  backgroundColor: applying || !selectedTimeSlot ? '#E5E7EB' : '#10B981',
                  paddingVertical: 18,
                  borderRadius: 22,
                  alignItems: 'center',
                  marginTop: 20,
                }}
              >
                <Text
                  style={{
                    color: applying || !selectedTimeSlot ? '#9CA3AF' : 'white',
                    fontSize: 16,
                    fontWeight: '900',
                  }}
                >
                  {applying ? 'Бронирование...' : 'Забронировать пробный урок'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
