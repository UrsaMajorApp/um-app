// Экран organization/verification: загружает и показывает верификацию организации в кабинете организации.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useOrgProfile } from '$hooks/useOrgData';
import { type OrgVerificationDocKey, useOrgVerification } from '$hooks/useOrgVerification';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { FeatherIconName } from '$types/icons';

export default function OrgVerificationScreen() {
  const router = useRouter();
  const isDesktop = useIsDesktop();
  const horizontalPadding = getDashboardHorizontalPadding(isDesktop, 20);
  const { id: orgId, status: orgStatus, refresh: refreshOrgProfile } = useOrgProfile();
  const verification = useOrgVerification({
    orgId,
    refreshOrgProfile,
  });

  // Already submitted
  if (orgStatus === 'ready_for_review' || verification.submitted) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <SafeAreaView edges={['top']}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 16,
            }}
          >
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
              <Feather name="arrow-left" size={22} color={COLORS.foreground} />
            </TouchableOpacity>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: COLORS.foreground,
              }}
            >
              Верификация
            </Text>
          </View>
        </SafeAreaView>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
          }}
        >
          <MotiView
            from={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
            style={{ alignItems: 'center' }}
          >
            <View
              style={{
                width: 96,
                height: 96,
                borderRadius: 48,
                backgroundColor: '#FEF9C3',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Feather name="clock" size={48} color="#854D0E" />
            </View>
            <Text
              style={{
                fontSize: 22,
                fontWeight: '900',
                color: COLORS.foreground,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              Документы на проверке
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: COLORS.mutedForeground,
                textAlign: 'center',
                lineHeight: 22,
              }}
            >
              Администратор рассматривает вашу заявку. Обычно это занимает до 24 часов.
            </Text>
          </MotiView>
        </View>
      </View>
    );
  }

  const DOC_SLOTS: {
    key: OrgVerificationDocKey;
    label: string;
    hint: string;
    icon: FeatherIconName;
  }[] = [
    {
      key: 'bin_doc',
      label: 'Свидетельство о регистрации (БИН)',
      hint: 'PDF или JPG до 10MB',
      icon: 'file-text',
    },
    {
      key: 'registration_doc',
      label: 'Справка о государственной регистрации',
      hint: 'PDF или JPG до 10MB',
      icon: 'award',
    },
    {
      key: 'license_doc',
      label: 'Образовательная лицензия',
      hint: 'PDF или JPG до 10MB',
      icon: 'book-open',
    },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <SafeAreaView edges={['top']} style={{ backgroundColor: COLORS.background }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: 16,
          }}
        >
          <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
            <Feather name="arrow-left" size={22} color={COLORS.foreground} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: '800',
                color: COLORS.foreground,
              }}
            >
              Верификация
            </Text>
            <Text style={{ fontSize: 12, color: COLORS.mutedForeground }}>Шаг 2 из 3</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingBottom: 60,
          maxWidth: isDesktop ? LAYOUT.dashboardHorizontalPaddingDesktop * 10 : undefined,
          alignSelf: 'center',
          width: '100%',
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Info banner */}
        <View
          style={{
            backgroundColor: '#EDE9FE',
            borderRadius: RADIUS.lg,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
            marginBottom: 24,
          }}
        >
          <Feather name="info" size={18} color="#6C5CE7" style={{ marginTop: 1 }} />
          <Text style={{ flex: 1, fontSize: 13, color: '#5B21B6', lineHeight: 20 }}>
            После проверки документов ваша организация получит синюю галочку, появится в поиске, и
            ИИ начнёт рекомендовать ваши курсы.
          </Text>
        </View>

        {/* BIN field */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: RADIUS.xl,
            padding: 20,
            marginBottom: 16,
            ...SHADOWS.sm,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: COLORS.foreground,
              marginBottom: 4,
            }}
          >
            БИН организации
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: COLORS.mutedForeground,
              marginBottom: 12,
            }}
          >
            12-значный бизнес-идентификационный номер
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={verification.bin}
              onChangeText={verification.setFormattedBin}
              placeholder="000000000000"
              placeholderTextColor={COLORS.mutedForeground}
              keyboardType="number-pad"
              maxLength={12}
              style={{
                backgroundColor: '#F9FAFB',
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor:
                  verification.bin.length > 0
                    ? verification.binValid
                      ? '#10B981'
                      : '#EF4444'
                    : '#E5E7EB',
                paddingHorizontal: 16,
                paddingVertical: 13,
                paddingRight: 48,
                fontSize: 18,
                fontWeight: '700',
                letterSpacing: 2,
                color: COLORS.foreground,
              }}
            />
            <View
              style={{
                position: 'absolute',
                right: 14,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
              }}
            >
              {verification.bin.length > 0 && (
                <Feather
                  name={verification.binValid ? 'check-circle' : 'x-circle'}
                  size={20}
                  color={verification.binValid ? '#10B981' : '#EF4444'}
                />
              )}
            </View>
          </View>
          {verification.bin.length > 0 && !verification.binValid && (
            <Text style={{ fontSize: 11, color: '#EF4444', marginTop: 6 }}>
              БИН должен содержать ровно 12 цифр ({verification.bin.length}/12)
            </Text>
          )}
        </View>

        {/* Document uploads */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: RADIUS.xl,
            padding: 20,
            marginBottom: 16,
            ...SHADOWS.sm,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: '700',
              color: COLORS.foreground,
              marginBottom: 16,
            }}
          >
            Документы
          </Text>
          <View style={{ gap: 12 }}>
            {DOC_SLOTS.map((slot) => {
              const uploaded = verification.docs[slot.key];
              return (
                <TouchableOpacity
                  key={slot.key}
                  onPress={() => verification.toggleDoc(slot.key)}
                  activeOpacity={0.8}
                  style={{
                    borderWidth: 2,
                    borderStyle: uploaded ? 'solid' : 'dashed',
                    borderColor: uploaded ? '#10B981' : '#DDD6FE',
                    borderRadius: RADIUS.lg,
                    padding: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: uploaded ? '#F0FDF4' : '#F5F3FF',
                    gap: 14,
                  }}
                >
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      backgroundColor: uploaded ? '#10B98120' : '#6C5CE720',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Feather
                      name={uploaded ? 'check' : slot.icon}
                      size={20}
                      color={uploaded ? '#10B981' : '#6C5CE7'}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '700',
                        color: uploaded ? '#166534' : COLORS.foreground,
                      }}
                    >
                      {slot.label}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: uploaded ? '#16A34A' : COLORS.mutedForeground,
                        marginTop: 2,
                      }}
                    >
                      {uploaded ? 'Файл загружен' : slot.hint}
                    </Text>
                  </View>
                  {!uploaded && <Feather name="upload" size={18} color="#6C5CE7" />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Public offer */}
        <View
          style={{
            backgroundColor: 'white',
            borderRadius: RADIUS.xl,
            padding: 20,
            marginBottom: 24,
            ...SHADOWS.sm,
          }}
        >
          <TouchableOpacity
            onPress={verification.toggleOfferAccepted}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                borderWidth: 2,
                borderColor: verification.offerAccepted ? '#6C5CE7' : '#D1D5DB',
                backgroundColor: verification.offerAccepted ? '#6C5CE7' : 'white',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 1,
              }}
            >
              {verification.offerAccepted && <Feather name="check" size={14} color="white" />}
            </View>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                color: COLORS.foreground,
                lineHeight: 22,
              }}
            >
              Я принимаю условия{' '}
              <Text
                style={{
                  color: '#6C5CE7',
                  fontWeight: '700',
                  textDecorationLine: 'underline',
                }}
              >
                Публичной оферты
              </Text>{' '}
              платформы UM. Это заменяет бумажный договор.
            </Text>
          </TouchableOpacity>
        </View>

        {verification.error && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              backgroundColor: '#FEE2E2',
              borderRadius: RADIUS.md,
              padding: 12,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: '#FCA5A5',
            }}
          >
            <Text
              style={{
                color: '#B91C1C',
                fontSize: 13,
                fontWeight: '600',
                textAlign: 'center',
              }}
            >
              {verification.error}
            </Text>
          </MotiView>
        )}

        <TouchableOpacity
          onPress={verification.submit}
          disabled={verification.submitting || !verification.canSubmit}
          style={{
            opacity: !verification.canSubmit ? 0.5 : 1,
            borderRadius: RADIUS.xl,
            overflow: 'hidden',
            ...SHADOWS.md,
          }}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#6C5CE7', '#8B7FE8']}
            style={{
              paddingVertical: 18,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
              gap: 8,
            }}
          >
            {verification.submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Feather name="send" size={18} color="white" />
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  Отправить на проверку
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
