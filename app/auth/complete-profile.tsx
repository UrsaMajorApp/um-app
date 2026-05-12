// Завершение профиля: просит OAuth-пользователя выбрать роль и дозаполнить обязательные данные.
/**
 * /auth/complete-profile
 *
 * Shown to new users who signed in via Google OAuth and don't yet have a
 * um_user_profiles row.  They pick their role here; the AuthContext then
 * upserts their profile and routes them to the role-specific setup screen.
 */

import { AntDesign, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { MotiView } from 'moti';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PressableScale } from '$components/ui/PressableScale';
import { AUTH_ROLE_OPTIONS } from '$constants/authRoleOptions';
import { COLORS, LAYOUT, RADIUS, SHADOWS } from '$constants/theme';
import type { UserRole } from '$contexts/AuthContext';
import { useAuth } from '$contexts/AuthContext';
import { useIsDesktop } from '$lib/useIsDesktop';

export default function CompleteProfile() {
  const router = useRouter();
  const { user, setUserRole, logout, isLoading } = useAuth();
  const isDesktop = useIsDesktop();
  const horizontalPadding = isDesktop
    ? LAYOUT.authHorizontalPaddingDesktop
    : LAYOUT.authHorizontalPaddingMobile;

  const [selectedRole, setSelectedRole] = useState<UserRole>(
    user?.hasSelectedRole ? user.role : 'parent',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isLoading)
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );

  const currentRoleInfo = AUTH_ROLE_OPTIONS.find((r) => r.role === selectedRole)!;

  const handleContinue = async () => {
    setIsSubmitting(true);
    try {
      await setUserRole(selectedRole);
      router.push(currentRoleInfo.route);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(' ') : '';

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            paddingVertical: 24,
          }}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              flex: 1,
              width: '100%',
              maxWidth: isDesktop ? LAYOUT.authMaxWidth : undefined,
              paddingHorizontal: horizontalPadding,
            }}
          >
            {/* Header */}
            <MotiView
              from={{ opacity: 0, translateY: 12 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ duration: 500 }}
              style={{ marginBottom: 32, alignItems: 'center' }}
            >
              {/* Google badge */}
              <View style={styles.googleBadge}>
                <AntDesign name="google" size={18} color="#4285F4" />
                <Text style={styles.googleBadgeText}>Вход через Google</Text>
              </View>

              <Text style={styles.title}>
                {displayName ? `Добро пожаловать,\n${displayName}!` : 'Добро пожаловать!'}
              </Text>
              <Text style={styles.subtitle}>{user?.email ? user.email : ''}</Text>
              <Text style={styles.instruction}>Выберите вашу роль, чтобы продолжить</Text>
            </MotiView>

            {/* Role cards */}
            <View style={{ gap: 12, marginBottom: 32 }}>
              {AUTH_ROLE_OPTIONS.map((item, idx) => {
                const isSelected = selectedRole === item.role;
                return (
                  <MotiView
                    key={item.role}
                    from={{ opacity: 0, translateX: -10 }}
                    animate={{ opacity: 1, translateX: 0 }}
                    transition={{ delay: 100 + idx * 60, duration: 400 }}
                  >
                    <PressableScale onPress={() => setSelectedRole(item.role)} scaleTo={0.98}>
                      <View
                        style={[
                          styles.roleCard,
                          isSelected && {
                            borderColor: item.color,
                            borderWidth: 2,
                            backgroundColor: `${item.color}08`,
                          },
                        ]}
                      >
                        <LinearGradient
                          colors={item.gradient}
                          style={[styles.roleIcon, isSelected && styles.roleIconSelected]}
                        >
                          <Feather name={item.icon} size={22} color="white" />
                        </LinearGradient>

                        <View style={{ flex: 1 }}>
                          <Text style={[styles.roleTitle, isSelected && { color: item.color }]}>
                            {item.title}
                          </Text>
                          <Text style={styles.roleDesc}>{item.description}</Text>
                        </View>

                        {isSelected && (
                          <View style={[styles.checkCircle, { backgroundColor: item.color }]}>
                            <Feather name="check" size={14} color="white" />
                          </View>
                        )}
                      </View>
                    </PressableScale>
                  </MotiView>
                );
              })}
            </View>

            {/* Continue button */}
            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 400 }}
            >
              <PressableScale onPress={handleContinue} disabled={isSubmitting}>
                <LinearGradient
                  colors={currentRoleInfo.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueBtn}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                      }}
                    >
                      <Text style={styles.continueBtnText}>Продолжить</Text>
                      <Feather name="arrow-right" size={20} color="white" />
                    </View>
                  )}
                </LinearGradient>
              </PressableScale>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 8 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 500 }}
            >
              <Text style={styles.note}>Вы сможете изменить роль позже в настройках профиля</Text>

              <PressableScale onPress={() => logout()} style={styles.signOutBtn} scaleTo={0.97}>
                <Feather name="log-out" size={15} color="#EF4444" />
                <Text style={styles.signOutText}>Выйти из аккаунта</Text>
              </PressableScale>
            </MotiView>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  googleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F7FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  googleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.foreground,
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 34,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.mutedForeground,
    fontWeight: '500',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 15,
    color: COLORS.mutedForeground,
    textAlign: 'center',
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'white',
    borderRadius: RADIUS.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconSelected: {
    ...SHADOWS.md,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 2,
  },
  roleDesc: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    lineHeight: 16,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    height: 60,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.3,
  },
  note: {
    textAlign: 'center',
    color: COLORS.mutedForeground,
    fontSize: 12,
    marginTop: 16,
    opacity: 0.7,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 40,
    paddingVertical: 14,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
  },
});
