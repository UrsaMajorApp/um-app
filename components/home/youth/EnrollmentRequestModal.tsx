// EnrollmentRequestModal: показывает youth-заявку на курс и отправляет выбранное действие.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Text, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { COLORS, SHADOWS } from '$constants/theme';
import { courseGradient, type PublicCourse } from '$hooks/usePublicData';
import { formatKZT } from '$lib/formatCurrency';
import { featherIconName } from '$lib/icons';

interface EnrollmentRequestModalProps {
  visible: boolean;
  selectedCourse: PublicCourse | null;
  enrollmentRequested: string[];
  requiresParentApproval?: boolean;
  onClose: () => void;
  onRequestEnrollment: () => void;
}

export function EnrollmentRequestModal({
  visible,
  selectedCourse,
  enrollmentRequested,
  requiresParentApproval = true,
  onClose,
  onRequestEnrollment,
}: EnrollmentRequestModalProps) {
  const isRequested = selectedCourse ? enrollmentRequested.includes(selectedCourse.id) : false;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
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
              Записаться в кружок
            </Text>
            <PressableScale onPress={onClose}>
              <Feather name="x" size={24} color={COLORS.mutedForeground} />
            </PressableScale>
          </View>

          {selectedCourse && (
            <>
              <LinearGradient
                colors={courseGradient(0)}
                style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather
                      name={featherIconName(selectedCourse.icon, 'book-open')}
                      size={26}
                      color="white"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '800',
                        color: 'white',
                      }}
                    >
                      {selectedCourse.title}
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.8)',
                        marginTop: 2,
                      }}
                    >
                      {selectedCourse.org_name || 'Организация'}
                    </Text>
                  </View>
                </View>
              </LinearGradient>

              <View
                style={{
                  backgroundColor: requiresParentApproval ? '#FEF3C7' : '#ECFDF5',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 20,
                  flexDirection: 'row',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: requiresParentApproval ? '#FDE68A' : '#BBF7D0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Feather
                    name={requiresParentApproval ? 'bell' : 'check-circle'}
                    size={18}
                    color={requiresParentApproval ? '#B45309' : '#047857'}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: '700',
                      color: requiresParentApproval ? '#92400E' : '#047857',
                      marginBottom: 4,
                    }}
                  >
                    {requiresParentApproval ? 'Нужно одобрение родителя' : 'Самостоятельная запись'}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: requiresParentApproval ? '#B45309' : '#047857',
                      lineHeight: 18,
                    }}
                  >
                    {requiresParentApproval
                      ? 'Родитель получит push-уведомление и сможет подтвердить или отклонить вашу заявку'
                      : 'Заявка уйдет напрямую организации без родительского подтверждения.'}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  backgroundColor: '#F9FAFB',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 24,
                  gap: 12,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, color: COLORS.mutedForeground }}>Возраст</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: COLORS.foreground,
                    }}
                  >
                    {selectedCourse.age_min}-{selectedCourse.age_max} лет
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ fontSize: 13, color: COLORS.mutedForeground }}>Стоимость</Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: '700',
                      color: COLORS.foreground,
                    }}
                  >
                    {selectedCourse.price != null
                      ? `${formatKZT(selectedCourse.price)}/мес`
                      : '— ₸/мес'}
                  </Text>
                </View>
              </View>

              <PressableScale
                onPress={onRequestEnrollment}
                disabled={isRequested}
                style={{
                  backgroundColor: isRequested ? '#E5E7EB' : COLORS.primary,
                  paddingVertical: 18,
                  borderRadius: 20,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  ...SHADOWS.md,
                }}
              >
                <Feather
                  name={isRequested ? 'check' : 'send'}
                  size={18}
                  color={isRequested ? '#9CA3AF' : 'white'}
                />
                <Text
                  style={{
                    color: isRequested ? '#9CA3AF' : 'white',
                    fontSize: 16,
                    fontWeight: '800',
                  }}
                >
                  {isRequested
                    ? 'Заявка отправлена'
                    : requiresParentApproval
                      ? 'Отправить запрос родителю'
                      : 'Отправить заявку'}
                </Text>
              </PressableScale>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
