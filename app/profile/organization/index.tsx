import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useEffect, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useOrgProfile } from '$hooks/useOrgData';
import { isSupabaseConfigured, supabase } from '$lib/supabase';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function OrgProfile() {
  const { logout } = useAuth();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.profileHorizontalPaddingDesktop
    : LAYOUT.profileHorizontalPaddingMobile;

  const {
    id: orgId,
    name: orgName,
    status: orgStatus,
    bin: currentBin,
    refresh: refreshProfile,
  } = useOrgProfile();

  const [bin, setBin] = useState(currentBin || '');
  const [hasAcceptedOffer, setHasAcceptedOffer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (currentBin) setBin(currentBin);
  }, [currentBin]);

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      await logout();
    } else {
      Alert.alert('Выход', 'Вы действительно хотите выйти?', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]);
    }
  };

  const handleVerify = async () => {
    if (bin.length !== 12) {
      Alert.alert('Ошибка', 'БИН должен состоять из 12 цифр');
      return;
    }
    if (!hasAcceptedOffer) {
      Alert.alert('Внимание', 'Необходимо принять условия публичной оферты');
      return;
    }

    setSubmitting(true);
    try {
      if (supabase && isSupabaseConfigured) {
        const { error } = await supabase
          .from('organizations')
          .update({
            bin: bin,
            status: 'pending', // Move to pending for admin review
            license_url: null,
            registration_url: null,
          })
          .eq('id', orgId);

        if (error) throw error;

        await refreshProfile();
        Alert.alert('Успешно', 'Данные отправлены на верификацию');
      }
    } catch (e: unknown) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Не удалось отправить данные');
    } finally {
      setSubmitting(false);
    }
  };

  const isVerified = orgStatus === 'verified';
  const isPending = orgStatus === 'pending';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Premium Header */}
      <View style={{ backgroundColor: '#4F46E5', overflow: 'hidden' }}>
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 40 }}
        >
          <SafeAreaView edges={['top']}>
            <View style={{ paddingHorizontal: horizontalPadding, paddingTop: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: '800',
                    color: 'white',
                    opacity: 0.8,
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}
                >
                  Настройки профиля
                </Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutIconBtn}>
                  <Feather name="log-out" size={20} color="white" />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <View style={styles.avatarBox}>
                  <Text style={styles.avatarText}>{(orgName || 'O').charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orgNameHeadline} numberOfLines={1}>
                    {orgName || 'Моя организация'}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      isVerified
                        ? styles.statusBadgeVerified
                        : isPending
                          ? styles.statusBadgePending
                          : styles.statusBadgeNew,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: isVerified
                            ? '#34C759'
                            : isPending
                              ? '#FFCC00'
                              : '#8E8E93',
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        {
                          color: isVerified ? '#34C759' : isPending ? '#854D0E' : '#8E8E93',
                        },
                      ]}
                    >
                      {isVerified ? 'Верифицирован' : isPending ? 'На проверке' : 'Новый профиль'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: horizontalPadding,
          paddingTop: 32,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Stage 2: Verification Section (Prompt if not verified) */}
        {!isVerified && !isPending && (
          <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.verificationCard}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: 'white' }]}>
                <Feather name="shield" size={20} color={COLORS.primary} />
              </View>
              <Text style={[styles.cardTitle, { color: 'white' }]}>Верификация данных</Text>
            </View>

            <Text style={styles.verificationSub}>
              Загрузите документы, чтобы получить статус проверенной организации и начать принимать
              оплаты.
            </Text>

            <View style={{ gap: 16 }}>
              <View>
                <Text style={[styles.inputLabel, { color: 'white', opacity: 0.9 }]}>
                  БИН организации (12 цифр)
                </Text>
                <TextInput
                  value={bin}
                  onChangeText={(t) => setBin(t.replace(/[^\d]/g, '').slice(0, 12))}
                  placeholder="123456789012"
                  placeholderTextColor="rgba(255,255,255,0.4)"
                  keyboardType="numeric"
                  style={styles.verificationInput}
                />
              </View>

              {/* Upload Buttons */}
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.uploadBtn}>
                  <Feather name="file-text" size={16} color="white" />
                  <Text style={styles.uploadBtnText}>Справка гос. рег.</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.uploadBtn}>
                  <Feather name="award" size={16} color="white" />
                  <Text style={styles.uploadBtnText}>Лицензия</Text>
                </TouchableOpacity>
              </View>

              {/* Offer Acceptance */}
              <TouchableOpacity
                onPress={() => setHasAcceptedOffer(!hasAcceptedOffer)}
                activeOpacity={0.7}
                style={styles.checkboxContainer}
              >
                <View style={[styles.checkbox, hasAcceptedOffer && styles.checkboxActive]}>
                  {hasAcceptedOffer && <Feather name="check" size={12} color={COLORS.primary} />}
                </View>
                <Text style={styles.checkboxLabel}>
                  Я принимаю условия{' '}
                  <Text style={{ textDecorationLine: 'underline' }}>публичной оферты</Text>
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleVerify}
                disabled={submitting}
                style={[styles.verifyActionBtn, submitting && { opacity: 0.7 }]}
              >
                <Text style={styles.verifyActionBtnText}>
                  {submitting ? 'Отправка...' : 'Отправить на проверку'}
                </Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        )}

        {isPending && (
          <View
            style={[
              styles.card,
              {
                backgroundColor: '#FFFBEB',
                borderColor: '#FEF3C7',
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  backgroundColor: '#FEF3C7',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Feather name="clock" size={24} color="#854D0E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: '#854D0E' }}>
                  Документы проверяются
                </Text>
                <Text style={{ fontSize: 13, color: '#92400E', marginTop: 2 }}>
                  Это обычно занимает 1-2 рабочих дня.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color={COLORS.destructive} />
          <Text style={styles.logoutBtnText}>Выйти из аккаунта</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarBox: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  orgNameHeadline: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusBadgeVerified: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  statusBadgePending: {
    backgroundColor: 'rgba(255, 204, 0, 0.15)',
    borderColor: 'rgba(255, 204, 0, 0.3)',
  },
  statusBadgeNew: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  verificationCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xxl,
    padding: 24,
    marginBottom: 32,
    ...SHADOWS.md,
  },
  verificationSub: {
    fontSize: 14,
    color: 'white',
    opacity: 0.8,
    lineHeight: 20,
    marginBottom: 24,
  },
  verificationInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  uploadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  uploadBtnText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: 'white',
    borderColor: 'white',
  },
  checkboxLabel: {
    fontSize: 13,
    color: 'white',
    fontWeight: '500',
  },
  verifyActionBtn: {
    backgroundColor: 'white',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.sm,
  },
  verifyActionBtnText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: RADIUS.xxl,
    padding: 24,
    marginBottom: 24,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: COLORS.muted,
  },
  settingIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${COLORS.destructive}10`,
    paddingVertical: 20,
    borderRadius: 22,
    marginTop: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: `${COLORS.destructive}20`,
  },
  logoutBtnText: {
    color: COLORS.destructive,
    fontSize: 16,
    fontWeight: '800',
  },
});
