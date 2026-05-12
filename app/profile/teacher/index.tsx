// Экран профиля teacher: показывает основную страницу раздела для роли преподавателя.
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SHADOWS } from '$constants/theme';
import { useAuth } from '$contexts/AuthContext';
import { getDashboardHorizontalPadding, useIsDesktop } from '$lib/useIsDesktop';

export default function TeacherProfile() {
  const { logout, user } = useAuth();
  const isDesktop = useIsDesktop();
  const paddingX = getDashboardHorizontalPadding(isDesktop);

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

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Учитель';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F7FF' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <LinearGradient
            colors={COLORS.gradients.header}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <View style={{ paddingHorizontal: paddingX, paddingTop: 20 }}>
              <Text style={styles.headerTitle}>Мой профиль</Text>
              <Text style={styles.headerSubtitle}>Учитель</Text>
            </View>
          </LinearGradient>

          {/* Profile Main Card */}
          <View style={[styles.profileCard, { marginHorizontal: paddingX }]}>
            <View style={styles.avatarArea}>
              <View style={styles.avatarCircle}>
                <LinearGradient colors={['#6C5CE7', '#A78BFA']} style={styles.avatarGradient}>
                  <Feather name="user" size={40} color="white" />
                </LinearGradient>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Активен</Text>
                </View>
              </View>
              <Text style={styles.profileName}>{displayName}</Text>
              <Text style={styles.specialization}>Робототехника и программирование</Text>

              {/* Rating Display */}
              <View style={styles.ratingRow}>
                <Feather name="star" size={20} color="#FBBF24" fill="#FBBF24" />
                <Text style={styles.ratingVal}>4.8</Text>
                <Text style={styles.ratingLabel}>рейтинг</Text>
              </View>
            </View>

            {/* Contact Info Section */}
            <View style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Контактная информация</Text>
              <View style={styles.infoRow}>
                <View style={[styles.iconBox, { backgroundColor: '#F5F3FF' }]}>
                  <Feather name="phone" size={18} color="#6C5CE7" />
                </View>
                <View>
                  <Text style={styles.infoRowLabel}>Телефон</Text>
                  <Text style={styles.infoRowVal}>{user?.phone || '+7 (999) 123-45-67'}</Text>
                </View>
              </View>
              <View style={[styles.infoRow, { marginTop: 16 }]}>
                <View style={[styles.iconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Feather name="mail" size={18} color="#2563EB" />
                </View>
                <View>
                  <Text style={styles.infoRowLabel}>Email</Text>
                  <Text style={styles.infoRowVal}>
                    {user?.phone ? `${user.phone}@um.app` : 'marat@um.app'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Organization Section */}
            <View style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Организация</Text>
              <LinearGradient colors={['#FFFBEB', '#FEF3C7']} style={styles.orgBox}>
                <View style={styles.orgLogo}>
                  <Feather name="home" size={24} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orgName}>Образовательный центр "Робототехника"</Text>
                  <Text style={styles.orgType}>Детский образовательный центр</Text>
                </View>
              </LinearGradient>
            </View>

            {/* Achievement Stats */}
            <View style={styles.divider} />
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Достижения</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#F5F3FF' }]}>
                    <Feather name="award" size={20} color="#6C5CE7" />
                  </View>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Группы</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#EFF6FF' }]}>
                    <Feather name="users" size={20} color="#2563EB" />
                  </View>
                  <Text style={styles.statValue}>84</Text>
                  <Text style={styles.statLabel}>Учеников</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={[styles.statIcon, { backgroundColor: '#FFFBEB' }]}>
                    <Feather name="star" size={20} color="#D97706" />
                  </View>
                  <Text style={styles.statValue}>4.8</Text>
                  <Text style={styles.statLabel}>Рейтинг</Text>
                </View>
              </View>
            </View>

            {/* Logout Button */}
            <View style={styles.divider} />
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Feather name="log-out" size={20} color="#EF4444" />
              <Text style={styles.logoutText}>Выйти из аккаунта</Text>
            </TouchableOpacity>
          </View>

          {/* Registration Date */}
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={styles.footer}>
            <Text style={styles.footerText}>
              Дата регистрации:{' '}
              {new Date().toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </MotiView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingBottom: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: 32,
    marginTop: -32,
    ...SHADOWS.lg,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    paddingBottom: 24,
  },
  avatarArea: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    padding: 4,
    ...SHADOWS.md,
    marginBottom: 16,
  },
  avatarGradient: {
    flex: 1,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'white',
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.foreground,
  },
  specialization: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  ratingVal: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  ratingLabel: {
    fontSize: 13,
    color: COLORS.mutedForeground,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 24,
  },
  infoSection: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.foreground,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowLabel: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    fontWeight: '500',
  },
  infoRowVal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
    marginTop: 2,
  },
  orgBox: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  orgLogo: {
    width: 48,
    height: 48,
    backgroundColor: 'white',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.sm,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.foreground,
  },
  orgType: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.foreground,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.mutedForeground,
    marginTop: 2,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    margin: 24,
    padding: 18,
    borderRadius: 20,
    gap: 10,
  },
  logoutText: {
    color: '#EF4444',
    fontWeight: '800',
    fontSize: 15,
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.mutedForeground,
    opacity: 0.7,
  },
});
