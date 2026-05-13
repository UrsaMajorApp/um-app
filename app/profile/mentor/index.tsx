// Экран профиля mentor: показывает основную страницу раздела для роли ментора.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import {
  Alert, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { PressableScale } from '$components/ui/PressableScale';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { useMentorOwnProfile, useMentorProfileStats } from '$hooks/useMentorData';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';
import type { FeatherIconName } from '$types/icons';

export default function MentorProfile() {
  const { logout, user } = useAuth();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

  const { stats } = useMentorProfileStats();
  const { profile: mentorProfile, updateProfile } = useMentorOwnProfile();
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    specialization: '',
    bio: '',
  });

  React.useEffect(() => {
    if (mentorProfile) {
      setEditForm((prev) => ({
        ...prev,
        specialization: mentorProfile.specialization ?? '',
        bio: mentorProfile.bio ?? '',
      }));
    }
  }, [mentorProfile]);

  const handleUpdateProfile = async () => {
    const { error } = await updateProfile({
      specialization: editForm.specialization || null,
      bio: editForm.bio || null,
    });
    setShowEditModal(false);
    if (error) {
      Alert.alert('Ошибка', error);
    } else {
      Alert.alert('Успех', 'Профиль обновлен');
    }
  };

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

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Ментор';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ zIndex: 10 }}>
        <LinearGradient
          colors={COLORS.gradients.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingBottom: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <SafeAreaView edges={['top']}>
            <View style={{ paddingHorizontal: paddingX, paddingTop: 12 }}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: '800',
                    color: 'white',
                    flex: 1,
                  }}
                >
                  Профиль ментора
                </Text>
                <PressableScale onPress={() => setShowEditModal(true)}>
                  <Text
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      fontSize: 13,
                      fontWeight: '600',
                    }}
                  >
                    Изм.
                  </Text>
                </PressableScale>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: paddingX,
          paddingTop: 160,
          paddingBottom: 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatarContainer}>
              <LinearGradient colors={['#6C5CE7', '#8B7FE8']} style={styles.avatarGradient}>
                <Text style={styles.avatarText}>{displayName.charAt(0)}</Text>
              </LinearGradient>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {editForm.firstName} {editForm.lastName}
              </Text>
              {editForm.specialization ? (
                <Text style={styles.profileRole}>Ментор • {editForm.specialization}</Text>
              ) : null}
              {mentorProfile?.rating ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4,
                  }}
                >
                  <Feather name="star" size={14} color="#FBBF24" />
                  <Text style={styles.ratingText}>{mentorProfile.rating.toFixed(1)}</Text>
                </View>
              ) : null}
            </View>
            <PressableScale onPress={() => setShowEditModal(true)}>
              <Feather name="edit-3" size={20} color={COLORS.primary} />
            </PressableScale>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{mentorProfile?.sessions ?? 0}</Text>
              <Text style={styles.statLabel}>Сессий</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: '#F5F3FF' }]}>
              <Text style={[styles.statValue, { color: COLORS.primary }]}>
                {stats.studentCount}
              </Text>
              <Text style={styles.statLabel}>Учеников</Text>
            </View>
            {mentorProfile?.experience ? (
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{mentorProfile.experience}</Text>
                <Text style={styles.statLabel}>Опыт</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Accept Orders Toggle */}
        <View style={styles.toggleCard}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isAcceptingOrders ? '#10B981' : '#9CA3AF',
                  },
                ]}
              />
              <Text style={styles.toggleTitle}>Принимаю заказы</Text>
            </View>
            <Text style={styles.toggleSub}>
              {isAcceptingOrders ? 'Вы видны в поиске' : 'Режим отпуска'}
            </Text>
          </View>
          <PressableScale
            onPress={() => setIsAcceptingOrders(!isAcceptingOrders)}
            style={[styles.toggleSwitch, isAcceptingOrders && styles.toggleSwitchActive]}
          >
            <MotiView
              animate={{ translateX: isAcceptingOrders ? 22 : 0 }}
              style={styles.toggleThumb}
            />
          </PressableScale>
        </View>

        {/* Contact Info Card */}
        {user?.email || user?.phone ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Контактная информация</Text>
            <View style={{ gap: 16 }}>
              {user?.email ? <InfoRow icon="mail" label={user.email} /> : null}
              {user?.phone ? <InfoRow icon="phone" label={user.phone} /> : null}
            </View>
          </View>
        ) : null}

        {/* Professional Info Card */}
        {editForm.specialization || mentorProfile?.education ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Профессиональная информация</Text>
            <View style={{ gap: 20 }}>
              {editForm.specialization ? (
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Специализация</Text>
                  <Text style={styles.infoValue}>{editForm.specialization}</Text>
                </View>
              ) : null}
              {mentorProfile?.education ? (
                <View style={{ flex: 1 }}>
                  <Text style={styles.infoLabel}>Образование</Text>
                  <Text style={styles.infoValue}>{mentorProfile.education}</Text>
                </View>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* Bio */}
        {editForm.bio ? (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>О себе</Text>
            <Text style={styles.bioText}>{editForm.bio}</Text>
          </View>
        ) : null}

        {/* Logout */}
        <PressableScale onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Выйти из аккаунта</Text>
        </PressableScale>
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={showEditModal} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
          <ScrollView style={{ padding: 24 }} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Редактировать профиль</Text>
              <PressableScale onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={24} color={COLORS.foreground} />
              </PressableScale>
            </View>

            <View style={{ gap: 20, marginTop: 32, paddingBottom: 60 }}>
              <View>
                <Text style={styles.inputLabel}>ИМЯ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.firstName}
                  onChangeText={(v) => setEditForm({ ...editForm, firstName: v })}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>ФАМИЛИЯ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.lastName}
                  onChangeText={(v) => setEditForm({ ...editForm, lastName: v })}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>СПЕЦИАЛИЗАЦИЯ</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editForm.specialization}
                  onChangeText={(v) => setEditForm({ ...editForm, specialization: v })}
                />
              </View>
              <View>
                <Text style={styles.inputLabel}>О СЕБЕ</Text>
                <TextInput
                  style={[styles.modalInput, { height: 100, textAlignVertical: 'top' }]}
                  value={editForm.bio}
                  onChangeText={(v) => setEditForm({ ...editForm, bio: v })}
                  multiline
                />
              </View>

              <PressableScale onPress={handleUpdateProfile} style={styles.saveProfileBtn}>
                <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>СОХРАНИТЬ</Text>
              </PressableScale>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label }: { icon: FeatherIconName; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={styles.iconCircle}>
        <Feather name={icon} size={16} color={COLORS.primary} />
      </View>
      <Text style={{ fontSize: 15, color: COLORS.foreground, fontWeight: '500' }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#F1F5F9',
  },
  avatarGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '800', color: 'white' },
  profileName: { fontSize: 20, fontWeight: '900', color: COLORS.foreground },
  profileRole: { fontSize: 14, color: COLORS.mutedForeground, marginTop: 2 },
  ratingText: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    marginLeft: 6,
    fontWeight: '600',
  },
  statsGrid: { flexDirection: 'row', gap: 12, marginTop: 24 },
  statBox: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statValue: { fontSize: 18, fontWeight: '800', color: COLORS.foreground },
  statLabel: { fontSize: 11, color: COLORS.mutedForeground, marginTop: 4 },
  toggleCard: {
    backgroundColor: '#F5F3FF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  toggleTitle: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  toggleSub: {
    fontSize: 12,
    color: COLORS.primary,
    opacity: 0.7,
    marginTop: 2,
  },
  toggleSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#D1D5DB',
    padding: 4,
  },
  toggleSwitchActive: { backgroundColor: '#10B981' },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
  },
  sectionCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
    ...SHADOWS.sm,
    borderWidth: 1,
    borderColor: '#F9FAFB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 20,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F3FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  infoValue: { fontSize: 15, fontWeight: '700', color: COLORS.foreground },
  bioText: {
    fontSize: 15,
    color: COLORS.foreground,
    lineHeight: 22,
    opacity: 0.8,
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: { color: '#EF4444', fontWeight: '800', fontSize: 16 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.mutedForeground,
    marginBottom: 8,
    letterSpacing: 1,
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.foreground,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  saveProfileBtn: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    ...SHADOWS.md,
  },
});
